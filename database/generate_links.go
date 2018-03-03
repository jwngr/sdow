// Process a multistream wikipedia dump and generate the outgoing links from each page.
// Outputs lines of the format:
//		PageId LinkId1 LinkId2 LinkId3 ... LinkIdN
// Started life as https://gist.github.com/jagregory/5942951

package main

import (
	"bufio"
	"compress/bzip2"
	"compress/gzip"
	"encoding/csv"
	"encoding/xml"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"regexp"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

var (
	backslashRE = regexp.MustCompile(`\\(.)`)
	linkRE      = regexp.MustCompile(`\[\[([^]|]*)(?:|[^]]*)?\]\]`)
	footerRE    = regexp.MustCompile(`(?m)^==\s*(See also|Notes|References|Further reading|External links)`)

	jobs = flag.Int("jobs", runtime.NumCPU(), "number of parallel parsing processes")

	printLock sync.Mutex
)

func newGzippedCsvReader(filename string) *csv.Reader {
	f, err := os.Open(filename)
	if err != nil {
		log.Fatal("Unable to read gzip", filename, err)
	}
	gz, err := gzip.NewReader(f)
	if err != nil {
		log.Fatal("Unable to read gzip", filename, err)
	}
	csv := csv.NewReader(gz)
	csv.Comma = '\t'
	csv.LazyQuotes = true
	return csv
}

func readPages(filename string) map[string]int64 {
	csv := newGzippedCsvReader(filename)
	out := map[string]int64{}
	for {
		record, err := csv.Read()
		if err != nil {
			if err == io.EOF {
				break
			}
			log.Fatal("bad csv read in", filename, err)
		}
		// backslashes escaped things in SQL-- attempt to unescape them properly
		title := backslashRE.ReplaceAllString(record[1], "$1")
		pageId, err := strconv.ParseInt(record[0], 10, 64)
		if err != nil {
			log.Fatal("bad int in", filename, record, err)
		}
		out[title] = pageId
	}
	return out
}

func readRedirects(filename string) map[int64]int64 {
	csv := newGzippedCsvReader(filename)
	redirects := map[int64]int64{}
	for {
		record, err := csv.Read()
		if err != nil {
			if err == io.EOF {
				break
			}
			log.Fatal("bad csv read in ", filename, err)
		}
		pageId, err := strconv.ParseInt(record[0], 10, 64)
		if err != nil {
			log.Fatal("bad int in ", filename, record, err)
		}
		targetId, err := strconv.ParseInt(record[0], 10, 64)
		if err != nil {
			log.Fatal("bad int in ", filename, record, err)
		}
		redirects[pageId] = targetId
	}
	return redirects
}

func readIndex(filename string) []int64 {
	f, err := os.Open(filename)
	if err != nil {
		log.Fatal("Unable to read bzip2 ", filename, err)
	}
	bz := bzip2.NewReader(f)
	buf := bufio.NewReader(bz)
	out := []int64{}
	lastOff := int64(-1)
	for {
		line, err := buf.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				break
			}
			log.Fatal("bad read in ", filename, err)
		}
		off, err := strconv.ParseInt(line[:strings.Index(line, ":")], 10, 64)
		if err != nil {
			log.Fatal("bad int in ", filename, line, err)
		}
		if off != lastOff {
			lastOff = off
			out = append(out, off)
		}
	}
	return out
}

type work struct {
	offset int64
	limit  int64
}

func findLinks(text []byte, pageToId map[string]int64, redirects map[int64]int64) []int64 {
	// Ignore "footer" sections ("See Also", "References", etc).
	footerStart := footerRE.FindIndex(text)
	if footerStart != nil {
		text = text[:footerStart[0]]
	}

	linkIds := []int64{}
	links := linkRE.FindAllSubmatch(text, -1)
	for _, matches := range links {
		link := matches[1]
		for i, b := range link {
			if b == ' ' {
				link[i] = '_'
			}
		}
		links := string(link)
		linkId := pageToId[links]
		if redirId, ok := redirects[linkId]; ok {
			linkId = redirId
		}
		if linkId > 0 {
			// check if link is unique
			for _, otherLinkId := range linkIds {
				if linkId == otherLinkId {
					linkId = 0
				}
				break
			}
		}
		if linkId > 0 {
			linkIds = append(linkIds, linkId)
		}
	}
	sort.Slice(linkIds, func(i, j int) bool { return linkIds[i] < linkIds[j] })
	return linkIds
}

func parseXml(dec *xml.Decoder, pageToId map[string]int64, redirects map[int64]int64) {
	currentElement := ""
	currentTitle := ""
	currentPageId := int64(0)

	var buf []byte

	for {
		token, err := dec.Token()
		if err != nil {
			if err == io.EOF {
				break
			}
			if strings.Contains(err.Error(), "unexpected end element </mediawiki>") {
				// this is expected since we're doing a random-access parse
				break
			}
			log.Fatal("Error reading zip", err)
		}

		switch val := token.(type) {
		case xml.StartElement:
			currentElement = val.Name.Local
			if currentElement == "page" {
				currentTitle = ""
				currentPageId = 0
			}
		case xml.EndElement:
			currentElement = ""
		case xml.CharData:
			if currentElement == "title" {
				currentTitle = string(val)
			} else if currentPageId == 0 && currentElement == "id" {
				currentPageId, err = strconv.ParseInt(string(val), 0, 64)
				if err != nil {
					log.Println("bad page id ", string(val))
				}
			} else if currentElement == "text" {
				pageId := pageToId[strings.Replace(currentTitle, " ", "_", -1)]
				if pageId == 0 {
					// Log it if it doesn't look like a namespaced page.
					// ... And if it isn't marked for deletion.
					if !strings.Contains(currentTitle, ":") &&
						!strings.Contains(string(val), "deletion/dated") {
						log.Println("unknown page", currentTitle)
					}
					continue
				}
				if pageId != currentPageId {
					// Weird. The article was probably renamed after the per-page data was dumped.
					//log.Printf("page id mismatch: %s is %d in pages.txt vs %d in xml",
					//	currentTitle, pageId, currentPageId)
					// Trust the XML to not have duplicate page IDs, at least!
					pageId = currentPageId
				}
				linkIds := findLinks(val, pageToId, redirects)

				buf = strconv.AppendInt(buf[:0], pageId, 10)
				for _, linkId := range linkIds {
					buf = append(buf, byte(' '))
					buf = strconv.AppendInt(buf, linkId, 10)
				}
				buf = append(buf, byte('\n'))
				printLock.Lock()
				fmt.Print(string(buf))
				printLock.Unlock()
			}
		}
	}
}

func main() {
	flag.Parse()
	args := flag.Args()
	if len(args) != 4 {
		log.Fatalf("usage: %s <pages.txt.gz> <redirects.with_ids.txt.gz> <pages-articles-multistream.txt.bz2> <pages-articles-index.txt.bz2>", os.Args[0])
	}

	indexes := readIndex(args[3])
	log.Println("loaded index")
	pageToId := readPages(args[0])
	log.Println("loaded page ids")
	redirects := readRedirects(args[1])
	log.Println("loaded redirects")

	wg := sync.WaitGroup{}

	tasks := make(chan work)
	start := time.Now()

	// make sure the file will open
	filename := args[2]
	f, err := os.Open(filename)
	if err != nil {
		log.Fatal("Unable to read zip", err)
	}
	f.Close()

	for i := 0; i < *jobs; i++ {
		wg.Add(1)
		go func() {
			filename := args[2]
			f, err := os.Open(filename)
			if err != nil {
				log.Fatal("Unable to read zip", err)
			}
			defer f.Close()
			for chunk := range tasks {
				f.Seek(chunk.offset, io.SeekStart)

				r := io.Reader(f)
				if chunk.limit > 0 {
					r = io.LimitReader(r, chunk.limit)
				}

				r = bzip2.NewReader(r)
				dec := xml.NewDecoder(r)

				parseXml(dec, pageToId, redirects)
			}
			wg.Done()
		}()
	}

	for i, offset := range indexes {
		if i < len(indexes)-1 {
			tasks <- work{offset, indexes[i+1] - offset}
		} else {
			tasks <- work{offset, 0}
		}
	}

	close(tasks)
	wg.Wait()
	log.Println("done.", time.Since(start))
}
