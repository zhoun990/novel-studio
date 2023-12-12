import { getLocales } from "expo-localization";

export const n = <T>(
	texts: { default: T; en?: T ,jp?: T } & { [key: string]: T }
) => {
	const ln = getLocales()[0].languageCode;
	if (texts[ln]) return texts[ln];
	return texts.default;
};
