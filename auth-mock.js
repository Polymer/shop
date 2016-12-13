var DATABASE_NAME = 'auth_db';
var DB_VERSION = 1;
var OBJECT_STORE_NAME = 'auth_object_store';

self.addEventListener('fetch', function(event) {
  var response = null;
  var request = event.request.clone();
  if (/\/auth\/.*$/.test(request.url)) {
    event.respondWith(
      request.text().then(function(text) {
        console.log(text);
        var params = multipartFormParser(text);
        params.name     = params.name || '';
        params.id       = params.id || params.email;
        params.imageUrl = params.imageUrl || '';
        params.email    = params.email;

        if (/\/auth\/password/.test(request.url)) {
          delete params.id_token;
          if (!params.email || !params.password) {
            return Promise.reject('Bad Request', 400);
          } else {
            return db.get(params);
          }
        } else if (/\/auth\/register/.test(request.url)) {
          if (!params.email || !params.password) {
            return Promise.reject('Bad Request', 400);
          } else {
            return db.add(params);
          }
        } else if (/\/auth\/google/.test(request.url)) {
          return verifyIdToken(params.id_token);
        }
        return Promise.reject();
      }).then(function(result) {
        delete result.password;
        var response = new Response(JSON.stringify(result), {
          status: 200,
          contentType: 'application/json'
        });
        return response;
      }).catch(function(text, status) {
        var response = new Response(text || 'Authentication failed.', {
          status: status || 401,
          statusText: text || 'Authentication failed.'
        });
        console.log(response);
        return response;
      })
    );
  } else {
    event.respondWith(fetch(request));
  }
});

var multipartFormParser = function(body, param) {
  var results = {};
  var params = ['id', 'email', 'password', 'name', 'iconURL', 'id_token'];
  for (var i in params) {
    var param = params[i];
    var regex = new RegExp('Content-Disposition: form-data; name="'+param+'"[\\s\\S]{4}(.+)[\\s\\S]', 'm');
    var result = regex.exec(body);
    if (result) {
      results[param] = result[1];
    }
  }
  return results;
};

var verifyIdToken = function(id_token) {
  var VERIFY_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=';
  return fetch(VERIFY_ENDPOINT+id_token)
  .then(function(res) {
    if (res.status == 200) {
      return res.json();
    } else {
      throw 'Verification failed';
    }
  }).then(function(data) {
    return db.add({
      id:       data.sub,
      email:    data.email,
      imageUrl: data.picture,
      name:     data.name
    });
  });
};

var DB = function() {
  var that = this;
  this.isReady = (function() {
    return new Promise(function(resolve, reject) {
      if (!'indexedDB' in self) {
        reject();
      }
      var req = self.indexedDB.open(DATABASE_NAME, DB_VERSION);
      req.onsuccess = function(e) {
        that.db = e.target.result;
        resolve();
      };
      req.onerror = function(e) {
        reject();
      };
      req.onblocked = function(e) {
        reject();
      };
      req.onupgradeneeded = function(e) {
        that.db = e.target.result;
        if (e.oldVersion <= 1) {
          that.db.createObjectStore(OBJECT_STORE_NAME, {keyPath: 'id'});
        }
      };
    });
  })();
};
DB.prototype.transaction = function() {
  var that = this;
  return new Promise(function(resolve, reject) {
    that.isReady.then(function() {
      resolve(that.db.transaction(OBJECT_STORE_NAME, 'readwrite'));
    }).catch(function() {
      reject();
    });
  })
}
DB.prototype.add = function(params) {
  // respond with promise resolving given params
  var that = this;
  return new Promise(function(resolve, reject) {
    this.db.transaction().then(function(trans) {
      var req = trans.objectStore(OBJECT_STORE_NAME).put(params);
      req.onsuccess = function(e) {
        resolve(params);
      };
      req.onerror = reject;
      trans.onerror = reject;
    });
  });
};
DB.prototype.get = function(params) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that.transaction().then(function(trans) {
      // Get an object with a key
      var req = trans.objectStore(OBJECT_STORE_NAME).get(params.id);
      req.onsuccess = function(e) {
        var profile = e.target.result;
        if (profile && profile.password == params.password) {
          resolve(profile);
        } else {
          reject();
        }
      }
      req.onerror = reject;
      trans.onerror = reject;
    });
  });
};

var db = new DB();