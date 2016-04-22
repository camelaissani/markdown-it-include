# markdown-it-include

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
            .use(require('markdown-it-include', path.join(__dirname, 'your_md_directory')));

md.render('!!!include(header.md)!!!\n\n*content*\n\n!!!include(footer.md)!!!');
```

header.md and footer.md should be located in `your_md_directory`.

## License

[MIT](https://github.com/camelaissani/markdown-it-include/blob/master/LICENSE)