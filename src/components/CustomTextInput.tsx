import React from "react";
import { TextInput as NativeTextInput, TextInputProps } from "react-native";

const TextInput: React.FC<TextInputProps> = (props) => {
	const { style, ...others } = props;
	return (
		<NativeTextInput
			style={[{ color: "#F0F0F0", fontFamily: "NotoSansJP_500Medium" }, style]}
			{...others}
		>
			{props.children}
		</NativeTextInput>
	);
};

export default TextInput;
