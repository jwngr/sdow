// Convert a file with lines:
// 		PageId1 Link1 Link2 Link3
// Into a file with lines:
//		PageId1\tOutgoingLinkCount\tIncomingLinkCount\tLink1|Link2|Link3\tLink4|Link5
// See createLinksTable.sql for more details.
package main

import (
	"bufio"
	"compress/gzip"
	"fmt"
	"io"
	"log"
	"os"
	"sort"
	"strconv"
	"strings"
)

type node struct {
	id       int32
	outgoing []int32
	incoming []int32
}

func pipedSlice(x []int32) string {
	buf := []byte{}
	for i, n := range x {
		if i > 0 {
			buf = append(buf, '|')
		}
		buf = strconv.AppendInt(buf, int64(n), 10)
	}
	return string(buf)
}

func (n *node) String() string {
	return fmt.Sprintf("%d\t%d\t%d\t%s\t%s",
		n.id, len(n.outgoing), len(n.incoming),
		pipedSlice(n.outgoing), pipedSlice(n.incoming))
}

func parseInt(x string) int32 {
	n, err := strconv.ParseInt(x, 10, 32)
	if err != nil {
		log.Fatal("bad int ", x, err)
	}
	return int32(n)
}

func main() {
	if len(os.Args) != 2 {
		log.Fatalf("usage: %s <links.txt[.gz]>", os.Args[0])
	}
	f, err := os.Open(os.Args[1])
	if err != nil {
		log.Fatal("Unable to read links ", err)
	}
	defer f.Close()

	// Try to decode as gzip, fall back to uncompressed on error.
	var r io.Reader
	r, err = gzip.NewReader(f)
	if err != nil { // Bad header?
		f.Seek(0, io.SeekStart)
		r = f
	}

	nodes := []*node{}

	log.Println("reading links")
	buf := bufio.NewReader(r)
	for {
		line, err := buf.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				break
			}
			log.Fatal("bad read: ", err)
		}
		entries := strings.Split(line[:len(line)-1], " ")
		n := &node{
			id:       parseInt(entries[0]),
			outgoing: make([]int32, len(entries)-1),
		}
		for i, entry := range entries[1:len(entries)] {
			n.outgoing[i] = parseInt(entry)
		}
		nodes = append(nodes, n)
	}

	log.Println("sorting nodes")
	sort.Slice(nodes, func(i, j int) bool { return nodes[i].id < nodes[j].id })

	log.Println("making node map")
	nodeMap := map[int32]*node{}
	for _, node := range nodes {
		nodeMap[node.id] = node
	}

	log.Println("making reverse links")
	for _, node := range nodes {
		for _, out := range node.outgoing {
			outnode, ok := nodeMap[out]
			if !ok {
				// https://phabricator.wikimedia.org/T188388 means
				// that some articles ("TARDIS", "Phosphor", others)
				// don't exist in dumps. This should mostly go away
				// in the 20180301 dump.
				log.Printf("unknown link %d -> %d\n", node.id, out)
				continue
			}
			outnode.incoming = append(outnode.incoming, node.id)
		}
	}

	log.Println("dumping links")
	for _, node := range nodes {
		fmt.Println(node)
	}

	log.Println("done!")
}
