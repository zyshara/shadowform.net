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

const makeConfig = ({ entry, outputPath, publicPath, title, alias, umamiId = null }) => ({
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
        umamiId,
      },
    }),
  ],
});

export default [
  makeConfig({
    entry: "./src/redspear/index.js",
    outputPath: "dist/redspear",
    publicPath: "/",
    title: "redspear",
    umamiId: "0bf57e1c-2c3f-4f39-80f6-31a7cf393705",
    alias: {
      "@": path.resolve(__dirname, "src/redspear"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  }),
  makeConfig({
    entry: "./src/low-poly/index.js",
    outputPath: "dist/low-poly",
    publicPath: "/",
    title: "Low Poly",
    umamiId: "47f76d43-46c9-46aa-9343-d5599838342e",
    alias: {
      "@": path.resolve(__dirname, "src/low-poly"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  }),
  makeConfig({
    entry: "./src/main/index.js",
    outputPath: "dist/main",
    publicPath: "/",
    title: "🖤 𝔰𝔥𝔞𝔡𝔬𝔴𝔣𝔬𝔯𝔪 . 𝔫𝔢𝔱 🩷",
    umamiId: "cdea5119-53fc-4bbe-9c3a-4dc923b3489e",
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
];
