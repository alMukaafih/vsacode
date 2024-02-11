module.exports = {
    entry: {
        main: "./src/main.ts",
    },
    output: {
        path: "",
        filename: "[name].js",
        chunkFilename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
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
        ],
    },
    plugins: [],
};
