import HtmlWebpackPlugin from "html-webpack-plugin";
import dotenv from "dotenv";
import path from "path";
import webpack from "webpack";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: "./src/swatchbook/index.js",
  output: {
    path: path.resolve(__dirname, "dist/swatchbook"),
    filename: "bundle.js",
    publicPath: "/creative/swatchbook/",
    clean: true,
  },
  module: {
    rules: [
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
        generator: {
          filename: "fonts/[name][ext]",
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src/swatchbook"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.STRAPI_API_TOKEN": JSON.stringify(
        process.env.STRAPI_API_TOKEN,
      ),
      "process.env.STRAPI_API_URL": JSON.stringify(process.env.STRAPI_API_URL),
    }),
    new HtmlWebpackPlugin({
      template: "./public/shared/index.html",
      filename: "index.html",
      templateParameters: {
        title: "🖤 swatchbook - 𝔰𝔥𝔞𝔡𝔬𝔴𝔣𝔬𝔯𝔪 . 𝔫𝔢𝔱 🩷",
        description: "welcome to shadowform~",
      },
    }),
  ],
};
