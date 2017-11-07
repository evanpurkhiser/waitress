### Your files – served

Waitress is a small server that quickly serves up your files with style.

![Waitress](https://i.imgur.com/WM2DcjP.png)

#### Building

```
$ dep ensure
$ yarn install
$ make
$ dist/waitress -root /mnt/my-files
```

#### Upcoming features

 - [ ] Client-side search
 - [ ] Watch root folders for changes
 - [ ] Plugin support
 - [ ] Plugin: Download directory as zip
 - [ ] Plugin: Transcode video for chromecast
