import * as path from "path";

export default {
    mode: "production",
    entry: {
        main: "./src/main.ts",
    },
    output: {
        path: path.resolve(import.meta.dirname, "..", "..", "dist", "templates"),
        filename: "iconTheme.js",
        chunkFilename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".js"],
        modules: ["node_modules"],
    },
    module: {
        rules: [
            {
                test: /\.(svg|png)$/,
                exclude: /node_modules/,
                loader: "asset/resource",
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: "ts-loader",
            },
        ],
    },
    plugins: [],
};
