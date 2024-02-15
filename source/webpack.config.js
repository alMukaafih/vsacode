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
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: {
                                target: "es2015",
                                module: "commonjs",
                                moduleResolution: "node",
                                resolveJsonModule: true,
                                allowJs: true,
                                outDir: "./dist",
                                removeComments: true,
                                esModuleInterop: true,
                                forceConsistentCasingInFileNames: true,
                                noImplicitAny: false,
                                strict: false
    },
                        }
                    }
                ],
            },
        ],
    },
    plugins: [],
};
