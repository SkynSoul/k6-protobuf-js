const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    devtool: 'inline-source-map',
    entry: {
        demo: './src/k6-entry/demo.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'demo.bundle.js',
        libraryTarget: 'commonjs',
        globalObject: 'this',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
        ],
    },
    target: 'web',
    externals: /^(k6|https?\:\/\/)(\/.*)?/,
    resolve: {
        fallback: {
            buffer: require.resolve("buffer/"),
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
    ],
}