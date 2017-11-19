package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"time"

	"github.com/GeertJohan/go.rice"
	"github.com/gorilla/mux"
)

var root = flag.String("root", ".", "The root file path to serve files from")

// FileList represents a list of files
type FileList map[string]*Item

// Item represents a single file tree item
type Item struct {
	Size     int64     `json:"size"`
	Modified time.Time `json:"modified"`
	IsDir    bool      `json:"isDir,omitempty"`
	IsLink   bool      `json:"isLink,omitempty"`
	Children FileList  `json:"children,omitempty"`
	Parent   *Item     `json:"-"`
}

var (
	tree     *Item
	treeJSON []byte
)

func startup() error {
	root, _ := filepath.Abs(*root)

	fmt.Printf("Waiter now serving: %s\n", root)
	fmt.Println(" -> Building file tree...")

	tree, err := buildIndex(root)
	if err != nil {
		return err
	}

	fmt.Println(" -> Computing directory sizes...")
	computeSizes(tree)

	// Cache the JSON representation of the tree
	buildTreeCache := func() {
		treeJSON, _ = json.Marshal(tree)
	}

	fmt.Println(" -> Watching for file changes...")
	rootWatcher := watcher{
		root:     root,
		tree:     tree,
		onChange: buildTreeCache,
	}
	go rootWatcher.start()
	go buildTreeCache()

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

	// TODO: File update watching
	// TODO: Implement search client side
	// TODO: insert 1 level of data for first load (maybe?)

	r := buildRoutes()

	fmt.Println(" -> Serving files on port 8000")
	http.ListenAndServe(":8000", r)
}
