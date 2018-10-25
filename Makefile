.PHONY: build clean deps

build: clean deps
	yarn build
	go build -mod=readonly -o dist/waitress *.go
	rice append --import-path=go.evanpurkhiser.com/waitress --exec=dist/waitress

deps:
	yarn install
	go mod download
	go install github.com/GeertJohan/go.rice/rice

clean:
	rm -rf dist
