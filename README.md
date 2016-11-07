# SHOP

### Setup

##### Prerequisites

Install [polymer-cli](https://github.com/Polymer/polymer-cli):
(Need at least npm v0.3.0)

    npm install -g polymer-cli

Install [Google Cloud SDK](https://cloud.google.com/sdk/) to use App Engine.

Create a project in [Google API Console](https://console.developers.google.com/) following [these steps](https://developers.google.com/identity/sign-in/web/devconsole-project).
Once it's done:
* Download `client_secret_****.json`, rename it to `client_secrets.json`
* Place `client_secrets.json` at root of this project

##### Setup
    # Using CLI
    mkdir shop
    cd shop
    polymer init shop

    # Or cloning direct from GitHub
    git clone https://github.com/Polymer/shop.git
    cd shop

    # Build
    bower install
    git submodule init
    git submodule update
    pip install -t lib -r requirements.txt
    polymer build

### Start the development server

    dev_appserver.py .

### Build

    polymer build
