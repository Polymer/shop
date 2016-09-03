package main

import (
	"bytes"
	"html"
	"os"
	"regexp"
	"strings"

	"encoding/json"
	"html/template"
	"io/ioutil"
	"net/http"

	xhtml "golang.org/x/net/html"
	"google.golang.org/appengine"
)

func init() {
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/list/", listHandler)
	http.HandleFunc("/detail/", detailHandler)
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	og := &opengraph{
		Title:       "SHOP",
		Type:        "website",
		Description: "Polymer Shop Demo",
		SiteName:    "Polymer SHOP",
		URL:         scheme + r.Host + r.URL.Path,
		Image:       scheme + r.Host + "/images/shop-icon-128.png",
	}

	if err := indexTemplate.Execute(w, og); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func listHandler(w http.ResponseWriter, r *http.Request) {
	values := listPath.FindStringSubmatch(r.URL.Path)
	if values == nil {
		return
	}

	categoryName := values[1]
	category := data[categoryName]

	og := &opengraph{
		Title:       category.Title,
		Description: "List of " + category.Title,
		SiteName:    "Polymer SHOP",
		Type:        "website",
		URL:         scheme + r.Host + r.URL.Path,
		Image:       scheme + r.Host + category.Image,
	}

	if err := indexTemplate.Execute(w, og); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func detailHandler(w http.ResponseWriter, r *http.Request) {
	values := detailPath.FindStringSubmatch(r.URL.Path)
	if values == nil {
		return
	}

	categoryName := values[1]
	itemName := values[2]

	category := data[categoryName]
	item := category.Items[itemName]

	og := &opengraph{
		Title:       item.Title,
		Description: item.Description,
		SiteName:    "Polymer SHOP",
		Type:        "website",
		URL:         scheme + r.Host + r.URL.Path,
		Image:       scheme + r.Host + item.Image,
	}

	if err := indexTemplate.Execute(w, og); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func loadData() map[string]category {
	categories := map[string]category{
		"mens_outerwear": {
			Title: "Men's Outerwear",
			Image: "/images/mens_outerwear.jpg",
		},
		"ladies_outerwear": {
			Title: "Ladies Outerwear",
			Image: "/images/ladies_outerwear.jpg",
		},
		"mens_tshirts": {
			Title: "Men's T-Shirts",
			Image: "/images/mens_tshirts.jpg",
		},
		"ladies_tshirts": {
			Title: "Ladies T-Shirts",
			Image: "/images/ladies_tshirts.jpg",
		},
	}

	for name := range categories {
		category := categories[name]
		category.Items = make(map[string]item)

		filename := "static/data/" + name + ".json"
		f, _ := os.Open(filename)
		dec := json.NewDecoder(f)
		var items []item
		dec.Decode(&items)

		for _, item := range items {
			item.Description = stripHTML(item.Description)
			category.Items[item.Name] = item
		}

		categories[name] = category
	}

	return categories
}

func loadTemplate() *template.Template {
	f, _ := os.Open("static/index.html")
	b, _ := ioutil.ReadAll(f)
	title := regexp.MustCompile(`<title>SHOP</title>`)
	html := title.ReplaceAllString(string(b), metaTemplate)
	template := template.Must(template.New("index").Parse(html))
	return template
}

func getScheme() string {
	if appengine.IsDevAppServer() {
		return "http://"
	}
	return "https://"
}

func stripHTML(value string) string {
	r := strings.NewReader(html.UnescapeString(value))
	w := new(bytes.Buffer)
	tokenizer := xhtml.NewTokenizerFragment(r, "div")
	for {
		tokenType := tokenizer.Next()
		switch tokenType {
		case xhtml.ErrorToken:
			return w.String()
		case xhtml.TextToken:
			w.Write(tokenizer.Text())
		case xhtml.StartTagToken:
			w.WriteByte(' ')
		}
	}
}

const metaTemplate = `<title>{{.Title}}</title>

  <meta name="description" content="{{.Description}}">

  <meta property="og:title" content="{{.Title}}" />
  <meta property="og:description" content="{{.Description}}" />
  <meta property="og:site_name" content="{{.SiteName}}" />
  <meta property="og:type" content="{{.Type}}" />
  <meta property="og:url" content="{{.URL}}" />
  <meta property="og:image" content="{{.Image}}" />`

type (
	opengraph struct {
		Title       string
		Description string
		SiteName    string
		Type        string
		URL         string
		Image       string
	}

	category struct {
		Title string          `json:"title"`
		Image string          `json:"image"`
		Items map[string]item `json:"-"`
	}

	item struct {
		Name        string  `json:"name"`
		Title       string  `json:"title"`
		Category    string  `json:"category"`
		Price       float64 `json:"price"`
		Description string  `json:"description"`
		Image       string  `json:"image"`
		LargeImage  string  `json:"largeImage"`
	}
)

var (
	listPath   = regexp.MustCompile(`^/list/([a-zA-Z0-9_]+)$`)
	detailPath = regexp.MustCompile(`^/detail/([a-zA-Z0-9_]+)/([a-zA-Z0-9-+]+)$`)

	indexTemplate = loadTemplate()
	data          = loadData()
	scheme        = getScheme()
)
