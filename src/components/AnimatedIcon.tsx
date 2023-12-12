import { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
export const AnimatedIcon: React.FC<PressableProps> = (props) => {
	const { onPressIn, onPressOut, ...others } = props;
	const sv = useSharedValue(1);

	return (
		<Animated.View style={{ transform: [{ scale: sv }] }}>
			<Pressable
				onPressIn={(e) => {
					sv.value = withTiming(1.3);
					onPressIn?.(e);
				}}
				onPressOut={(e) => {
					sv.value = withTiming(1);
					onPressOut?.(e);
				}}
				{...others}
			/>
		</Animated.View>
	);
};
