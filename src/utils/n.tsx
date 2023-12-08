import { getLocales } from "expo-localization";

export const n = (
	texts: { default: string; en?: string ,jp?: string } & { [key: string]: string }
) => {
	const ln = getLocales()[0].languageCode;
	if (texts[ln]) return texts[ln];
	return texts.default;
};
