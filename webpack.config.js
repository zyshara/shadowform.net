import HtmlWebpackPlugin from "html-webpack-plugin";
import dotenv from "dotenv";
import path from "path";
import webpack from "webpack";
import { fileURLToPath } from "url";
import { appsConfig } from "./server/lib/appsConfig.js";

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

const makeConfig = ({
  entry, outputPath, publicPath, title, alias, umamiId = null,
  description = "welcome to shadowform~",
  ogImage = null,
  canonicalUrl = null,
  jsonLd = null,
  siteName = null,
  preloadFonts = [],
  robots = "index, follow",
  faviconHref = "/shared/favicon.png",
}) => ({
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
        description,
        ogImage,
        canonicalUrl,
        jsonLd,
        siteName,
        isProd,
        umamiId,
        preloadFonts,
        robots,
        faviconHref,
      },
    }),
  ],
});

// Converts one app's config/apps.json entry into makeConfig's params.
const configFor = (app) => ({
  entry: `./${app.srcDir}/index.js`,
  outputPath: app.distDir,
  publicPath: "/",
  title: app.metadata.title,
  siteName: app.metadata.title,
  description: app.metadata.description,
  ogImage: app.metadata.image ?? null,
  canonicalUrl: app.metadata.url ?? null,
  jsonLd: app.metadata.jsonLd ?? null,
  robots: app.metadata.robots ?? "index, follow",
  umamiId: app.umamiId ?? null,
  faviconHref: app.faviconHref,
  preloadFonts: app.preloadFonts ?? [],
  alias: {
    "@": path.resolve(__dirname, app.srcDir),
    "@shared": path.resolve(__dirname, "src/shared"),
  },
});

// Apps migrated to the React Router v8 (Vite SSR) pipeline build and serve
// themselves — see their own src/<app>/vite.config.js — and are excluded here.
export default Object.values(appsConfig)
  .filter((app) => !app.ssrFramework)
  .map((app) => makeConfig(configFor(app)));
