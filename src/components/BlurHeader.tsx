import { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Header, HeaderOptions } from "@react-navigation/elements";
import { useHeaderHeight } from "@react-navigation/elements";
import Constants from "expo-constants";
export const BlurHeader = (props: HeaderOptions) => {
	const { headerBackground, ...others } = props;
	const { top } = useSafeAreaInsets();
	const headerHeight = useHeaderHeight();

	// <BlurView
	// 		intensity={50}
	// 		tint="dark"
	// 		style={{
	// 			position: "absolute",
	// 			paddingTop: top,
	// 			width: "100%",
	// 			top: 0,
	// 			left: 0,
	// 			zIndex: 100,
	// 		}}
	// 	>
	// 		<View
	// 			style={{
	// 				height: 45,
	// 				width: "100%",
	// 				flexDirection: "row",
	// 				alignItems: "center",
	// 			}}
	// 		>
	// 			<View style={{ flexGrow: 1, flexDirection: "row", width: "20%" }}>
	// 				{left}
	// 			</View>
	// 			<View>{mid}</View>
	// 			<View style={{ flexGrow: 1, justifyContent: "flex-end", width: "20%" }}>
	// 				{right}
	// 			</View>
	// 		</View>
	// 	</BlurView>

	return (
		<>
			<BlurView
				tint='dark'
				style={{
					position: "absolute",
					top: 0,
					width: "100%",
					zIndex: 10,
					height: headerHeight,
				}}
			/>
			<View  style={{ position: "absolute", top, width: "100%", zIndex: 100 }}>
				<Header
					title={"Title"}
					{...others}
					headerBackground={() => (
						<BlurView
							tint="dark"
							intensity={0}
							style={StyleSheet.absoluteFill}
						/>
					)}
				/>
			</View>
		</>
	);
};
