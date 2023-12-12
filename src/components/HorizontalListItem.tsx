import {
	GestureResponderEvent,
	Pressable,
	PressableProps,
	StyleProp,
	ViewStyle,
} from "react-native";
import { RenderItemParams } from "react-native-draggable-flatlist";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming,
} from "react-native-reanimated";

export const HorizontalListItem = <T,>(
	props: PressableProps & {
		item: T;
		getIndex?: () => number | undefined;
		drag?: () => void;
		isActive?: boolean;
		isSelected?: boolean;
		style?: StyleProp<ViewStyle>;
		onSelected?: ((item: T) => void) | null | undefined;
		onPressSelected?:
			| ((event: GestureResponderEvent) => void)
			| null
			| undefined;
	}
) => {
	const {
		item,
		drag,
		isActive,
		isSelected,
		style,
		onPress,
		onPressSelected,
		onSelected,
		children,
		...others
	} = props;

	const animatedStyles = useAnimatedStyle(() => {
		return {
			transform: [{ scale: withTiming(isActive ? 1.2 : 1, { duration: 300 }) }],
			borderWidth: withTiming(isSelected ? 2 : 1, { duration: 100 }),
			padding: withTiming(!isSelected ? 2 : 1),
		};
	});
	const sv = useSharedValue(1);

	return (
		<Pressable
			onPress={(e) => {
				console.log(":::");
				sv.value = withSequence(
					withTiming(1.1, { duration: 100 }),
					withTiming(1, { duration: 100 })
				);
				if (isSelected) {
					onPressSelected?.(e);
				} else {
					onSelected?.(item);
					onPress?.(e);
				}
			}}
			onLongPress={() => {
				drag?.();
				onSelected?.(item);
			}}
			{...others}
		>
			{(state) => (
				<Animated.View
					style={[
						{ transform: [{ scale: sv }], borderColor: "white" },
						animatedStyles,
						{
							backgroundColor: "#000030",
						},
						style,
					]}
				>
					{typeof children === "function" ? children(state) : children}
				</Animated.View>
			)}
		</Pressable>
	);
};
