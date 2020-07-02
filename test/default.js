
/* eslint-env mocha, es6 */

/*eslint-env mocha*/

let assert = require('chai').assert;
let path = require('path');
let generate = require('markdown-it-testgen');
let markdown = require('markdown-it');
let markdown_it_include = require('../');

let fixturesPath = path.join(__dirname, 'fixtures');

describe('plugin', function () {
  describe('right workflows', function () {
    it ('default.txt', function () {
      let md = markdown()
        .use(markdown_it_include, fixturesPath);
      generate(path.join(__dirname, 'fixtures/default.txt'), md);
    });

    it ('including same field twice', function () {
      let md = markdown()
        .use(markdown_it_include, fixturesPath);

      assert.equal(md.render('!!! include( a.md ) !!!\n!!! include( a.md ) !!!'),
        '<p><em>a content</em>\n<em>a content</em></p>\n');
    });

    it ('default options', function () {
      let md = markdown()
        .use(markdown_it_include);

      assert.equal(md.render('!!! include( test/fixtures/a.md ) !!!\n'),
        '<p><em>a content</em></p>\n');

      md = markdown()
        .use(markdown_it_include, {});

      assert.equal(md.render('!!! include( test/fixtures/a.md ) !!!\n'),
        '<p><em>a content</em></p>\n');
    });

    it ('root option', function () {
      let md = markdown()
        .use(markdown_it_include, { root: fixturesPath });

      assert.equal(md.render('!!! include( a.md ) !!!\n'),
        '<p><em>a content</em></p>\n');
    });

    it ('includeRe option', function () {
      let md = markdown()
        .use(markdown_it_include, {
          root: fixturesPath,
          includeRe: /<\[include\](.+)/i,
          bracesAreOptional: false           // path MUST have braces
        });

      assert.equal(md.render('<[include]( a.md )\n'),
        '<p><em>a content</em></p>\n');
    });
  });

  describe('wrong workflows', function () {
    it ('file not found', function () {
      let md = markdown()
        .use(markdown_it_include, fixturesPath);

      assert.throws(function () {
        md.render('!!! include( xxx.md ) !!!');
      }, Error, /not found/i);
    });

    it ('direct circular reference', function () {
      let md = markdown()
        .use(markdown_it_include, fixturesPath);

      assert.throws(function () {
        md.render('!!! include( c.md ) !!!');
      }, Error, /circular reference/i);
    });

    it ('indirect circular reference', function () {
      let md = markdown()
        .use(markdown_it_include, fixturesPath);

      assert.throws(function () {
        md.render('!!! include( L1/L2/e2.md ) !!!');
      }, Error, /circular reference/i);
    });
  });

  describe('options', function () {
    const options = {
      root: fixturesPath,
      includeRe: /#include(.+)/,
      bracesAreOptional: true
    };

    it ('accepts C-like includes with custom RE', function () {
      let md = markdown()
        .use(markdown_it_include, options);
      generate(path.join(__dirname, 'fixtures/incM.txt'), md);
    });

    it ('barfs on illegal include statement without space(s)', function () {
      let md = markdown()
        .use(markdown_it_include, options);

      assert.throws(
        () => md.render('#includexxx.md'),
        Error, /when not using braces around the path.*it MUST be preceeded by at least one whitespace character/i);
    });

    it ('barfs on missing braces when option says they\'re mandatory (default)', function () {
      let md = markdown()
        .use(markdown_it_include, Object.assign({}, options, { bracesAreOptional: false }));

      assert.throws(
        () => md.render('#include xxx.md'),
        Error, /MUST have .*().* braces around the include path/i);
    });

    it ('dumps error in the generated output when throwError option is FALSE', function () {
      let md = markdown()
        .use(markdown_it_include, Object.assign({}, options, { throwError: false }));

      assert.match(md.render('#include(xxx.md)'),
        /<h1>INCLUDE ERROR: File .*xxx\.md.* not found\.<\/h1>/i);
    });
  });
});
