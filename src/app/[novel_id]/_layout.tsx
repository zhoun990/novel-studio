import { Slot, Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";

export default function HomeLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: "black" },
				// gestureEnabled: false
			}}
		>
			<Stack.Screen
				name="[episode_id]"
				options={{
					// Set the presentation mode to modal for our modal route.
					// presentation: "fullScreenModal",
					gestureDirection: "vertical",
					gestureEnabled: false,
				}}
			/>
		</Stack>
	);
}
