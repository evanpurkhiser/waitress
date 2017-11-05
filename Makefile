.PHONY: build

build:
	yarn build
	go build -o dist/waitress app.go
	rice append --import-path=go.evanpurkhiser.com/waitress --exec=dist/waitress
