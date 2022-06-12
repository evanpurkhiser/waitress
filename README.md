### Your files – served

[![Build Status](https://github.com/evanpurkhiser/waitress/workflows/build/badge.svg)](https://github.com/evanpurkhiser/waitress/actions?query=workflow%3Abuild)

Waitress is a small server that quickly serves up your files with style.

![Waitress](https://i.imgur.com/WM2DcjP.png)

#### Building

```
$ make
$ dist/waitress -root $PWD
```

You can also quickly run it using docker

```
docker run -p 8000:80 -v $PWD:/data evanpurkhiser/waitress
```

#### Upcoming features

- [ ] Client-side search
- [ ] Plugin support
- [ ] Plugin: Download directory as zip
- [ ] Plugin: Transcode video for chromecast
