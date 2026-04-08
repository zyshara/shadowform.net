import HtmlWebpackPlugin from "html-webpack-plugin";
import dotenv from "dotenv";
import path from "path";
import webpack from "webpack";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sharedRules = [
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
      loader: "babel-loader",
      options: {
        presets: [
          "@babel/preset-env",
          ["@babel/preset-react", { runtime: "automatic" }],
        ],
      },
    },
  },
  {
    test: /\.css$/,
    use: ["style-loader", "css-loader", "postcss-loader"],
  },
  {
    test: /\.(woff2?|eot|ttf|otf)$/i,
    type: "asset/resource",
    generator: { filename: "fonts/[name][ext]" },
  },
  {
    test: /\.(png|jpe?g|gif|svg)$/i,
    type: "asset/resource",
  },
];

const sharedPlugins = [
  new webpack.DefinePlugin({
    "process.env.STRAPI_API_TOKEN": JSON.stringify(process.env.STRAPI_API_TOKEN),
    "process.env.STRAPI_API_URL": JSON.stringify(process.env.STRAPI_API_URL),
  }),
];

const isProd = process.env.NODE_ENV === "production";

const makeConfig = ({ entry, outputPath, publicPath, title, alias }) => ({
  entry,
  output: {
    path: path.resolve(__dirname, outputPath),
    filename: "bundle.js",
    publicPath,
    clean: true,
  },
  module: { rules: sharedRules },
  resolve: {
    extensions: [".js", ".jsx"],
    alias,
  },
  plugins: [
    ...sharedPlugins,
    new HtmlWebpackPlugin({
      template: "./public/shared/index.html",
      filename: "index.html",
      templateParameters: {
        title,
        description: "welcome to shadowform~",
        isProd,
      },
    }),
  ],
});

export default [
  makeConfig({
    entry: "./src/lowpoly/index.js",
    outputPath: "dist/lowpoly",
    publicPath: "/",
    title: "lowpoly",
    alias: {
      "@": path.resolve(__dirname, "src/lowpoly"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  }),
  makeConfig({
    entry: "./src/main/index.js",
    outputPath: "dist/main",
    publicPath: "/",
    title: "🖤 𝔰𝔥𝔞𝔡𝔬𝔴𝔣𝔬𝔯𝔪 . 𝔫𝔢𝔱 🩷",
    alias: {
      "@": path.resolve(__dirname, "src/main"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  }),
  makeConfig({
    entry: "./src/swatchbook/index.js",
    outputPath: "dist/swatchbook",
    publicPath: "/creative/swatchbook/",
    title: "🖤 swatchbook - 𝔰𝔥𝔞𝔡𝔬𝔴𝔣𝔬𝔯𝔪 . 𝔫𝔢𝔱 🩷",
    alias: {
      "@": path.resolve(__dirname, "src/swatchbook"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  }),
  makeConfig({
    entry: "./src/management/index.js",
    outputPath: "dist/management",
    publicPath: "/management/",
    title: "🖤 management - 𝔰𝔥𝔞𝔡𝔬𝔴𝔣𝔬𝔯𝔪 . 𝔫𝔢𝔱 🩷",
    alias: {
      "@": path.resolve(__dirname, "src/management"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  }),
];
