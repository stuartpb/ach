var request = require('supertest');
var express = require('express');
var ach = require('../index.js');

describe("using ach", function() {
  describe("with wildcard allowOrigin and allowCredentials", function() {
    var app = express();

    app.use(ach({allowCredentials: true}));
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
      it('should receive requesting Access-Control-Allow-Origin',
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
      it('should receive Access-Control-Allow-Credentials=true',
        function(done) {

        request(app)
          .get('/')
          .set('Origin', 'http://example.com')
          .expect(200)
          .expect('Access-Control-Allow-Credentials', 'true')
          .end(function(err, res) {
            if (err) throw err;
            done();
          });
      });
    });
  });
});
