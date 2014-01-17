var request = require('supertest');
var express = require('express');
var ach = require('../index.js');

describe("using ach", function() {
  describe("with allowOrigin='http://example.com http://example.org "+
    "http://example.net'", function() {
    var app = express();

    app.use(ach({allowOrigin:
      'http://example.com http://example.org http://example.net'}));
    app.get('/', function(req, res) {
      res.send(200);
    });

    describe('requests with no Origin', function() {
      it('should not receive Access-Control headers', function(done) {
        request(app)
          .get('/')
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;

            Object.keys(res.header).forEach(function(header) {
              if (/^access\-control/.test(header)) {
                throw new Error (
                  header + ' header present for originless request');
              }
            });
            done();
          });
      });
    });
    describe('requests with http://example.com Origin', function() {
      it('should receive http://example.com Access-Control-Allow-Origin',
        function(done) {

        request(app)
          .get('/')
          .set('Origin', 'http://example.com')
          .expect(200)
          .expect('Access-Control-Allow-Origin', 'http://example.com')
          .end(function(err, res) {
            if (err) throw err;
            done();
          });
      });
    });
    describe('requests with http://example.org Origin', function() {
      it('should receive http://example.org Access-Control-Allow-Origin',
        function(done) {

        request(app)
          .get('/')
          .set('Origin', 'http://example.org')
          .expect(200)
          .expect('Access-Control-Allow-Origin', 'http://example.org')
          .end(function(err, res) {
            if (err) throw err;
            done();
          });
      });
    });
    describe('requests with http://example.net Origin', function() {
      it('should receive http://example.net Access-Control-Allow-Origin',
        function(done) {

        request(app)
          .get('/')
          .set('Origin', 'http://example.net')
          .expect(200)
          .expect('Access-Control-Allow-Origin', 'http://example.net')
          .end(function(err, res) {
            if (err) throw err;
            done();
          });
      });
    });
    describe('requests with http://example.info Origin', function() {
      it('should not receive Access-Control headers', function(done) {
        request(app)
          .get('/')
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;

            Object.keys(res.header).forEach(function(header) {
              if (/^access\-control/.test(header)) {
                throw new Error (
                  header + ' header present for unmatched origin request');
              }
            });
            done();
          });
      });
    });
  });
});
