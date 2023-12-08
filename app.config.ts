import { ExpoConfig, ConfigContext } from "expo/config";
export default function config({ config }: ConfigContext): ExpoConfig {
	const isProd = process.env.APP_ENV === "production";
	if (config.ios?.bundleIdentifier) {
		config.ios.bundleIdentifier = isProd
			? "net.webbel.nvs"
			: "net.webbel.nvs-dev";
	}
	return { name:  isProd ? "Novel Studio" : "[dev]Novel Studio", slug: "novel-studio", ...config };
}
