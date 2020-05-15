let path = require('path'),
    fs = require('fs');

let INCLUDE_RE = /\!{3}\s*include\s*\(\s*(.+?)\s*\)\s*\!{3}/i;

module.exports = function include_plugin(md, options) {
  let root = '.',
      includeRe = INCLUDE_RE,
      throwError = true,
      notFoundMessage = 'File \'{{FILE}}\' not found.',
      circularMessage = 'Circular reference between \'{{FILE}}\' and \'{{PARENT}}\'.';

  if (options) {
    if (typeof options === 'string') {
      root = options;
    } else {
      root = options.root || root;
      includeRe = options.includeRe || includeRe;
      throwError = options.throwError || throwError;
      notFoundMessage = options.notFoundMessage || notFoundMessage;
      circularMessage = options.circularMessage || circularMessage;
    }
  }

  function _replaceIncludeByContent(src, rootdir, parentFilePath, filesProcessed) {
    filesProcessed = filesProcessed ? filesProcessed.slice() : [];
    let cap, filePath, mdSrc, errorMessage;

    if (parentFilePath) {
      filesProcessed.push(parentFilePath);
    }

    while (cap = includeRe.exec(src)) {
      filePath = path.resolve(rootdir, cap[1].trim());

      if (!fs.existsSync(filePath)) {
        errorMessage = notFoundMessage.replace('{{FILE}}', filePath);
      } else if (filesProcessed.indexOf(filePath) !== -1) {
        errorMessage = circularMessage.replace('{{FILE}}', filePath).replace('{{PARENT}}', parentFilePath);
      }

      if (errorMessage) {
        if (throwError) {
          throw new Error(errorMessage);
        }

        mdSrc = `\n\n${errorMessage}\n\n`;
      } else {
        mdSrc = fs.readFileSync(filePath, 'utf8');
        mdSrc = _replaceIncludeByContent(mdSrc, path.dirname(filePath), filePath, filesProcessed);
        let len = mdSrc.length;

        if (mdSrc[len - 1] === '\n') {
          mdSrc = mdSrc.substring(0, len - 1);
        }
      }

      src = src.slice(0, cap.index) + mdSrc + src.slice(cap.index + cap[0].length, src.length);
    }

    return src;
  }

  function _includeFileParts(state) {
    state.src = _replaceIncludeByContent(state.src, root);
  }

  md.core.ruler.before('normalize', 'include', _includeFileParts);
};
//# sourceMappingURL=markdownItInclude.modern.js.map
