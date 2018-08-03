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

	"github.com/GeertJohan/go.rice"
	"github.com/gorilla/mux"
)

var root = flag.String("root", ".", "The root file path to serve files from")

func handleServeTree(w http.ResponseWriter, req *http.Request) {
	tree, err := BuildTree(*root, req.URL.Path)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tree)
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

	// Anything requested as JSON is assumed to be requesting the tree
	r.NewRoute().Headers("Accept", "application/json").HandlerFunc(handleServeTree)

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

	r := buildRoutes()

	fmt.Println(" -> Serving files on port 8000")
	http.ListenAndServe(":8000", r)
}
