const path = require("path");

module.exports = (env, options) => {
  const { mode = "development" } = options;
  const rules = [
    {
      test: /\.(svg|png)$/,
      exclude: /node_modules/,
      loader: "file-loader",
    },
    {
      test: /\.ts$/,
      exclude: /node_modules/,
      use: "ts-loader",
    },
  ];

  const main = {
    mode,
    entry: {
      main: "./src/vsacode.ts",
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      chunkFilename: "[name].js",
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules,
    },
  };

  return [main];
};
