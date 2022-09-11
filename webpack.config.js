const { resolve } = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const { merge } = require('webpack-merge');
const package = require('./package.json');

module.exports = (env, args) => {
    const buildConfig = (config, files = {}) =>
        merge(config, {
            devtool: 'source-map',
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        loader: 'ts-loader',
                        exclude: /node_modules/,
                    },
                    {
                        test: /\.elm$/,
                        exclude: [/elm-stuff/, /node_modules/],
                        loader: 'elm-webpack-loader',
                    },
                    {
                        test: /\.s[ac]ss$/i,
                        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
                    },
                ],
            },
            resolve: {
                extensions: ['.ts', '.js', '.elm'],
            },
            plugins: [
                new webpack.IgnorePlugin({
                    resourceRegExp: /^fs$/,
                }),
                new FileManagerPlugin({
                    events: {
                        onEnd: {
                            copy: Object.entries(files).map(([source, destination]) => ({
                                source: source.replace(/^.*\|/, ''),
                                destination,
                            })),
                        },
                    },
                }),
                new webpack.EnvironmentPlugin({
                    NODE_ENV: args.mode,
                    VERSION: args.mode === 'development' ? `${package.version}-dev` : package.version,
                }),
            ],
            performance: {
                maxEntrypointSize: 1024 * 1024,
                maxAssetSize: 1024 * 1024,
            },
        });

    const dist = args.mode === 'development' ? 'dist-dev' : 'dist';

    const config = [
        buildConfig(
            {
                entry: './worker/src/main/stellerator.ts',
                output: {
                    path: resolve(__dirname, `${dist}/worker`),
                    filename: 'stellerator.js',
                },
            },
            {
                [`1|${dist}/worker/**/*`]: `${dist}/stellerator/worker`,
                [`2|${dist}/worker/**/*`]: `${dist}/embedded/worker`,
            }
        ),
        buildConfig(
            {
                entry: './src/web/embedded/stellerator/index.ts',
                output: {
                    path: resolve(__dirname, `${dist}/embedded`),
                    filename: 'stellerator-embedded.js',
                    library: {
                        name: '$6502',
                        type: 'umd',
                    },
                    libraryExport: 'default',
                },
            },
            {
                'html/stellerator-embedded.html': `${dist}/embedded/index.html`,
                'aux/2600/flapping/flapping.bin': `${dist}/embedded/`,
            }
        ),
        buildConfig(
            {
                entry: './src/frontend/stellerator/index.ts',
                plugins: [
                    new MiniCssExtractPlugin({
                        filename: 'app.css',
                    }),
                ],
                output: {
                    path: resolve(__dirname, `${dist}/stellerator`),
                    filename: 'app.js',
                },
            },
            {
                'html/stellerator.html': `${dist}/stellerator/index.html`,
                'LICENSE.md': `${dist}/stellerator/`,
                'README.md': `${dist}/stellerator/`,
                'CHANGELOG.md': `${dist}/stellerator/`,
                'doc/**/*': `${dist}/stellerator/doc`,
            }
        ),
    ];

    return config;
};