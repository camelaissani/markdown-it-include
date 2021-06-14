
const path = require('path');
const fs = require('fs');

const INCLUDE_RE = /!{3}\s*include(.+?)!{3}/i;
const BRACES_RE = /\((.+?)\)/i;

const include_plugin = (md, options) => {
  const defaultOptions = {
    rootScope: '.',
    root: '.',
    getRootDir: (pluginOptions/*, state, startLine, endLine*/) => pluginOptions.root,
    getRootScope: (pluginOptions/*, state, startLine, endLine*/) => pluginOptions.rootScope,
    rootScopeProtection: false,
    includeRe: INCLUDE_RE,
    throwError: true,
    bracesAreOptional: false,
    notFoundMessage: 'File \'{{FILE}}\' not found.',
    outsideRootScopeMessage: 'File \'{{FILE}}\' is outside the specified root directory scope \'{{ROOT}}\'.',
    circularMessage: 'Circular reference between \'{{FILE}}\' and \'{{PARENT}}\'.'
  };

  if (typeof options === 'string') {
    options = {
      ...defaultOptions,
      root: options,
      rootScope: options
    };
  } else {
    options = {
      ...defaultOptions,
      ...options
    };
  }

  const _replaceIncludeByContent = (src, rootdir, rootScope, parentFilePath, filesProcessed) => {
    filesProcessed = filesProcessed ? filesProcessed.slice() : []; // making a copy
    let cap, filePath, mdSrc, errorMessage;

    // store parent file path to check circular references
    if (parentFilePath) {
      filesProcessed.push(parentFilePath);
    }
    while ((cap = options.includeRe.exec(src))) {
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
        filePath = path.resolve(rootdir, includePath);
        const relativeFilePath = path.relative(rootScope, filePath);

        // check if desired file is a descendant of specified rootDir
        if (relativeFilePath.startsWith('..') && options.rootScopeProtection) {
          errorMessage = options.outsideRootScopeMessage.replace('{{FILE}}', filePath).replace('{{ROOT}}', rootdir);
        } else if (!fs.existsSync(filePath)) { // check if child file exists or if there is a circular reference
          // child file does not exist
          errorMessage = options.notFoundMessage.replace('{{FILE}}', filePath);
        } else if (filesProcessed.indexOf(filePath) !== -1) {
          // reference would be circular
          errorMessage = options.circularMessage.replace('{{FILE}}', filePath).replace('{{PARENT}}', parentFilePath);
        }
      }

      // check if there were any errors
      if (errorMessage) {
        if (options.throwError) {
          throw new Error(errorMessage);
        }
        mdSrc = `\n\n# INCLUDE ERROR: ${errorMessage}\n\n`;
      } else {
        // get content of child file
        mdSrc = fs.readFileSync(filePath, 'utf8');
        // check if child file also has includes
        mdSrc = _replaceIncludeByContent(mdSrc, path.dirname(filePath), rootScope, filePath, filesProcessed);
        // remove one trailing newline, if it exists: that way, the included content does NOT
        // automatically terminate the paragraph it is in due to the writer of the included
        // part having terminated the content with a newline.
        // However, when that snippet writer terminated with TWO (or more) newlines, these, minus one,
        // will be merged with the newline after the #include statement, resulting in a 2-NL paragraph
        // termination.
        const len = mdSrc.length;
        if (mdSrc[len - 1] === '\n') {
          mdSrc = mdSrc.substring(0, len - 1);
        }
      }

      // replace include by file content
      src = src.slice(0, cap.index) + mdSrc + src.slice(cap.index + cap[0].length, src.length);
    }
    return src;
  };

  const _includeFileParts = (state, startLine, endLine/*, silent*/) => {
    state.src = _replaceIncludeByContent(state.src, options.getRootDir(options, state, startLine, endLine), options.getRootScope(options, state, startLine, endLine));
  };

  md.core.ruler.before('normalize', 'include', _includeFileParts);
};

module.exports = include_plugin;
