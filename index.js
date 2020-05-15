'use strict';

var path = require('path'),
    fs = require('fs');

var INCLUDE_RE = /\!{3}\s*include\s*\(\s*(.+?)\s*\)\s*\!{3}/i;

module.exports = function include_plugin(md, options) {
  var root = '.',
      includeRe = INCLUDE_RE,
      throwError = true,
      notFoundMessage = 'File \'{{FILE}}\' not found',
      circularMessage = 'Circular reference between \'{{FILE}}\' and \'{{PARENT}}\'';

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
    filesProcessed = filesProcessed ? filesProcessed.slice() : []; // making a copy
    var cap, filePath, mdSrc, errorMessage;

    // store parent file path to check circular references
    if (parentFilePath) {
      filesProcessed.push(parentFilePath);
    }
    while ((cap = includeRe.exec(src))) {
      filePath = path.resolve(rootdir, cap[1].trim());

      // check if child file exists or if there is a circular reference
      if (!fs.existsSync(filePath)) {
        // child file does not exist
        errorMessage = notFoundMessage.replace('{{FILE}}', filePath);
      } else if (filesProcessed.indexOf(filePath) !== -1) {
        // reference would be circular
        errorMessage = circularMessage.replace('{{FILE}}', filePath).replace('{{PARENT}}', parentFilePath);
      }

      // check if there were any errors
      if (errorMessage) {
        if (throwError) {
          throw new Error(errorMessage);
        }
        mdSrc = errorMessage;
      } else {
        // get content of child file
        mdSrc = fs.readFileSync(filePath, 'utf8');
        // check if child file also has includes
        mdSrc = _replaceIncludeByContent(mdSrc, path.dirname(filePath), filePath, filesProcessed);
      }

      // replace include by file content
      src = src.slice(0, cap.index) + mdSrc + src.slice(cap.index + cap[0].length, src.length);
    }
    return src;
  }

  function _includeFileParts(state) {
    state.src = _replaceIncludeByContent(state.src, root);
  }

  md.core.ruler.before('normalize', 'include', _includeFileParts);
};
