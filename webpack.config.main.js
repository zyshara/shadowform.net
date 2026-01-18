import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: "./src/main/index.js",
  output: {
    path: path.resolve(__dirname, "dist/main"),
    filename: "bundle.js",
    publicPath: "/",
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
            presets: ["@babel/preset-env", "@babel/preset-react"],
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
      "@": path.resolve(__dirname, "src/main"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/shared/index.html",
      filename: "index.html",
      templateParameters: {
        title: "🖤 𝔰𝔥𝔞𝔡𝔬𝔴𝔣𝔬𝔯𝔪 . 𝔫𝔢𝔱 🩷",
        description: "welcome to shadowform~",
      },
    }),
  ],
};
