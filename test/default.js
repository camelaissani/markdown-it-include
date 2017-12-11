'use strict';

var assert = require('chai').assert,
    path = require('path'),
    generate = require('markdown-it-testgen');

/*eslint-env mocha*/

describe('plugin', function () {
  describe('right workflows', function () {
    it ('default.txt', function() {
      var md = require('markdown-it')()
                .use(require('../'), path.join(__dirname, 'fixtures'));
      generate(path.join(__dirname, 'fixtures/default.txt'), md);
    });
  });

  describe('wrong workflows', function() {
    it ('file not found', function() {
      var md = require('markdown-it')()
                  .use(require('../'), path.join(__dirname, 'fixtures'));

      assert.throws(function() {
        md.render('!!! include( xxx.md ) !!!');
      }, Error, /ENOENT/);
    });

    it ('direct circular reference', function() {
      var md = require('markdown-it')()
                  .use(require('../'), path.join(__dirname, 'fixtures'));

      assert.throws(function() {
        md.render('!!! include( c.md ) !!!');
      }, Error, /circular reference/i);
    });

    it ('indirect circular reference', function() {
      var md = require('markdown-it')()
                  .use(require('../'), path.join(__dirname, 'fixtures'));

      assert.throws(function() {
        md.render('!!! include( L1/L2/e2.md ) !!!');
      }, Error, /circular reference/i);
    });
  });
});
