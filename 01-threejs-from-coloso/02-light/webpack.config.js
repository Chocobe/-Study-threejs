const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
	mode: "development",
	entry: "./src/index.js",
	devtool: "inline-source-map",
	//   static folder
	devServer: {
		static: {
			directory: path.join(__dirname, "public"),
		},
		watchFiles: ["src/**/*"],
		compress: true,
		port: 3000,
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: "src/index.html",
		}),
	],
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	resolve: {
		modules: ["node_modules"],
		extensions: [".js", ".json"],
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
			// less loader
			{
				test: /\.less$/i,
				use: ["style-loader", "css-loader", "less-loader"],
			},
		],
	},
};
