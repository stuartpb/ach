var request = require('supertest');
var express = require('express');
var ach = require('../index.js');

describe("using ach", function() {
  describe("with defaults", function() {
    var app = express();

    app.use(ach());
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

    describe('requests with Origin set', function() {
      it('should receive a wildcard Access-Control-Allow-Origin',
        function(done) {

        request(app)
          .get('/')
          .set('Origin', 'http://example.com')
          .expect(200)
          .expect('Access-Control-Allow-Origin', '*')
          .end(function(err, res) {
            if (err) throw err;
            done();
          });
      });
    });

    describe('requests with Origin set', function() {
      it('should receive the default Access-Control-Allow-Headers',
        function(done) {

        request(app)
          .get('/')
          .set('Origin', 'http://example.com')
          .expect(200)
          .expect('Access-Control-Allow-Headers', 'X-Requested-With')
          .end(function(err, res) {
            if (err) throw err;
            done();
          });
      });
    });
  });
});
