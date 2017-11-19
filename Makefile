.PHONY: build clean

build: clean
	yarn build
	go build -o dist/waitress *.go
	rice append --import-path=go.evanpurkhiser.com/waitress --exec=dist/waitress

clean:
	rm -rf dist
