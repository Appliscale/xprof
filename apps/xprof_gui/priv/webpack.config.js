"use strict";

var webpack = require("webpack");
var path = require("path");

var config = {
    // We split the entry into two specific chunks. Our app and vendors. Vendors
    // specify that react should be part of that chunk.
    entry: {
      app: [ "./app/graph.jsx", "./app/main.jsx" ],
      vendors: [ "jquery", "lodash", "react", "moment" ]
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin("vendors", "vendors.js"),
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        _: "lodash",
        moment: "moment"
      })
    ],
    output: {
      path: "./build",
      filename: "bundle.js",
      publicPath: "build/"
    },
    module: {
      noParse: [],
      loaders: [
        { test: path.join(__dirname, "app"), loader: "babel", query: { presets: [ "react", "es2015" ] } },
        { test: /\.less$/, loader: "style!css!less" },
        { test: /\.css$/, loaders: [ "style", "css" ] },
        { test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/font-woff" },
        { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/octet-stream" },
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
        { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=image/svg+xml" }
      ]
    }
};

module.exports = config;
