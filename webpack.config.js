const {webpackConfig, relDir} = require("./webpack.common");

module.exports = {
  entry: {
    index: relDir("src/index.ts"),
    logo: relDir("src/logo.ts"),
    demo: relDir("src/demo.ts"),
  },
  ...webpackConfig(false),
};
