# markdown-it-include

[![Build Status](https://travis-ci.org/camelaissani/markdown-it-include.svg?branch=master)](https://travis-ci.org/camelaissani/markdown-it-include) [![Coverage Status](https://coveralls.io/repos/github/camelaissani/markdown-it-include/badge.svg?branch=master)](https://coveralls.io/github/camelaissani/markdown-it-include?branch=master)

[![NPM](https://nodei.co/npm/markdown-it-include.png)](https://npmjs.org/package/markdown-it-include)

Markdown-it plugin which adds the ability to include markdown fragment files.

## Install

node.js, browser:

```bash
npm install markdown-it-include --save
bower install markdown-it-include --save
```

## Use

Let's create a markdown which uses a header and a footer from two separate files:

**header.md**

```markdown

# This is my header for all my markdowns

```

**footer.md**

```markdown

Follow me on twitter!

```

Let's assume that header.md and footer.md are located in `/in/this/directory`.


Now it's your turn to play markdown-it!

```js
var md = require('markdown-it')()
            .use(require('markdown-it-include'), '/in/this/directory');

md.render('!!!include(header.md)!!!\n\n*your content*\n\n!!!include(footer.md)!!!');
```

It will produce this

```html
<h1>This is my header for all my markdowns</h1>
<p><em>your content</em></p>
<p>Follow me on twitter!</p>
```

## Options

```js
var md = require('markdown-it')()
            .use(require('markdown-it-include'), [, options]);
```

* Type: `String|Object`

If it's a string, it's the same as `options.root`.

### root
* Type: `String`
* Default: `.`

`root` is the base directory of all the markdown files.

### includeRe
* Type: `RegExp`
* Default: `/\!{3}\s*include\s*\(\s*(.+?)\s*\)\s*\!{3}/i`

By default the `!!!include( )!!!` statement is used to include markdown fragment files. This option allows to change the regular expression and then customize this statement.

## Disclaimer

This purposefully doesn't conform to any spec or discussion related to CommonMark.

## License

[MIT](https://github.com/camelaissani/markdown-it-include/blob/master/LICENSE)
