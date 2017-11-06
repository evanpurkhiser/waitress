package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"time"

	"github.com/GeertJohan/go.rice"
	"github.com/gorilla/mux"
	"github.com/rjeczalik/notify"
)

var root = flag.String("root", ".", "The root file path to serve files from")

// FileTree represents a list of files
type FileTree map[string]*Item

// Item represents a single file tree item
type Item struct {
	Size     int64     `json:"size"`
	Modified time.Time `json:"modified"`
	IsDir    bool      `json:"isDir,omitempty"`
	IsLink   bool      `json:"isLink,omitempty"`
	Children *FileTree `json:"children,omitempty"`
	Parent   *Item     `json:"-"`
}

var (
	tree     *FileTree
	treeJSON []byte
)

func buildIndex(rootPath string, parent *Item) (*FileTree, error) {
	entries, err := ioutil.ReadDir(rootPath)
	if err != nil {
		return nil, err
	}

	target := make(FileTree, len(entries))

	for _, entry := range entries {
		name := entry.Name()

		item := &Item{
			IsDir:    entry.IsDir(),
			IsLink:   entry.Mode()&os.ModeSymlink != 0,
			Modified: entry.ModTime(),
			Size:     entry.Size(),
			Parent:   parent,
		}

		target[name] = item

		if !item.IsDir && !item.IsLink {
			continue
		}

		entryPath := filepath.Join(rootPath, name)

		if item.IsLink {
			entryPath, _ = filepath.EvalSymlinks(entryPath)

			linkStat, err := os.Stat(entryPath)
			if err != nil || !linkStat.IsDir() {
				continue
			}

			item.IsDir = true
		}

		children, err := buildIndex(entryPath, item)
		if err != nil {
			return nil, err
		}

		target[name].Children = children
	}

	return &target, nil
}

func computeSizes(target *Item) int64 {
	if !target.IsDir {
		return target.Size
	}

	target.Size = 0

	for _, item := range *target.Children {
		target.Size = target.Size + computeSizes(item)
	}

	return target.Size
}

func watchDirectory(rootPath string) error {
	events := make(chan notify.EventInfo)

	watchEvents := []notify.Event{
		notify.Create,
		notify.Write,
		notify.Rename,
		notify.Remove,
	}

	// The '...' syntax is used in the notify library for recursive watching
	path := filepath.Join(rootPath, "...")

	if err := notify.Watch(path, events, watchEvents...); err != nil {
		return err
	}

	for eventInfo := range events {
		path := eventInfo.Path()
		fmt.Println(path)
	}

	return nil
}

func startup() error {
	root, _ := filepath.Abs(*root)

	fmt.Printf("Waiter now serving: %s\n", root)
	fmt.Println(" -> Building file tree...")

	tree, err := buildIndex(root, nil)
	if err != nil {
		return err
	}

	fmt.Println(" -> Computing directory sizes...")
	for _, item := range *tree {
		item.Size = computeSizes(item)
	}

	// Cache the JSON representation of the tree
	treeJSON, _ = json.Marshal(tree)

	fmt.Println(" -> Watching for file changes...")
	go watchDirectory(root)

	return nil
}

func getStaticHandler() http.Handler {
	box, _ := rice.FindBox("dist/_static")
	if box != nil {
		return http.StripPrefix("/_static", http.FileServer(box.HTTPBox()))
	}

	// Proxy to the development webpack server if no box is attached
	target, _ := url.Parse("http://localhost:9000/")

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

	r.HandleFunc("/index.json", func(w http.ResponseWriter, req *http.Request) {
		w.Write(treeJSON)
	})

	staticHandler := getStaticHandler()

	// Specific pattern match to allow for development webpack hot update json
	// and js files served from the webpack dev server.
	r.Handle("/{name:[0-9a-f.]+\\.hot-update\\.js(?:on)?}", staticHandler)

	// Serve static assets
	r.PathPrefix("/_static").Handler(staticHandler)

	// Serve file content
	r.NewRoute().HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !handleServeFile(w, r) {
			r.URL.Path = "/_static/"
			staticHandler.ServeHTTP(w, r)
		}
	})

	return r
}

func main() {
	flag.Parse()

	if err := startup(); err != nil {
		panic(err)
	}

	r := buildRoutes()

	fmt.Println(" -> Serving files on port 8000")
	http.ListenAndServe(":8000", r)
}
