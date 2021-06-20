/*! markdown-it-include 2.0.0 https://github.com//camelaissani/markdown-it-include @license MIT */

'use strict';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

const path = require('path');

const fs = require('fs');

const INCLUDE_RE = /!{3}\s*include(.+?)!{3}/i;
const BRACES_RE = /\((.+?)\)/i;

const include_plugin = (md, options) => {
  const defaultOptions = {
    root: '.',
    getRootDir: (pluginOptions
    /*, state, startLine, endLine*/
    ) => pluginOptions.root,
    includeRe: INCLUDE_RE,
    throwError: true,
    bracesAreOptional: false,
    notFoundMessage: 'File \'{{FILE}}\' not found.',
    circularMessage: 'Circular reference between \'{{FILE}}\' and \'{{PARENT}}\'.'
  };

  if (typeof options === 'string') {
    options = _extends({}, defaultOptions, {
      root: options
    });
  } else {
    options = _extends({}, defaultOptions, options);
  }

  const _replaceIncludeByContent = (src, rootdir, parentFilePath, filesProcessed) => {
    filesProcessed = filesProcessed ? filesProcessed.slice() : []; // making a copy

    let cap, filePath, mdSrc, errorMessage; // store parent file path to check circular references

    if (parentFilePath) {
      filesProcessed.push(parentFilePath);
    }

    while (cap = options.includeRe.exec(src)) {
      let includePath = cap[1].trim();
      const sansBracesMatch = BRACES_RE.exec(includePath);

      if (!sansBracesMatch && !options.bracesAreOptional) {
        errorMessage = `INCLUDE statement '${src.trim()}' MUST have '()' braces around the include path ('${includePath}')`;
      } else if (sansBracesMatch) {
        includePath = sansBracesMatch[1].trim();
      } else if (!/^\s/.test(cap[1])) {
        // path SHOULD have been preceeded by at least ONE whitespace character!

        /* eslint max-len: "off" */
        errorMessage = `INCLUDE statement '${src.trim()}': when not using braces around the path ('${includePath}'), it MUST be preceeded by at least one whitespace character to separate the include keyword and the include path.`;
      }

      if (!errorMessage) {
        filePath = path.resolve(includePath.indexOf('/') === 0 ? rootdir : parentFilePath ? path.dirname(parentFilePath) : rootdir, `./${includePath}`); // check if child file exists or if there is a circular reference

        if (!fs.existsSync(filePath)) {
          // child file does not exist
          errorMessage = options.notFoundMessage.replace('{{FILE}}', filePath);
        } else if (filesProcessed.indexOf(filePath) !== -1) {
          // reference would be circular
          errorMessage = options.circularMessage.replace('{{FILE}}', filePath).replace('{{PARENT}}', parentFilePath);
        }
      } // check if there were any errors


      if (errorMessage) {
        if (options.throwError) {
          throw new Error(errorMessage);
        }

        mdSrc = `\n\n# INCLUDE ERROR: ${errorMessage}\n\n`;
      } else {
        // get content of child file
        mdSrc = fs.readFileSync(filePath, 'utf8'); // check if child file also has includes

        mdSrc = _replaceIncludeByContent(mdSrc, rootdir, filePath, filesProcessed); // remove one trailing newline, if it exists: that way, the included content does NOT
        // automatically terminate the paragraph it is in due to the writer of the included
        // part having terminated the content with a newline.
        // However, when that snippet writer terminated with TWO (or more) newlines, these, minus one,
        // will be merged with the newline after the #include statement, resulting in a 2-NL paragraph
        // termination.

        const len = mdSrc.length;

        if (mdSrc[len - 1] === '\n') {
          mdSrc = mdSrc.substring(0, len - 1);
        }
      } // replace include by file content


      src = src.slice(0, cap.index) + mdSrc + src.slice(cap.index + cap[0].length, src.length);
    }

    return src;
  };

  const _includeFileParts = (state, startLine, endLine
  /*, silent*/
  ) => {
    state.src = _replaceIncludeByContent(state.src, options.getRootDir(options, state, startLine, endLine));
  };

  md.core.ruler.before('normalize', 'include', _includeFileParts);
};

module.exports = include_plugin;
//# sourceMappingURL=markdownItInclude.js.map
