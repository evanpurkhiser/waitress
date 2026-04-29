.PHONY: build clean deps

build: clean deps
	pnpm build
	go build -mod=readonly -o dist/waitress *.go

deps:
	pnpm install
	go mod download

clean:
	rm -rf dist
	mkdir -p dist/_static
