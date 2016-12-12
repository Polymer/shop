var DATABASE_NAME = 'auth_db';
var DB_VERSION = 1;
var OBJECT_STORE_NAME = 'auth_object_store';

self.addEventListener('fetch', function(event) {
  var request = event.request.clone();
  if (/\/auth\/.*$/.test(request.url)) {
    request.text().then(function(text) {
      var params = multipartFormParser(text);
      params.id = params.id || params.email;
      params.name = params.name || '';
      params.imageUrl = params.imageUrl || '';
      console.log(params);
      if (/\/auth\/password/.test(request.url)) {
        console.log('requesting password', request);
      } else if (/\/auth\/google/.test(request.url)) {
        console.log('requesting google', request);
      } else if (/\/auth\/register/.test(request.url)) {
        console.log('requesting register', request);
      }
    });
  } else {
    event.respondWith(fetch(request));
  }
});

var multipartFormParser = function(body, param) {
  var results = {};
  var params = ['id', 'email', 'password', 'name', 'iconURL'];
  for (var i in params) {
    var param = params[i];
    var regex = new RegExp('Content-Disposition: form-data; name="'+param+'"[\\s\\S]{4}(.+)[\\s\\S]', 'm');
    var result = regex.exec(body);
    if (result) {
      results[param] = result[1];
    }
  }
  return results;
}

var DB = function() {
  var that = this;
  this.isReady = (function() {
    return new Promise(function(resolve, reject) {
      if (!'indexedDB' in self) {
        console.log('idb not available');
        reject();
      }
      var req = self.indexedDB.open(DATABASE_NAME, DB_VERSION);
      req.onsuccess = function(e) {
        console.log('success');
        that.db = e.target.result;
        resolve();
      };
      req.onerror = function(e) {
        console.log('error');
        reject();
      };
      req.onblocked = function(e) {
        console.log('blocked');
        reject();
      };
      req.onupgradeneeded = function(e) {
        console.log('upgradeneeded');
        that.db = e.target.result;
        if (e.oldVersion <= 1) {
          that.db.createObjectStore(OBJECT_STORE_NAME, {keyPath: 'id'});
        }
      };
    });
  })();
};
DB.prototype.add = function(id, params) {

};
DB.prototype.get = function(id) {

};

var db = new DB();