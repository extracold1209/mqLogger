const path = require('path');
const webpackNodeExternals = require('webpack-node-externals');

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: path.join(__dirname, 'src', 'index.ts'),
    output: {
        library: 'mq-logger',
        libraryTarget: 'commonjs2',
        libraryExport: 'default',
        path: path.join(__dirname, 'dist'),
        filename: 'index.bundle.js',
    },
    resolve: {
        extensions: ['.js', '.ts', '.ts']
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
        ],
    },
    externals: [webpackNodeExternals()]
};
