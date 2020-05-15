# markdown-it-include

[![Build Status](https://img.shields.io/travis/camelaissani/markdown-it-include/master.svg?style=flat)](https://travis-ci.org/camelaissani/markdown-it-include)
[![NPM version](https://img.shields.io/npm/v/markdown-it-include.svg?style=flat)](https://www.npmjs.org/package/markdown-it-include)
[![Coverage Status](https://img.shields.io/coveralls/camelaissani/markdown-it-include/master.svg?style=flat)](https://coveralls.io/r/camelaissani/markdown-it-include?branch=master)

Markdown-it plugin which adds the ability to include markdown fragment files.

## Install

node.js, browser:

```bash
npm install markdown-it-include --save
bower install markdown-it-include --save
```

## Use

Let's create a markdown which uses a header and a footer from two separate files:

### File: '**header.md**'

```markdown
# This is my header for all my markdowns
```

### File: '**footer.md**'

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

### throwError

* Type: `Boolean`
* Default: `true`

When set to `false`, instead of throwing an error message, the error message will be written into the output. For references to possible error messages as well as how to change it, see options 'notFoundMessage' and 'circularMessage'

### notFoundMessage

* Type: `String`
* Default: `File '{{FILE}}' not found`

With `notFoundMessage` the default error message when the to be included file cannot be found can be changed. The marker `{{FILE}}` in the message string will be replaced with the full file path.

### circularMessage

* Type: `String`
* Default: `Circular reference between '{{FILE}}' and '{{PARENT}}'`

With `circularMessage` the default error message when there is a circular reference between files can be changed. The markers `{{FILE}}` and `{{FILE}}` in the message string will be replaced with the respective full file paths.

## Disclaimer

This purposefully doesn't conform to any spec or discussion related to CommonMark.

## License

[MIT](https://github.com/camelaissani/markdown-it-include/LICENSE)
