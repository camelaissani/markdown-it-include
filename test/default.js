
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

    // same example code as in the README for getRootDir, adjusted for the test directories:
    it ('accepts a dynamic option.getRootDir() function to load includes from active directory', function () {
      const options2 = {
        root: '/bogus/',          // this is not used here.
        getRootDir: (pluginOptions, state, startLine, endLine) => state.env.getIncludeRootDir(pluginOptions, state, startLine, endLine),
        includeRe: /#include(.+)/,
        bracesAreOptional: true
      };
      let md = markdown()
        .use(markdown_it_include, options2);

      // `mdPath` is an absolute path assumed to be pointing to the MD file being processed:
      let mdPath = path.resolve(path.join(__dirname, 'fixtures/foo/bar.md'));

      let env = {};
      env.getIncludeRootDir = () => path.dirname(mdPath);

      // Use the 'unwrapped' version of the md.render / md.parse process:
      // ----------------------------------------------------------------
      //
      // let content = md.render(data); --> .parse + .renderer.render
      //
      // .parse --> new state + process: return tokens
      // let tokens = md.parse(data, env)
      /* eslint max-len: "off" */
      let state = new md.core.State('bla\n\n#include(../z.md)\n\n#include(../q.md)\n', md, env);   // <-- here our env is injected into state!
      md.core.process(state);
      let tokens = state.tokens;
      // now call md.render():
      let htmlContent = md.renderer.render(tokens, md.options, env);
      // presto!              (End of `env` lifetime, BTW.)

      // What happened above? q.md includes a1.md and a2.md:
      assert.equal(htmlContent,
        /* eslint max-len: "off" */
        '<p>bla</p>\n<p>z content*</p>\n<p>*q content &amp; checking nested includes next:</p>\n<p><em>a1 content</em>\n<em>a2 content</em></p>\n');
    });
  });
});
