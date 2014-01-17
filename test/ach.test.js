var request = require('supertest');
var express = require('express');
var ach = require('../index.js');

describe("CORS headers", function() {
  describe("for ach defaults", function() {
    var app = express();

    app.use(ach());
    app.get('/', function(req, res) {
      res.send(200);
    });
    describe('origin-less requests', function() {
      it('should not receive any Access-Control headers', function(done) {
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
  });
});
