package main

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

const separator = string(filepath.Separator)

// FileList represents a list of files
type FileList map[string]*File

// File represents a single tree file
type File struct {
	Size     int64    `json:"size"`
	IsDir    bool     `json:"isDir,omitempty"`
	IsLink   bool     `json:"isLink,omitempty"`
	Children FileList `json:"children,omitempty"`
	Shallow  bool     `json:"shallow,omitempty"`
}

// BuildTree constructs a File at the rootPath, populates the nested File
// and a single level of it's children at the target path as well as the parent
// file (but none of it's children asside from the target path).
func BuildTree(rootPath, path string) (*File, error) {
	trimmedPath := filepath.Clean(separator + path)
	paths := strings.Split(trimmedPath, separator)[1:]

	// Empty target path
	if len(paths) == 1 && paths[0] == "" {
		paths = []string{}
	}

	// No target items, just render the root at two levels
	if len(paths) == 0 {
		return constructFile(rootPath, nil, 2)
	}

	// Preload the targe item and it's direct children
	targetPath := filepath.Join(rootPath, filepath.Join(paths...))
	targetName := paths[len(paths)-1]

	targetFile, err := constructFile(targetPath, nil, 2)
	if err != nil {
		return nil, err
	}

	// Preload the parent item
	parents := paths[:len(paths)-1]
	parentPath := filepath.Join(rootPath, filepath.Join(parents...))

	parentFile, err := constructFile(parentPath, nil, 1)
	if err != nil {
		return nil, err
	}

	parentFile.Children[targetName] = targetFile

	// No need to construct more shallow parent elements if the parent is root
	if len(parents) == 0 {
		return parentFile, nil
	}

	// Construct shallow tree of parents we did not load
	rootFile := &File{IsDir: true, Shallow: true}

	parentName := parents[len(parents)-1]

	currFile := rootFile
	for _, path := range parents[:len(parents)-1] {
		currFile.Children = FileList{
			path: &File{IsDir: true, Shallow: true},
		}
		currFile = currFile.Children[path]
	}
	currFile.Children = FileList{
		parentName: parentFile,
	}

	return rootFile, nil
}

// BuildTreeSizes recursively computes directory sizes for a given directories
// containing directories.
func BuildTreeSizes(root string, path string) (map[string]int64, error) {
	fullPath := filepath.Join(root, filepath.Clean(separator+path))

	entries, err := ioutil.ReadDir(fullPath)
	if err != nil {
		return nil, err
	}

	mapping := map[string]int64{}

	for _, file := range entries {
		if !file.IsDir() {
			continue
		}

		name := file.Name()
		filePath := filepath.Join(fullPath, name)

		mapping[name] = computeSize(filePath)
	}

	return mapping, nil
}

func constructFile(path string, entry os.FileInfo, targetDepth int) (*File, error) {
	var err error

	if entry == nil {
		if entry, err = os.Stat(path); err != nil {
			return nil, err
		}
	}

	item := &File{
		IsDir:  entry.IsDir(),
		IsLink: entry.Mode()&os.ModeSymlink != 0,
		Size:   entry.Size(),
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

	if targetDepth == 0 {
		item.Shallow = true
		return item, nil
	}

	entries, err := ioutil.ReadDir(path)
	if err != nil {
		return nil, err
	}

	item.Children = FileList{}

	for _, childEntry := range entries {
		childName := childEntry.Name()
		entryPath := filepath.Join(path, childName)

		entryFile, err := constructFile(entryPath, childEntry, targetDepth-1)
		if err != nil {
			return nil, err
		}

		item.Children[childName] = entryFile
	}

	return item, nil
}

func computeSize(root string) int64 {
	var size int64

	filepath.Walk(root, func(_ string, info os.FileInfo, err error) error {
		size = size + info.Size()
		return nil
	})

	return size
}
