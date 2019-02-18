'use strict';

var assert = require('chai').assert,
    path = require('path'),
    generate = require('markdown-it-testgen');

/*eslint-env mocha*/
var fixturesPath = path.join(__dirname, 'fixtures');

describe('plugin', function () {
  describe('right workflows', function () {
    it ('default.txt', function () {
      var md = require('markdown-it')()
        .use(require('../'), fixturesPath);
      generate(path.join(__dirname, 'fixtures/default.txt'), md);
    });

    it ('including same field twice', function () {
      var md = require('markdown-it')()
        .use(require('../'), fixturesPath);

      assert.equal(md.render('!!! include( a.md ) !!!\n!!! include( a.md ) !!!'),
        '<p><em>a content</em>\n<em>a content</em></p>\n');
    });

    it ('default options', function () {
      var md = require('markdown-it')()
        .use(require('../'));

      assert.equal(md.render('!!! include( test/fixtures/a.md ) !!!\n'),
        '<p><em>a content</em></p>\n');

      md = require('markdown-it')()
        .use(require('../'), {});

      assert.equal(md.render('!!! include( test/fixtures/a.md ) !!!\n'),
        '<p><em>a content</em></p>\n');
    });

    it ('root option', function () {
      var md = require('markdown-it')()
        .use(require('../'), { root: fixturesPath });

      assert.equal(md.render('!!! include( a.md ) !!!\n'),
        '<p><em>a content</em></p>\n');
    });

    it ('includeRe option', function () {
      var md = require('markdown-it')()
        .use(require('../'), { root: fixturesPath, includeRe: /<\[include\]\((.+)\)/i });

      assert.equal(md.render('<[include]( a.md )\n'),
        '<p><em>a content</em></p>\n');
    });
  });

  describe('wrong workflows', function () {
    it ('file not found', function () {
      var md = require('markdown-it')()
        .use(require('../'), fixturesPath);

      assert.throws(function () {
        md.render('!!! include( xxx.md ) !!!');
      }, Error, /ENOENT/);
    });

    it ('direct circular reference', function () {
      var md = require('markdown-it')()
        .use(require('../'), fixturesPath);

      assert.throws(function () {
        md.render('!!! include( c.md ) !!!');
      }, Error, /circular reference/i);
    });

    it ('indirect circular reference', function () {
      var md = require('markdown-it')()
        .use(require('../'), fixturesPath);

      assert.throws(function () {
        md.render('!!! include( L1/L2/e2.md ) !!!');
      }, Error, /circular reference/i);
    });
  });
});
