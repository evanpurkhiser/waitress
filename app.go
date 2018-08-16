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
	"github.com/getsentry/raven-go"
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

	staticHandler := getStaticHandler()
	treeHandler := handleServeTree
	fileHandler := func(w http.ResponseWriter, r *http.Request) {
		if !handleServeFile(w, r) {
			r.URL.Path = "/_static/"
			staticHandler.ServeHTTP(w, r)
		}
	}

	treeHandler = raven.RecoveryHandler(treeHandler)
	fileHandler = raven.RecoveryHandler(fileHandler)

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

func setupRaven() {
	raven.SetDSN("https://2afa25599321471fbc5dd9610bd74804@sentry.io/1256756")

	if _, err := rice.FindBox("dist/_static"); err != nil {
		raven.SetEnvironment("development")
	} else {
		raven.SetEnvironment("production")
	}
}

func main() {
	setupRaven()
	flag.Parse()

	r := buildRoutes()

	serverPort := fmt.Sprintf(":%d", *port)
	fmt.Printf("Serving up files on port %d\n", *port)

	if err := http.ListenAndServe(serverPort, r); err != nil {
		fmt.Fprintf(os.Stderr, "error: %s\n", err)
		return
	}
}
