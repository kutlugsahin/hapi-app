const path = require('path');
const nodeExternals = require('webpack-node-externals');
const srcPath = path.join(__dirname, 'src');
const outPath = path.join(__dirname, 'dist');

module.exports = {
    mode: 'development',
    entry: path.join(srcPath, 'index.ts'),
    target: 'node',
    devtool: 'source-map',
    output: {
        filename: 'index.js',
        path: outPath,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    externals: [nodeExternals(), '@hapi'],
};