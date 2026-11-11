# Your files – served

[![Build Status](https://github.com/evanpurkhiser/waitress/workflows/build/badge.svg)](https://github.com/evanpurkhiser/waitress/actions?query=workflow%3Abuild)

Waitress is a small server that quickly serves up your files with style.

![Waitress](https://i.imgur.com/WM2DcjP.png)

## Features

- Pre-fetching deep listings
- Client-side fuzzy filtering
- Keyboard navigation

### Building

```text
$ make
$ dist/waitress -root $PWD
```

You can also quickly run it using docker

```text
docker run -p 8000:80 -v $PWD:/data evanpurkhiser/waitress
```
