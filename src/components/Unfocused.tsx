import { View, TextInput, TextBase, Pressable } from "react-native";
import { useEstate } from "@/utils/estate";
import { Paragraph } from "@/utils/types";
import { usePgh } from "@/hooks/usePgh";
import { memo, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import Text from "@/components/CustomText";

export const Unfocused = memo(
	({
		text: _text,
		i,
		apExists,
		bpExists,
		isFocused,
		hidden,
		height,
	}: {
		text: string;
		i: number;
		hidden: boolean;
		height: number;
		apExists: boolean;
		bpExists: boolean;
		isFocused: boolean;
	}) => {
		const c = useRef(Math.floor(Math.random() * 100));
		c.current++;
		// useFocusEffect(() => {
		// 	c = 0;
		// });
		const { focus, setEstate } = useEstate("main");
		const pgh = usePgh();
		const [isFirst, setIsFirst] = useState(true);
		const [text, setText] = useState(_text);
		const [lines, setLines] = useState<string[]>([]);
		const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });
		const ref = useRef<TextInput>(null);
		useEffect(() => {
			setText(_text);
			if (isFocused) {
				setLines(_text.split(text));
			}
		}, [_text]);
		useEffect(() => {
			if (focus && focus?.line === i) {
				// setCursorPosition({ start: Math.max(focus.cursor), end: focus.cursor });
				setEstate({ focus: null });
				// ref.current?.focus();
			}
		}, [focus]);
		useEffect(() => {
			if (lines.length) {
				console.log(
					"^_^ Log \n file: Unfocused.tsx:59 \n lines:",
					lines,
					cursorPosition.start
				);
			} else if (
				apExists &&
				cursorPosition.start < (text.split("\n")[0]?.length || 0) + 1
			) {
				setEstate({ focus: { line: i - 1, cursor: 0 } });
			}
		}, [cursorPosition]);

		if (!isFocused && apExists) {
			height -= 30;
		}
		if (!isFocused && bpExists) {
			height -= 30;
		}
		if (height < 0) height = 0;

		return (
			<View
				style={{
					flexDirection: "row",
					borderWidth: 1,
					display: hidden ? "none" : "flex",
					// position: "absolute",
					// top: y,
					// height: height,
					// overflow: "hidden",
				}}
			>
				{/* <Text>
					c:{c.current},height:{height}
				</Text> */}
				<Pressable
				// onPress={() => {
				// 	if (isFocused) setEstate({ focus: { line: i - 1, cursor: 0 } });
				// }}
				>
					<Text style={{ fontSize: 20, width: 30 }}>
						{isFocused ? `${i - 1}\n${i}\n${i + 1}` : i}
					</Text>
				</Pressable>
				<TextInput
					ref={ref}
					style={{
						backgroundColor: isFirst ? (isFocused ? "yellow" : "green") : "red",
						fontSize: 30,
						flexGrow: 1,
					}}
					scrollEnabled={false}
					onFocus={() => {
						setEstate({ focusedLine: i });
					}}
					onBlur={() => {
						setIsFirst(true);
					}}
					onChangeText={(value) => {
						if (value === text || !isFocused) {
							return;
						}
						if (isFocused) {
							if (apExists) value = value.split("\n").slice(1).join("\n");
							if (bpExists) value = value.split("\n").slice(0, -1).join("\n");
							const lines = value.split(/\n/g);
							const firstLine = lines[0];
							const remainingLines = lines[1];
							if (lines.length > 1) {
								pgh.update(i, remainingLines);
								pgh.insert(i, firstLine);
								setEstate({ focusedLine: i + 1 });
							} else {
								pgh.update(i, firstLine);
							}
						}
					}}
					value={text}
					onSelectionChange={(event) => {
						setCursorPosition({
							start: event.nativeEvent.selection.start,
							end: event.nativeEvent.selection.end,
						});
						// setEstate({ cursorPosition: event.nativeEvent.selection });
						// if (i === 2)
						console.log(
							"^_^ Log \n 2-2",
							i,
							cursorPosition.start,
							event.nativeEvent.selection.start
						);

						// if (isFocused && isFirst) {
						// 	const firstLineLength = (text.split("\n")[0]?.length || 0) + 1;
						// 	const lastLineLength = (text.split("\n")[2]?.length || 0) + 1;
						// 	console.log(
						// 		"^_^ Log \n file: Focused.tsx:103 \n :",
						// 		i,
						// 		event.nativeEvent.selection.start,
						// 		text.length,
						// 		lastLineLength
						// 		// text.split("\n")[0].length + 1
						// 	);
						// 	const isDisabled =
						// 		event.nativeEvent.selection.start === text.length;
						// 	// setCursorPosition({
						// 	// 	start: isDisabled
						// 	// 		? firstLineLength
						// 	// 		: event.nativeEvent.selection.start + firstLineLength,
						// 	// 	end: isDisabled
						// 	// 		? firstLineLength
						// 	// 		: event.nativeEvent.selection.end + firstLineLength,
						// 	// });

						// 	setCursorPosition({
						// 		start:  event.nativeEvent.selection.start + firstLineLength,
						// 		end:  event.nativeEvent.selection.end + firstLineLength,
						// 	});

						// 	setIsFirst(false);
						// }
					}}
					selection={isFocused ? cursorPosition : undefined}
					multiline
				/>
			</View>
		);
	}
);
