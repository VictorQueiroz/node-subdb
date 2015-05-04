var subdb = require('../index');
var should = require('should');

describe('node-subdb', function () {
	it('should get video hash', function (done) {
		subdb.getHash('./test/dexter.mp4').then(function (hash) {
			hash.should.be.exactly('ffd8d4aa68033dc03d1c8ef373b9028c');
			done();
		}, function (err) {
			console.log(err);
			done(err);
		});
	});

	it('should give languages', function (done) {
		subdb.get({
			action: 'languages'
		}).then(function (data) {
			data.should.be.exactly('en,es,fr,it,nl,pl,pt,ro,sv,tr');
			done();
		}, function (err) {
			done(err);
		})
	});

	it('should bring me subtitles', function (done) {
		subdb.getHash('./test/dexter.mp4').then(function (hash) {
			return subdb.search(hash).then(function (r) {
				r.should.be.exactly('en');
				done();
			});
		}, function (err) {
			done(err);
		});
	});

	it('should download subtitles', function (done) {
		subdb.getHash('./test/dexter.mp4').then(function (hash) {
			return subdb.download(hash, ['en']).then(function (subtitle) {
				subtitle.should.be.a.String.with.lengthOf(157);
				done();
			});
		}, function (err) {
			done(err);
		});
	});
});