import * as path from "path";
import { exec } from "child_process";

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
      main: "./src/main.ts",
    },
    output: {
      path: path.resolve(import.meta.dirname, "dist"),
      filename: "[name].js",
      chunkFilename: "[name].js",
    },
    resolve: {
      extensionAlias: {
        '.js': ['.ts', '.js'],
        '.mjs': ['.mts', '.mjs'],
      },
      fallback: { "os": false, "path": false, "fs": false }
    },
    module: {
      rules,
    },
  };

  return [main];
};
