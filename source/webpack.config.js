module.exports = {
    mode: "production",
    entry: {
        main: "",
    },
    output: {
        path: "",
        filename: "[name].js",
        chunkFilename: "[name].js",
    },
//     resolve: {
//         extensions: [".ts", ".js"],
//         modules: ["node_modules"],
//     },
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
