const path = require('path');

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const extractLess = new ExtractTextPlugin("SteamAutoTrader.css");
const {VueLoaderPlugin} = require('vue-loader');


const distPath = "./content_scripts/";

const webpackConfig = {
    entry: {
        "SteamAutoTrader": "./src/js/SteamAutoTrader.js",
        "Bootstrap": "./src/js/Bootstrap.js",
        "Background": "./src/js/Background.js",
    },

    cache: true,
    target: 'web',
    mode: 'production',
    devtool: false,

    output: {
        path: getFullPath(distPath),
        filename: "[name].js",
        publicPath: distPath,
    },

    stats: {
        warnings: false,
        children: false,
    },

    resolve: {
        alias: {
            '@': getFullPath("src"),
            vue$: 'vue/dist/vue.common.js',
        },
    },

    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        css: extractLess.extract({
                            use: [{
                                loader: 'vue-style-loader',
                            }, {
                                loader: "css-loader"
                            }],

                            fallback: "style-loader"
                        })
                    }
                }
            },

            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /(node_modules|bower_components)/,
            },

            {
                test: /\.less$/,
                exclude: /node_modules/,
                loader: extractLess.extract({
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "less-loader"
                    }],

                    fallback: "style-loader"
                })
            },

            {
                test: /\.css$/,
                loader: extractLess.extract({
                    use: [{
                        loader: "css-loader",
                        options: {
                            minimize: true
                        }
                    }],

                    fallback: "style-loader"
                })
            },
        ],
    },

    plugins: [
        extractLess,

        new VueLoaderPlugin(),

        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessorOptions: {discardComments: {removeAll: true}},
        })
    ]
};


module.exports = webpackConfig;


function getFullPath(relPath = "") {
    return path.join(__dirname, relPath);
}