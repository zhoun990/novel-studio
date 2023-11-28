import { View, TextInput } from "react-native";
import { useEstate } from "@/utils/estate";
import { Paragraph } from "@/utils/types";
import { usePgh } from "@/hooks/usePgh";
import { useEffect, useState } from "react";
import Text from "@/components/CustomText";

export const Focused = ({
	paragraph,
	i,
}: {
	paragraph: Paragraph;
	i: number;
}) => {
	const { focusedLine, paragraphs, cursorPosition, setEstate } =
		useEstate("main");
	const [isFirst, setIsFirst] = useState(false);
	const pgh = usePgh();
	let ap = paragraphs[i - 1]?.text || "";
	const apExists = i > 0;
	if (apExists) ap += "\n";
	const bp = paragraphs[i + 1]?.text || "";
	const bpExists = paragraphs.length - 1 >= i + 1;

	const text = ap + paragraph.text + (bpExists ? "\n" + bp : "");

	// useEffect(() => {
	// 	if (apExists) {
	// 		if (cursorPosition.start <= text.split("\n")[0].length) {
	// 			setEstate({ focusedLine: (cv) => cv - 1 });
	// 		}
	// 		// const cursorLine =
	// 		// 	text.substring(0, cursorPosition.start).split("\n").length - 1;
	// 		// if (cursorLine !== 1) {
	// 		// 	setEstate({ focusedLine: (cv) => cv - (cursorLine - 1) });
	// 		// }
	// 	}
	// }, [cursorPosition]);
	return (
		<View
			style={{
				flexDirection: "row",
				borderWidth: 1,
			}}
		>
			<Text style={{ fontSize: 20, width: 30 }}>{`${i - 1}\n${i}\n${
				i + 1
			}`}</Text>
			<TextInput
				id={paragraph.key + "input"}
				key={paragraph.key + "input"}
				style={{
					backgroundColor: "green",
					fontSize: 20,
					padding: 5,
					flexGrow: 1,
				}}
				onFocus={() => {
					setEstate({ focusedLine: i });
					// console.log(
					// 	"^_^ Log \n 1-1",
					// 	i,
					// 	cursorPosition.start,
					// 	focusedLine,
					// 	isFirst
					// );
				}}
				// onBlur={() => {
				// 	setIsFocused(false);
				// }}
				onChangeText={(text) => {
					if (apExists) text = text.split("\n").slice(1).join("\n");
					if (bpExists) text = text.split("\n").slice(0, -1).join("\n");
					if (text === paragraph.text) return;
					const lines = text.split(/\n/g);
					const firstLine = lines[0];
					const remainingLines = lines[1];
					if (lines.length > 1) {
						pgh.update(i, remainingLines);
						pgh.insert(i, firstLine);
						console.log("^_^ Log \n file: index.tsx:193 \n insert:");
						setEstate({ focusedLine: i + 1 });
					} else {
						pgh.update(i, firstLine);
						console.log("^_^ Log \n file: index.tsx:187 \n update:");
					}
				}}
				value={text}
				onSelectionChange={(event) => {
					if (apExists) {
						const cursor = event.nativeEvent.selection.start;
						// console.log("^_^ Log \n 1-2", i, cursor, focusedLine, isFocused);

						// 	const newlineIndex = text.indexOf("\n");
						// 	console.log("^_^ Log \n file: index.tsx:229 \n newlineIndex:", newlineIndex);
						// 	// if (newlineIndex !== -1) {
						// 	// 	setEstate({
						// 	// 		cursorPosition: (cv) => ({
						// 	// 			start: cv.start + newlineIndex + 1,
						// 	// 			end: cv.end + newlineIndex + 1,
						// 	// 		}),
						// 	// 	});
						// 	// }
						// 	const cursorLine =
						// 		text.substring(0, event.nativeEvent.selection.start).split("\n")
						// 			.length - 1;
						// 	if (cursorLine !== 1) {
						// 		// setEstate({ focusedLine: (cv) => cv - (cursorLine - 1) });
						// 	}
					}
					// if (!isFocused) {
					// console.log(
					// 	"^_^ Log \n file: Focused.tsx:103 \n :",
					// 	event.nativeEvent.selection.start,
					// 	// text.split("\n")[0].length + 1
					// );
					// }
					setEstate({
						cursorPosition: event.nativeEvent.selection, //isFirst
						// ? event.nativeEvent.selection
						// : {
						// 		start: text.split("\n")[0].length + 1,
						// 		end: text.split("\n")[0].length + 1,
						//   },
					});
					setIsFirst(true);
				}}
				selection={cursorPosition}
				multiline
				// autoFocus
			/>
		</View>
	);
};
