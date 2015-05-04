# node-subdb

### Installation
```
npm install --save node-subdb
```

### Searching
```js
var subdb = require('node-subdb');

subdb.getHash('./test/dexter.mp4').then(function (hash) {
	return subdb.search(hash);
}).then(function (r) {
	res.status(200).end(r);
});
```

### Downloading
```js
var subdb = require('node-subdb');

subdb.getHash('./test/dexter.mp4').then(function (hash) {
	return subdb.download(hash);
}).then(function (r) {
	res.status(200).end(r);
});
```