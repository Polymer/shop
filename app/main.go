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

// init wites up the request handlers
func init() {
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/list/", listHandler)
	http.HandleFunc("/detail/", detailHandler)
}

// indexHandler handles the home page and any request not handled
// by the static mappings in app.yaml or the more specific list and
// detail handlers
func indexHandler(w http.ResponseWriter, r *http.Request) {
	// prepare the metadata to pass to the template
	og := &opengraph{
		Title:       "SHOP",
		Type:        "website",
		Description: "Polymer Shop Demo",
		SiteName:    "Polymer SHOP",
		URL:         scheme + r.Host + r.URL.Path,
		Image:       scheme + r.Host + "/images/shop-icon-128.png",
	}

	// render the template to the response
	if err := indexTemplate.Execute(w, og); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// listHandler handles requests for a category list page
func listHandler(w http.ResponseWriter, r *http.Request) {
	// use the regex to get the values from the path
	values := listPath.FindStringSubmatch(r.URL.Path)
	if values == nil {
		return
	}

	// use the category name to get the category
	categoryName := values[1]
	category := data[categoryName]

	// prepare the metadata to pass to the template
	og := &opengraph{
		Title:       category.Title,
		Description: "List of " + category.Title,
		SiteName:    "Polymer SHOP",
		Type:        "website",
		URL:         scheme + r.Host + r.URL.Path,
		Image:       scheme + r.Host + category.Image,
	}

	// render the template to the response
	if err := indexTemplate.Execute(w, og); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// detailHandler handles requests for a product details page
func detailHandler(w http.ResponseWriter, r *http.Request) {
	values := detailPath.FindStringSubmatch(r.URL.Path)
	if values == nil {
		return
	}

	// detail pages have both a category and item name
	categoryName := values[1]
	itemName := values[2]

	// load them from the in-memory data
	category := data[categoryName]
	item := category.Items[itemName]

	// prepare the metadata to pass to the template
	og := &opengraph{
		Title:       item.Title,
		Description: item.Description,
		SiteName:    "Polymer SHOP",
		Type:        "website",
		URL:         scheme + r.Host + r.URL.Path,
		Image:       scheme + r.Host + item.Image,
	}

	// render the template to the response
	if err := indexTemplate.Execute(w, og); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// loadData loads the json data for each category
func loadData() map[string]category {
	// there is no json data file for these so they
	// are hard-coded just like in the polymer app
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

	// for each category
	for name := range categories {

		category := categories[name]
		category.Items = make(map[string]item)

		// load it's data file
		filename := "static/data/" + name + ".json"
		f, _ := os.Open(filename)
		dec := json.NewDecoder(f)
		var items []item
		dec.Decode(&items)
		f.Close()

		// and add each item to it (stripping the HTML)
		for _, item := range items {
			item.Description = stripHTML(item.Description)
			category.Items[item.Name] = item
		}

		categories[name] = category
	}

	return categories
}

// loadTemplate reads the index.html page, replaces the <title> element
// to add the meta-tags and creates an html template from it
func loadTemplate() *template.Template {
	f, _ := os.Open("static/index.html")
	b, _ := ioutil.ReadAll(f)
	title := regexp.MustCompile(`<title>SHOP</title>`)
	html := title.ReplaceAllString(string(b), metaTemplate)
	template := template.Must(template.New("index").Parse(html))
	return template
}

// getScheme is used to switch between http for local dev and https for prod
func getScheme() string {
	if appengine.IsDevAppServer() {
		return "http://"
	}
	return "https://"
}

// stripHTML removes any HTML tags from the description which has to be
// a plain string for OpenGraph and html meta-tags
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

// metaTemplate is the extra template we insert into index.html
// by replacing the <title> tag that is already there
const metaTemplate = `<title>{{.Title}}</title>

  <meta name="description" content="{{.Description}}">

  <meta property="og:title" content="{{.Title}}" />
  <meta property="og:description" content="{{.Description}}" />
  <meta property="og:site_name" content="{{.SiteName}}" />
  <meta property="og:type" content="{{.Type}}" />
  <meta property="og:url" content="{{.URL}}" />
  <meta property="og:image" content="{{.Image}}" />`

type (
	// opengraph is the data struct we pass into the template
	opengraph struct {
		Title       string
		Description string
		SiteName    string
		Type        string
		URL         string
		Image       string
	}

	// category represents a category
	category struct {
		Title string          `json:"title"`
		Image string          `json:"image"`
		Items map[string]item `json:"-"`
	}

	// item represents a single product within a category
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
	// listPath is a regex to extract the category
	listPath = regexp.MustCompile(`^/list/([a-zA-Z0-9_]+)$`)

	// detailPath is a regex to extract the category and item name
	detailPath = regexp.MustCompile(`^/detail/([a-zA-Z0-9_]+)/([a-zA-Z0-9-+]+)$`)

	// indexTemplate is the index.html template for rendering
	indexTemplate = loadTemplate()

	// data is an in-memory store the categories / product items that
	// is used to setup the opengraph data for rendering into the template
	// based on the category and item name extracted from the URL path
	// using the regular expressions above
	data = loadData()

	// scheme is used to generate absolute URLs
	scheme = getScheme()
)
