const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const { ProvidePlugin, DefinePlugin } = require("webpack");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

require("dotenv").config();

module.exports = {
  entry: "./src/index.tsx",
  mode: "development",
  optimization: {
    usedExports: true,
    splitChunks: {
      cacheGroups: {
        source: {
          test: /[\\/]src[\\/]/,
          name: "source",
          chunks: "all",
        },
        "vendor-react-redux": {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|react-redux|redux|redux-thunk|@reduxjs)[\\/]/,
          name: "vendor-react-redux",
          chunks: "all",
        },
        "vendor-stellar": {
          test: /[\\/]node_modules[\\/](@stellar|stellar)[\\/]/,
          name: "vendor-stellar",
          chunks: "all",
        },
        "vendor-wallets": {
          test: /[\\/]node_modules[\\/](@albedo|@ledgerhq|trezor)[\\/]/,
          name: "vendor-wallets",
          chunks: "all",
        },
      },
    },
  },
  output: {
    filename: "static/[name].[contenthash].js",
    path: path.resolve(__dirname, "build"),
    // This is needed to set correct path when refreshing on sub-pages (where
    // path is not root)
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            // Disable type checker, we will use it in ForkTsCheckerWebpackPlugin
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.(scss|css)$/,
        use: [
          process.env.NODE_ENV !== "production" ? "style-loader" : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.svg$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: "removeViewBox",
                    active: false,
                  },
                ],
              },
            },
          },
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "assets/",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      "react/jsx-dev-runtime.js": "react/jsx-dev-runtime",
      "react/jsx-runtime.js": "react/jsx-runtime",
    },
    extensions: [".tsx", ".ts", ".js"],
    plugins: [
      // This handles aliases and resolves Design System CSS font paths properly
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, "./tsconfig.json"),
      }),
    ],
    // Adding node.js modules
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify"),
      url: require.resolve("url"),
      buffer: require.resolve("buffer/"),
      path: require.resolve("path-browserify"),
    },
  },
  plugins: [
    new ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    }),
    new DefinePlugin({
      "process.env": {
        REACT_APP_DISABLE_WINDOW_ENV: JSON.stringify(
          process.env.REACT_APP_DISABLE_WINDOW_ENV || "",
        ),
        REACT_APP_DISABLE_TENANT_PREFIL_FROM_DOMAIN: JSON.stringify(
          process.env.REACT_APP_DISABLE_TENANT_PREFIL_FROM_DOMAIN || "",
        ),
        REACT_APP_API_URL: JSON.stringify(process.env.REACT_APP_API_URL || ""),
        REACT_APP_STELLAR_EXPERT_URL: JSON.stringify(
          process.env.REACT_APP_STELLAR_EXPERT_URL || "",
        ),
        REACT_APP_HORIZON_URL: JSON.stringify(process.env.REACT_APP_HORIZON_URL || ""),
        REACT_APP_RECAPTCHA_SITE_KEY: JSON.stringify(
          process.env.REACT_APP_RECAPTCHA_SITE_KEY || "",
        ),
        REACT_APP_SINGLE_TENANT_MODE:
          process.env.REACT_APP_SINGLE_TENANT_MODE?.toLowerCase() === "true",
        REACT_APP_USE_SSO: process.env.REACT_APP_USE_SSO?.toLowerCase() === "true",
        REACT_APP_OIDC_AUTHORITY: JSON.stringify(process.env.REACT_APP_OIDC_AUTHORITY || ""),
        REACT_APP_OIDC_CLIENT_ID: JSON.stringify(process.env.REACT_APP_OIDC_CLIENT_ID || ""),
        REACT_APP_OIDC_REDIRECT_URI: JSON.stringify(process.env.REACT_APP_OIDC_REDIRECT_URI || ""),
        REACT_APP_OIDC_SCOPE: JSON.stringify(process.env.REACT_APP_OIDC_SCOPE || ""),
        REACT_APP_OIDC_USERNAME_MAPPING: JSON.stringify(
          process.env.REACT_APP_OIDC_USERNAME_MAPPING || "",
        ),
      },
    }),
    new CopyPlugin({
      patterns: [{ from: "./public", to: "./" }],
    }),
    new MiniCssExtractPlugin({
      filename: "static/[name].[contenthash].css",
      chunkFilename: "[id].css",
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new ForkTsCheckerWebpackPlugin(),
    new ESLintPlugin({
      extensions: [".tsx", ".ts", ".js"],
      exclude: "node_modules",
      configType: "flat",
    }),
  ],
};
