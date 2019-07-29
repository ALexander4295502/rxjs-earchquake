const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (_, argv) => ({
  entry: glob.sync("./src/js/**/*.js"),
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  watch: argv.mode === 'development',
  devtool: argv.mode === 'development' ? "inline-source-map" : "source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [{
            loader: 'file-loader',
            options: {
                name:'img/[name]_[hash:7].[ext]',
            }
        }]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/html/earthquake.html"
    })
  ]
});
