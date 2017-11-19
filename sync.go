package main

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/rjeczalik/notify"
)

func buildIndex(rootPath string) (*Item, error) {
	return constructItem(rootPath, nil, nil)
}

func constructItem(path string, entry os.FileInfo, parent *Item) (*Item, error) {
	var err error

	if entry == nil {
		if entry, err = os.Stat(path); err != nil {
			return nil, err
		}
	}

	item := &Item{
		IsDir:    entry.IsDir(),
		IsLink:   entry.Mode()&os.ModeSymlink != 0,
		Modified: entry.ModTime(),
		Size:     entry.Size(),
		Parent:   parent,
	}

	if !item.IsDir && !item.IsLink {
		return item, nil
	}

	if item.IsLink {
		path, _ = filepath.EvalSymlinks(path)

		linkStat, err := os.Stat(path)
		if err != nil || !linkStat.IsDir() {
			return item, nil
		}

		item.IsDir = true
	}

	entries, err := ioutil.ReadDir(path)
	if err != nil {
		return nil, err
	}

	item.Children = FileList{}

	for _, childEntry := range entries {
		childName := childEntry.Name()
		entryPath := filepath.Join(path, childName)

		entryItem, err := constructItem(entryPath, childEntry, item)
		if err != nil {
			return nil, err
		}

		item.Children[childName] = entryItem
	}

	return item, nil
}

func computeSizes(target *Item) int64 {
	if !target.IsDir {
		return target.Size
	}

	target.Size = 0

	// TODO: We can probably parallelize this
	for _, item := range target.Children {
		target.Size = target.Size + computeSizes(item)
	}

	return target.Size
}

type watcher struct {
	root     string
	tree     *Item
	onChange func()
}

func (w *watcher) add(path string) {
	relPath, _ := filepath.Rel(w.root, path)

	parent := w.tree
	pathList := strings.Split(relPath, "/")

	for _, p := range pathList[:len(pathList)-1] {
		parent = parent.Children[p]
	}

	newItem, err := constructItem(path, nil, parent)
	if err != nil {
		return
	}

	parent.Children[pathList[len(pathList)-1]] = newItem

	for ; parent != nil; parent = parent.Parent {
		parent.Size += newItem.Size
	}
}

func (w *watcher) remove(path string) {
	relPath, _ := filepath.Rel(w.root, path)

	target := w.tree
	pathList := strings.Split(relPath, "/")

	for _, p := range pathList {
		target = target.Children[p]
	}

	name := pathList[len(pathList)-1]

	for parent := target; parent != nil; parent = parent.Parent {
		parent.Size -= target.Size
	}

	delete(target.Parent.Children, name)
}

func (w *watcher) update(path string) {
	w.remove(path)
	w.add(path)
}

func (w *watcher) rename(path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		w.remove(path)
	} else {
		w.add(path)
	}
}

func (w *watcher) start() error {
	events := make(chan notify.EventInfo)

	watchEvents := []notify.Event{
		notify.Create,
		notify.Write,
		notify.Rename,
		notify.Remove,
	}

	// The '...' syntax is used in the notify library for recursive watching
	path := filepath.Join(w.root, "...")

	if err := notify.Watch(path, events, watchEvents...); err != nil {
		return err
	}

	handlers := map[notify.Event]func(string){
		notify.Create: w.add,
		notify.Write:  w.update,
		notify.Rename: w.rename,
		notify.Remove: w.remove,
	}

	for eventInfo := range events {
		handlers[eventInfo.Event()](eventInfo.Path())
		w.onChange()
	}

	return nil
}
