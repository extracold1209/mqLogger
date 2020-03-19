const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: path.join(__dirname, 'src', 'index.ts'),
    output: {
        library: 'mq-logger',
        libraryTarget: 'commonjs',
        path: path.join(__dirname, 'dist'),
        filename: 'index.bundle.js',
    },
    resolve: {
        extensions: ['.js', '.ts', '.ts']
    },
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
};
