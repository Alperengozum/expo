"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertLightningCssToReactNativeWebStyleSheet = convertLightningCssToReactNativeWebStyleSheet;
exports.matchCssModule = matchCssModule;
exports.transformCssModuleWeb = transformCssModuleWeb;
function _css() {
  const data = require("./css");
  _css = function () {
    return data;
  };
  return data;
}
const RNW_CSS_CLASS_ID = '_';
async function transformCssModuleWeb(props) {
  const {
    transform
  } = require('lightningcss');

  // TODO: Add bundling to resolve imports
  // https://lightningcss.dev/bundling.html#bundling-order

  const cssResults = transform({
    filename: props.filename,
    code: Buffer.from(props.src),
    sourceMap: props.options.sourceMap,
    cssModules: {
      // Prevent renaming CSS variables to ensure
      // variables created in global files are available.
      dashedIdents: false
    },
    // cssModules: true,
    projectRoot: props.options.projectRoot,
    minify: props.options.minify
  });
  const codeAsString = cssResults.code.toString();
  const {
    styles,
    reactNativeWeb,
    variables
  } = convertLightningCssToReactNativeWebStyleSheet(cssResults.exports);
  let outputModule = `module.exports=Object.assign(${JSON.stringify(styles)},{unstable_styles:${JSON.stringify(reactNativeWeb)}},${JSON.stringify(variables)});`;
  if (props.options.dev) {
    const runtimeCss = (0, _css().wrapDevelopmentCSS)({
      ...props,
      src: codeAsString
    });
    outputModule += '\n' + runtimeCss;
  }
  return {
    output: outputModule,
    css: cssResults.code,
    map: cssResults.map
  };
}
function convertLightningCssToReactNativeWebStyleSheet(input) {
  const styles = {};
  const reactNativeWeb = {};
  const variables = {};
  // e.g. { container: { name: 'ahs8IW_container', composes: [], isReferenced: false }, }
  Object.entries(input).map(([key, value]) => {
    // order matters here
    let className = value.name;
    if (value.composes.length) {
      className += ' ' + value.composes.map(value => value.name).join(' ');
    }

    // CSS Variables will be `{string: string}`
    if (key.startsWith('--')) {
      variables[key] = className;
    }
    styles[key] = className;
    reactNativeWeb[key] = {
      $$css: true,
      [RNW_CSS_CLASS_ID]: className
    };
    return {
      [key]: {
        $$css: true,
        [RNW_CSS_CLASS_ID]: className
      }
    };
  });
  return {
    styles,
    reactNativeWeb,
    variables
  };
}
function matchCssModule(filePath) {
  return !!/\.module(\.(native|ios|android|web))?\.(css|s[ac]ss)$/.test(filePath);
}
//# sourceMappingURL=css-modules.js.map