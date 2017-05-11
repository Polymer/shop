# SHOP

### Setup

##### Prerequisites

Install [polymer-cli](https://github.com/Polymer/polymer-cli):
(Need at least npm v0.3.0)

    npm install -g polymer-cli


##### Setup
    # Using CLI
    mkdir shop
    cd shop
    polymer init shop
    
    # Or cloning direct from GitHub
    git clone https://github.com/Polymer/shop.git
    cd shop
    bower install

### Start the development server

    polymer serve

### Run web-component-tester tests

    polymer test

### Build

    polymer build

### Test the build

This command serves the minified version of the app in an unbundled state, as it would be served by a push-compatible server:

    polymer serve build/unbundled
    
This command serves the minified version of the app generated using fragment bundling:

    polymer serve build/bundled

### AppEngine Deployment

The `/app` folder contains a simple AppEngine application which uses Go to render OpenGraph meta tags
into the home, list and detail pages. The meta-data for the pages is loaded from the .json data on the
server at startup and the title tag in the index.html page replaced to create the server-side template.

This requires the [Google AppEngine SDK for Go](https://cloud.google.com/appengine/downloads#Google_App_Engine_SDK_for_Go)
in order to run locally and deploy. 

#### Run Locally

First build the polymer app and then from the `/app` folder run:

    goapp serve

Your app will be available at [http://localhost:8080/](http://localhost:8080/)

#### Deploy

You will need to change the application name in `/app/app.yaml` to match a project that you own, then run:

    goapp deploy

See the [Google App Engine Go Standard Environment Documentation](https://cloud.google.com/appengine/docs/go/)
for more details on AppEngine hosting with Go.