.PHONY: build clean deps

build: clean deps
	yarn build
	go build -mod=readonly -o dist/waitress *.go

deps:
	yarn install
	go mod download

clean:
	rm -rf dist
	mkdir -p dist/_static
