import * as path from "path";

export default (env, options) => {
  const { mode = "development" } = options;
  const rules = [
    {
      test: /\.m?js$/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      ],
    },
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
      path: path.resolve(import.meta.dirname, "dist"),
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
