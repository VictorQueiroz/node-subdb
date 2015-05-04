var _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var qs = require('querystring');
var http = require('http');
var crypto = require('crypto');

function stat (path) {
	var deferred = Q.defer();

	fs.stat(path, function(err, stat){
		if(err) {
			return deferred.reject();
		}

		deferred.resolve(stat);
	});

	return deferred.promise;
}

function open (path, flags) {
	var deferred = Q.defer();

	fs.open(path, flags, function (err, fd) {
		if(err) {
			return deferred.reject(err);
		}

		deferred.resolve(fd);
	});

	return deferred.promise;
}

function getHash (path) {
	// get first 64kb
	// get last 64kb
	// md5 everything

	var b_read = 0;
	var fileSize = 0;
	var chunkSize = 65536;
	var buffer = new Buffer(chunkSize * 2);
	var t_offsets;

	return stat(path).then(function (stat) {
		fileSize = stat.size;

		return open(path, 'r');
	}).then(function (fd) {
		var promises = [];

		t_offsets = [0, fileSize - chunkSize];

		for(var i in t_offsets) {
			b_read = fs.readSync(fd, buffer, b_read, chunkSize, t_offsets[i]);
		}

		return Q.all(promises);
	}).then(function () {
		return crypto.createHash('md5').update(buffer).digest('hex');
	}, function (err) {
		console.log(err);
	});
}

function request (options) {
	options = _.extend({
		host: 'api.thesubdb.com',
		agent: false,
		'headers': {
			'Content-length':0,
			'User-Agent': 'SubDB/1.0 (NodeSubdb/0.0.1; http://github.com/ka2er/node-subdb-api)'
		}
	}, options);

	var req = http.request(options);
	var data = '';
	var deferred = Q.defer();

	req.on('response', function (response) {
		response.setEncoding('binary');
		response.on('data', function (chunk) {
			data += chunk;
		}).on('end', function () {
			deferred.resolve(data);
		});
	}).on('error', function (err) {
		deferred.reject(err);
	}).end();

	return deferred.promise;
}

function get(params) {
	if(_.isObject(params)) {
		params = qs.stringify(params);
	}

	var options = {
		method: 'GET',
		path: '/?' + params
	};

	return request(options);
}

function download (hash, languages) {
	var options = {
		action: 'download',
		hash: hash
	};

	if(_.isString(languages)) {
		options.language = languages;
	}

	if(_.isArray(languages)) {
		options.language = languages.join(',');
	}

	return get(options);
}

function search (hash) {
	return get({
		action: 'search',
		hash: hash
	});
}

exports.get = get;
exports.search = search;
exports.getHash = getHash;
exports.download = download;