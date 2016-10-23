#!/usr/bin/python
# Copyright Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# coding: -*- utf-8 -*-

from google.appengine.ext import vendor
vendor.add('lib')

import os
import sys
import binascii
import json
import urllib
from bcrypt import bcrypt
from flask import Flask, request, make_response, render_template, session
from oauth2client import client

from google.appengine.ext import ndb
from google.appengine.api import urlfetch

FACEBOOK_APPID=os.getenv('FACEBOOK_APPID')
FACEBOOK_APPTOKEN=os.getenv('FACEBOOK_APPTOKEN', None)

app = Flask(
    __name__,
    static_url_path='',
    static_folder='static',
    template_folder='templates'
)
app.debug = True

# Does `client_secrets.json` file exist?
if os.path.isfile('client_secrets.json') is False:
    sys.exit('client_secrets.json not found.')

# Load `client_secrets.json` file
keys = json.loads(open('client_secrets.json', 'r').read())['web']

CLIENT_ID = keys['client_id']

# `SECRET_KEY` can be anything as long as it is hidden, but we use
# `client_secret` here for convenience
SECRET_KEY = keys['client_secret']
app.config.update(
    SECRET_KEY=SECRET_KEY
)


# App Engine Datastore to save credentials
class CredentialStore(ndb.Model):
    profile = ndb.JsonProperty()

    @classmethod
    def remove(cls, key):
        ndb.Key(cls.__name__, key).delete()

    @classmethod
    def hash(cls, password):
        return bcrypt.hashpw(password, bcrypt.gensalt())

    @classmethod
    def verify(cls, password, hashed):
        if bcrypt.hashpw(password, hashed) == hashed:
            return True
        else:
            return False


@app.before_request
def csrf_protect():
    # Skip all CSRF check for demo purpose
    # TODO: Examine how to enable CSRF on offline apps
    return
    # # All incoming POST requests will pass through this
    # if request.method == 'POST':
    #     # Obtain CSRF token embedded in the session
    #     csrf_token = session.get('csrf_token', None)
    #     # Compare the POST'ed CSRF token with the one in the session
    #     if not csrf_token or csrf_token != request.form.get('csrf_token'):
    #         # Return 403 if empty or they are different
    #         return make_response('', 403)


@app.route('/auth/password', methods=['POST'])
def pwauth():
    # The POST should include `email`
    email = request.form.get('email', None)[:32]

    # The POST should include `password`
    password = request.form.get('password', None)[:32]

    # Validate the parameters POST'ed (intentionally not too strict)
    if not email or not password:
        return make_response('Bad Request', 400)

    # Obtain Datastore entry by email address
    store = CredentialStore.get_by_id(email)

    # If the store doesn't exist, fail.
    if store is None:
        return make_response('Authentication failed.', 401)

    profile = store.profile

    # If the profile doesn't exist, fail.
    if profile is None:
        return make_response('Authentication failed.', 401)

    # If the password doesn't match, fail.
    if CredentialStore.verify(password, profile['password']) is False:
        return make_response('Authentication failed.', 401)

    # Get rid of password from profile
    profile.pop('password')

    # Not making a session for demo purpose/simplicity
    return make_response(json.dumps(profile), 200)


@app.route('/auth/google', methods=['POST'])
def gauth():
    # The POST should include `id_token`
    id_token = request.form.get('id_token', '')[:3072]

    # Verify the `id_token` using API Client Library
    idinfo = client.verify_id_token(id_token, CLIENT_ID)

    # Additional verification: See if `iss` matches Google issuer string
    if idinfo['iss'] not in ['accounts.google.com',
                             'https://accounts.google.com']:
        return make_response('Wrong Issuer.', 401)

    # For now, we'll always store profile data after successfully
    # verifying the token and consider the user authenticated.
    store = CredentialStore(id=idinfo['sub'], profile=idinfo)
    store.put()

    # Construct a profile object
    profile = {
        'id':        idinfo.get('sub', None),
        'imageUrl':  idinfo.get('picture', None),
        'name':      idinfo.get('name', None),
        'email':     idinfo.get('email', None)
    }

    # Not making a session for demo purpose/simplicity
    return make_response(json.dumps(profile), 200)


@app.route('/auth/facebook', methods=['POST'])
def fblogin():
    # The POST should include `access_token` from Facebook
    access_token = request.form.get('access_token', None)[:3072]

    # If the access_token is `None`, fail.
    if access_token is None:
        return make_response('Authentication failed.', 401)

    app_token = FACEBOOK_APPTOKEN if FACEBOOK_APPTOKEN is not None else access_token

    # Verify the access token using Facebook API
    params = {
        'input_token':  access_token,
        'access_token': app_token
    }
    r = urlfetch.fetch('https://graph.facebook.com/debug_token?' +
                       urllib.urlencode(params))
    result = json.loads(r.content)

    # If the response includes `is_valid` being false, fail
    if result['data']['is_valid'] is False:
        return make_response('Authentication failed.', 401)

    # Make an API request to Facebook using OAuth
    r = urlfetch.fetch('https://graph.facebook.com/me?fields=name,email',
                       headers={'Authorization': 'OAuth '+access_token})
    idinfo = json.loads(r.content)

    # Save the Facebook profile
    store = CredentialStore(id=idinfo['id'], profile=idinfo)
    store.put()

    # Obtain the Facebook user's image
    profile = idinfo
    profile['imageUrl'] = 'https://graph.facebook.com/' + profile['id'] +\
        '/picture?width=96&height=96'

    # Not making a session for demo purpose/simplicity
    return make_response(json.dumps(profile), 200)


@app.route('/register', methods=['POST'])
def register():
    # The POST should include `email`
    email = request.form.get('email', None)[:32]

    # The POST should include `password`
    _password = request.form.get('password', None)[:32]

    # Validate the parameters POST'ed (intentionally not too strict)
    if not email or not _password:
        return make_response('Bad Request', 400)

    # Hash password
    password = CredentialStore.hash(_password)
    # Perform relevant sanitization/validation on your own code.
    # This demo omits them on purpose for simplicity.
    profile = {
        'id':       email,
        'email':    email,
        'name':     request.form.get('name', ''),
        'password': password,
        'imageUrl': ''
    }

    # Overwrite existing user
    store = CredentialStore(id=profile['id'], profile=profile)
    store.put()

    # Get rid of password from profile
    profile.pop('password')

    # Not making a session for demo purpose/simplicity
    return make_response(json.dumps(profile), 200)


@app.route('/unregister', methods=['POST'])
def unregister():
    if 'id' not in request.form:
        make_response('User id not specified', 400)

    id = request.form.get('id', '')
    store = CredentialStore.get_by_id(str(id))

    if store is None:
        make_response('User not registered', 400)

    profile = store.profile

    if profile is None:
        return make_response('Failed', 400)

    # Remove the user account
    CredentialStore.remove(str(id))
    # Not terminating a session for demo purpose/simplicity
    return make_response('Success', 200)


@app.route('/signout', methods=['POST'])
def signout():
    # Not terminating a session for demo purpose/simplicity
    return make_response(json.dumps({}), 200)


@app.route('/', defaults={'path': ''})
@app.route('/<path>')
def index(path):
    # Issue a CSRF token if not included in the session
    if 'csrf_token' not in session:
        session['csrf_token'] = binascii.hexlify(os.urandom(24))
    return render_template('index.html', client_id=CLIENT_ID,
                           csrf_token=session['csrf_token'])
