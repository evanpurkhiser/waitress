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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tree)
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
	if os.IsNotExist(err) || file.IsDir() {
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
