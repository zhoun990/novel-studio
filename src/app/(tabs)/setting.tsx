import { clearEstate, setEstates, useEstate } from "@/utils/estate";
import { supabase } from "@/utils/supabase";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { ReactNode } from "react";
import { Button, Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function App() {
	const { session } = useEstate("main");

	return (
		<View style={{ flex: 1, position: "relative" }}>
			

			<View style={{ paddingTop: 4, paddingBottom: 4, alignSelf: "stretch" }}>
				<Button
					title={session?.user ? "サインアウト" : "サインイン"}
					onPress={async () => {
						if (session?.user) {
							await supabase.auth.signOut();

							clearEstate("main");
							setEstates.persist({
								archive: {},
								novels: (cv) => {
									return Object.keys(cv).reduce((acc, key) => {
										if (cv[key]?.user_id === null) {
											acc[key] = cv[key];
										}
										return acc;
									}, {} as typeof cv);
								},
								episodes: (cv, { novels }) => {
									return Object.keys(cv).reduce((acc, novel_id) => {
										if (novels[novel_id]?.user_id === null) {
											if (!acc[novel_id]) acc[novel_id] = {};
											Object.keys(cv[novel_id]).forEach((episode_id) => {
												acc[novel_id][episode_id] = cv[novel_id][episode_id];
											});
										}
										return acc;
									}, {} as typeof cv);
								},
							});
						} else {
							router.push("/auth");
						}
					}}
				/>
			</View>
		</View>
	);
}
const BlurHeader = ({
	left,
	mid,
	right,
	tint = "dark",
}: {
	left?: ReactNode;
	mid?: ReactNode;
	right?: ReactNode;
	tint?: BlurView["props"]["tint"];
}) => {
	const { top } = useSafeAreaInsets();

	return (
		<BlurView
			intensity={50}
			tint="dark"
			style={{
				position: "absolute",
				paddingTop: top,
				width: "100%",
				top: 0,
				left: 0,
				zIndex: 100,
			}}
		>
			<View
				style={{
					height: 45,
					width: "100%",
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<View style={{ flexGrow: 1 }}>{left}</View>
				<View>{mid}</View>
				<View style={{ flexGrow: 1, justifyContent: "flex-end" }}>{right}</View>
			</View>
		</BlurView>
	);
};
