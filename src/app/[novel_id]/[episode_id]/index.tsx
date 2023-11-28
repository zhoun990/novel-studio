import Text from "@/components/CustomText";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
	Alert,
	Dimensions,
	KeyboardAvoidingView,
	Pressable,
	SafeAreaView,
	View,
} from "react-native";
import { Button } from "react-native-elements";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { Unfocused } from "@/components/Unfocused";
import { usePgh } from "@/hooks/usePgh";
import { useEstate } from "@/utils/estate";
import { supabase } from "@/utils/supabase";
const iPhoneWidth = Dimensions.get("window").width;
const iPhoneHeight = Dimensions.get("window").height;

export default function Page() {
	const nv = useNavigation("/(drawer)");
	useEffect(() => {
		nv.getParent()?.setOptions({ gestureEnabled: false });
		return () => {
			nv.getParent()?.setOptions({ gestureEnabled: true });
		};
	}, []);
	const { session, paragraphs, cursorPosition, focusedLine } =
		useEstate("main");
	const { novels, episodes, setEstate } = useEstate("persist");
	const [loading, setLoading] = useState(false);
	const [mode, setMode] = useState(0);
	const { novel_id, episode_id } = useLocalSearchParams();
	const episode = episodes[String(novel_id)]?.[String(episode_id)];
	const savedText = useRef(episode?.text);
	const notSavedText = useRef(episode?.text);

	const pgh = usePgh();

	useEffect(() => {
		if (typeof episode?.text === "string") {
			notSavedText.current = episode?.text;
		}
	}, [episode?.text]);
	const save = async () => {
		if (!episode || savedText.current === notSavedText.current) {
			return;
		}
		try {
			setLoading(true);

			if (session?.user?.id === novels[String(novel_id)].user_id) {
				const { error } = await supabase
					.from("episodes")
					.update({
						text: notSavedText.current,
						character_count: notSavedText.current.replace(/\s/g, "").length,
					})
					.eq("id", episode.id);
				if (error) {
					throw error;
				}
			}
			savedText.current = notSavedText.current;
		} catch (error) {
			console.error("^_^ Log \n file: Account.tsx:69 \n error:", error);
			if (error instanceof Error) {
				Alert.alert(error.message);
			}
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		if (typeof episode?.text === "string") {
			let timeoutId: NodeJS.Timeout = setTimeout(save, 10000);

			return () => {
				clearTimeout(timeoutId);
			};
		}
	}, [episode?.text]);
	useEffect(() => {
		// console.log("^_^ Log \n file: index.tsx:77 \n paragraphs:", paragraphs);
		if (paragraphs?.length === 0) {
			pgh.insert();
		}
	}, [paragraphs]);
	if (!episode)
		return (
			<SafeAreaView style={{ flex: 1 }}>
				<View style={{ flexDirection: "row" }}>
					<Button
						title="閉じる"
						onPress={() => {
							save().then(() => router.back());
						}}
					/>
				</View>
				<Text>読み込み中</Text>
			</SafeAreaView>
		);
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={{ flexDirection: "row" }}>
				<Button
					title="閉じる"
					onPress={() => {
						save().then(() => router.back());
					}}
				/>
				<Button
					title="ChangeMode"
					onPress={() => {
						setMode(mode === 0 ? 1 : 0);
					}}
				/>
			</View>
			<Text>
				{`カーソルの位置: ${cursorPosition.start}, ${cursorPosition.end}, Focused line:${focusedLine}`}
			</Text>
			{episode?.text !== savedText.current ? (
				<Text>未保存</Text>
			) : loading ? (
				<Text>セーブ中...</Text>
			) : (
				<Text>変更なし</Text>
			)}
			{/* <View
				style={{
					// marginTop: h,
					backgroundColor: "black",
					height: iPhoneHeight * 0.6,
					borderWidth: 1,
				}}
			/> */}
			{mode === 0 && <TextEditor />}
			{mode === 1 && (
				<ScrollView
					style={{
						backgroundColor: "blue",
						minHeight: "100%",
					}}
				>
					{paragraphs?.map(
						(paragraph, i) => {
							const isFocused = i === focusedLine;
							const apExists = i > 0;
							const bpExists = paragraphs.length - 1 >= i + 1;
							// if (!isFocused && Math.abs(i - focusedLine) <= 1)
							// 	return <View key={paragraph.key} />;
							return (
								<Unfocused
									i={i}
									key={paragraph.key}
									apExists={apExists}
									bpExists={bpExists}
									text={
										i === focusedLine
											? (apExists ? paragraphs[i - 1].text + "\n" : "") +
											  paragraph.text +
											  (bpExists ? "\n" + paragraphs[i + 1]?.text : "")
											: paragraph.text
									}
									isFocused={isFocused}
									height={paragraph.height}
									hidden={!isFocused && Math.abs(i - focusedLine) <= 1}
								/>
							);
						}
						// )
					)}
					<View
						style={{
							// marginTop: h,
							backgroundColor: "black",
							height: iPhoneHeight * 0.9,
							borderWidth: 1,
						}}
					/>
				</ScrollView>
			)}
		</SafeAreaView>
	);
}
const TextEditor = () => {
	const ref = useRef<TextInput>(null);
	const { episodes, setEstate } = useEstate("persist");
	const { novel_id, episode_id } = useLocalSearchParams();
	const episode = episodes[String(novel_id)]?.[String(episode_id)];
	const [text, setText] = useState(episode?.text) || "";
	const [undo, setUndo] = useState<string[]>([]);
	const [redo, setRedo] = useState<string[]>([]);

	useEffect(() => {
		if (text) {
			console.log("^_^ Log \n file: index.tsx:198 \n text:", text);
			setEstate({
				episodes: (cv) => {
					cv[String(novel_id)][String(episode_id)].text = text;
					cv[String(novel_id)][String(episode_id)].character_count =
						text.replace(/\s/g, "").length;
					return cv;
				},
			});
		}
	}, [text]);
	const history = {
		undo: () => {
			// console.log("undo", undo);
			if (undo.length) {
				setRedo((cv) => cv.concat(text));
				setText(undo[undo.length - 1]);
				console.log(
					"^_^ Log \n file: index.tsx:142 \n undo[undo.length - 1]:",
					undo[undo.length - 1]
				);
				setUndo((cv) => {
					if (cv.length > 0) {
						return cv.slice(0, -1);
					}
					return cv;
				});
			}
		},
		redo: () => {
			if (redo.length) {
				setUndo((cv) => cv.concat(text));
				setText(redo[redo.length - 1]);
				setRedo((cv) => {
					if (cv.length > 0) {
						return cv.slice(0, -1);
					}
					return cv;
				});
			}
		},
	};
	const navigation = useNavigation();
	return (
		<KeyboardAvoidingView
			behavior="height"
			style={{
				flex: 1,
				position: "relative",
				borderWidth: 1,
				borderColor: "red",
			}}
			// keyboardVerticalOffset={
			// Platform.OS === "android"
			// 	? Header.HEIGHT + StatusBar.currentHeight
			// 	:
			// Header.HEIGHT
			// }
		>
			{/* <ScrollView
				style={{
					flexGrow: 1,
					minHeight: "100%",
					borderWidth: 1,
				}}
			> */}
			<TextInput
				ref={ref}
				onChangeText={(value) => {
					if (undo[undo.length - 1] !== text && text !== value) {
						setUndo((cv) => cv.concat(text));
					}
					setText(value);
				}}
				value={text}
				style={{
					fontSize: 30,
					backgroundColor: "green",
					flexGrow: 1,
				}}
				multiline
			/>
			<View style={{ flexDirection: "row" }}>
				<Pressable
					style={{
						padding: 5,
						margin: 4,
						borderWidth: 1,
						borderRadius: 5,
						backgroundColor: "blue",
					}}
					onPress={history.undo}
				>
					<Text style={{ fontSize: 20 }} selectable={false}>
						Undo
					</Text>
				</Pressable>
				<Pressable
					style={{
						padding: 5,
						margin: 4,
						borderWidth: 1,
						borderRadius: 5,
						backgroundColor: "blue",
					}}
					onPress={history.redo}
				>
					<Text style={{ fontSize: 20 }} selectable={false}>
						Redo
					</Text>
				</Pressable>
			</View>
			{/* <Pressable
					style={{ backgroundColor: "yellow", flexGrow: 1 }}
					onPress={() => {
						ref.current?.focus();
					}}
				></Pressable> */}
			{/* <View
					style={{
						// marginTop: h,
						backgroundColor: "black",
						height: iPhoneHeight * 0.9,
						borderWidth: 1,
					}}
				/> */}
			{/* </ScrollView> */}
		</KeyboardAvoidingView>
	);
};
