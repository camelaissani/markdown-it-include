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

```js
var path = require('path'),
    md = require('markdown-it')()
            .use(require('markdown-it-include'), path.join(__dirname, 'your_md_directory'));

md.render('!!!include(header.md)!!!\n\n*content*\n\n!!!include(footer.md)!!!');
```

header.md and footer.md should be located in `your_md_directory`.

## License

[MIT](https://github.com/camelaissani/markdown-it-include/blob/master/LICENSE)
