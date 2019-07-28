const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = env => ({
  entry: glob.sync("./src/js/**/*.js"),
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  watch: env.dev,
  devtool: env.dev ? "inline-source-map" : "source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/html/earthquake.html"
    })
  ]
});
