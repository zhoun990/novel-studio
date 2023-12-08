import React from "react";
import { Text as NativeText, TextProps } from "react-native";

const Text: React.FC<TextProps> = (props) => {
	const { style, ...others } = props;
	return (
		<NativeText
			style={[{ color: "#F0F0F0", fontFamily: "NotoSansJP_500Medium" }, style]}
			{...others}
		>
			{props.children}
		</NativeText>
	);
};

export default Text;
