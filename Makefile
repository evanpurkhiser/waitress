.PHONY: build clean deps

build: clean deps
	yarn build
	go build -o dist/waitress *.go
	rice append --import-path=go.evanpurkhiser.com/waitress --exec=dist/waitress

deps:
	yarn install
	dep ensure

clean:
	rm -rf dist
