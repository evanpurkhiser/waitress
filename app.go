package main

import (
	"embed"
	"encoding/json"
	"flag"
	"fmt"
	"io/fs"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path"
	"sort"
	"strings"

	"github.com/getsentry/sentry-go"
	sentryhttp "github.com/getsentry/sentry-go/http"
	"github.com/gorilla/mux"
)

var root = flag.String("root", ".", "The root file path to serve files from")
var port = flag.Int("port", 8000, "The port to run the server on")

func handleServeTree(w http.ResponseWriter, req *http.Request) {
	tree, err := BuildTree(*root, req.URL.Path)
	if err != nil && os.IsNotExist(err) {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if err != nil {
		panic(err)
	}

	// Check if client accepts markdown
	acceptHeader := req.Header.Get("Accept")
	if strings.Contains(acceptHeader, "text/markdown") {
		markdown := treeToMarkdown(tree, req.URL.Path)
		w.Header().Set("Content-Type", "text/markdown; charset=utf-8")
		w.Write([]byte(markdown))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tree)
}

func treeToMarkdown(tree *File, urlPath string) string {
	var sb strings.Builder

	// Add header with path
	if urlPath == "/" || urlPath == "" {
		sb.WriteString("# Files\n\n")
	} else {
		sb.WriteString(fmt.Sprintf("# Files in %s\n\n", urlPath))
	}

	// Add navigation instructions
	sb.WriteString("Use this markdown view to see all available files and directories.\n")
	sb.WriteString("Download individual files by requesting them directly, or navigate to subdirectories.\n\n")

	// Find the actual directory to list
	var currentFile *File
	if urlPath == "/" || urlPath == "" {
		currentFile = tree
	} else {
		// Navigate to the target file in the tree
		currentFile = findFileInTree(tree, urlPath)
	}

	if currentFile == nil || !currentFile.IsDir {
		return "Not a directory\n"
	}

	// List files and directories
	if len(currentFile.Children) == 0 {
		sb.WriteString("*Empty directory*\n")
		return sb.String()
	}

	// Separate directories and files
	var dirs []string
	var files []string

	for name, file := range currentFile.Children {
		if file.IsDir {
			dirs = append(dirs, name)
		} else {
			files = append(files, name)
		}
	}

	sort.Strings(dirs)
	sort.Strings(files)

	// List directories first
	if len(dirs) > 0 {
		sb.WriteString("## Directories\n\n")
		for _, name := range dirs {
			cleanPath := strings.TrimSuffix(urlPath, "/")
			sb.WriteString(fmt.Sprintf("- 📁 **%s/** - [view](%s/%s/)\n", name, cleanPath, name))
		}
		sb.WriteString("\n")
	}

	// List files
	if len(files) > 0 {
		sb.WriteString("## Files\n\n")
		for _, name := range files {
			file := currentFile.Children[name]
			cleanPath := strings.TrimSuffix(urlPath, "/")
			sb.WriteString(fmt.Sprintf("- 📄 **%s** (%s) - [download](%s/%s)\n",
				name, formatSize(file.Size), cleanPath, name))
		}
	}

	return sb.String()
}

func findFileInTree(tree *File, targetPath string) *File {
	if targetPath == "/" || targetPath == "" {
		return tree
	}

	parts := strings.Split(strings.Trim(targetPath, "/"), "/")
	current := tree

	for _, part := range parts {
		if current.Children == nil {
			return nil
		}
		next, ok := current.Children[part]
		if !ok {
			return nil
		}
		current = next
	}

	return current
}

func formatSize(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

//go:embed dist/_static/*
var statics embed.FS

func getStaticsFs() http.FileSystem {
	staticsFs, _ := fs.Sub(statics, "dist/_static")

	if _, err := staticsFs.Open("index.html"); err != nil {
		return nil
	}
	return http.FS(staticsFs)
}

func getStaticHandler() http.Handler {
	if staticsFs := getStaticsFs(); staticsFs != nil {
		return http.StripPrefix("/_static", http.FileServer(staticsFs))
	}

	// Proxy to the development webpack server if no box is attached
	target, _ := url.Parse("http://localhost:8080/")

	return httputil.NewSingleHostReverseProxy(target)
}

func handleServeFile(w http.ResponseWriter, r *http.Request) bool {
	filePath := path.Join(*root, r.URL.Path)

	file, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		return false
	}

	// If it's a directory and markdown is accepted, handle as tree
	if file.IsDir() {
		acceptHeader := r.Header.Get("Accept")
		if strings.Contains(acceptHeader, "text/markdown") {
			handleServeTree(w, r)
			return true
		}
		return false
	}

	fileHandle, err := os.Open(filePath)
	if err != nil {
		panic(err)
	}

	defer fileHandle.Close()

	http.ServeContent(w, r, file.Name(), file.ModTime(), fileHandle)
	return true
}

func buildRoutes() *mux.Router {
	r := mux.NewRouter()

	staticHandler := getStaticHandler()
	treeHandler := handleServeTree
	fileHandler := func(w http.ResponseWriter, r *http.Request) {
		if !handleServeFile(w, r) {
			r.URL.Path = "/_static/"
			staticHandler.ServeHTTP(w, r)
		}
	}

	sentryHandler := sentryhttp.New(sentryhttp.Options{})

	treeHandler = sentryHandler.HandleFunc(treeHandler)
	fileHandler = sentryHandler.HandleFunc(fileHandler)

	// Specific pattern match to allow for development webpack hot update json
	// and js files served from the webpack dev server.
	r.Handle("/{name:[0-9a-f.]+\\.hot-update\\.js(?:on)?}", staticHandler)

	// Serve tree json
	r.PathPrefix("/_tree").Handler(
		http.StripPrefix("/_tree", http.HandlerFunc(treeHandler)),
	)

	// Serve static assets
	r.PathPrefix("/_static").Handler(staticHandler)

	// Serve file content
	r.NewRoute().HandlerFunc(fileHandler)

	return r
}

func setupSentry() {
	var env string

	if fs := getStaticsFs(); fs == nil {
		env = "development"
	} else {
		env = "production"
	}

	sentry.Init(sentry.ClientOptions{
		Dsn:         "https://2afa25599321471fbc5dd9610bd74804@sentry.io/1256756",
		Environment: env,
	})
}

func main() {
	setupSentry()
	flag.Parse()

	r := buildRoutes()

	serverPort := fmt.Sprintf(":%d", *port)
	fmt.Printf("Serving up %s on port %d\n", *root, *port)

	if err := http.ListenAndServe(serverPort, r); err != nil {
		fmt.Fprintf(os.Stderr, "error: %s\n", err)
		return
	}
}
