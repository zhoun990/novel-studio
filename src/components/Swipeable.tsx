import { View, ViewStyle, StyleProp, Dimensions } from "react-native";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { SwipeableItem } from "@/components/SwipeableItem";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
const WindowHeight = Dimensions.get("window").height;
export const SwipeableList = <T,>({
	itemStyle,
	onPress,
	onDelete,
	onPositionChange,
	items: _items = [],
	getKey,
	child,
	updateItems,
	height,
}: {
	itemStyle: StyleProp<ViewStyle>;
	onPress?: (item: T) => void;
	onDelete?: (item: T) => void;
	onPositionChange?: (items: T[]) => void;
	items: T[];
	getKey: (item: T) => string;
	child: (item: T) => ReactNode;
	updateItems?: () => T[];
	height: number;
}) => {
	const viewRef = useRef<View>(null);
	const [items, setItems] = useState<T[]>([]);
	const [hold, setHold] = useState(false);
	const [viewHeight, setViewHeight] = useState(0);
	const [absolutePos, setAbsolutePos] = useState<number[]>(
		_items.map((_, i) => i)
	);
	const scrollY = useRef(0);
	const translationY = useSharedValue(0);
	const onScroll = (newY: number, updateBase = false) => {
		const min = -viewHeight;
		const max = 0;
		if (updateBase) {
			scrollY.current = Math.min(max, Math.max(min, translationY.value + newY));
			newY = 0;
		}
		const a = Math.min(max, Math.max(min, scrollY.current + newY));
		const b = scrollY.current + newY;
		translationY.value = a + (b - a) / 2;
	};
	const animatedStyles = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: withSpring(translationY.value, {
						mass: 2,
						stiffness: 300,
						damping: 50,
					}),
				},
			],
		};
	});
	useEffect(() => {
		setItems(_items);
		setAbsolutePos(_items.map((_, i) => i));
	}, [_items.length]);
	useEffect(() => {
		if (!hold) {
			const newItems = absolutePos
				.reduce<T[]>((acc, k, i) => {
					acc[k] = items[i];
					return acc;
				}, items.concat())
				.filter((v) => !!v);
			if (newItems.length === _items.length) {
				onPositionChange?.(newItems);
			}
		}
	}, [hold]);
	return (
		<View
			style={{
				overflow: "hidden",
				flexGrow: 1,
				flex: 1,
			}}
			ref={viewRef}
			onLayout={async ({ nativeEvent }) => {
				const { x, y, width, height: viewHeight } = nativeEvent.layout;
				setViewHeight(items.length * height - viewHeight);

				console.log("^_^ Log \n file: Swipeable.tsx:92 \n m:", {
					viewHeight,
					y,
					WindowHeight,
					d: items.length * height - viewHeight,
				});
			}}
		>
			<Animated.View style={[animatedStyles]}>
				{items.map((item, i) => (
					<SwipeableItem
						key={i}
						absolutePos={absolutePos[i]}
						onPositionChange={(item, ap) => {
							ap = Math.max(0, Math.min(_items.length - 1, ap));
							setAbsolutePos((cv) => {
								const index = cv.indexOf(ap);
								cv[index] = cv[i];
								cv[i] = ap;
								return cv.concat();
							});
						}}
						{...{
							item,
							onDelete,
							onPress,
							itemStyle: itemStyle,
							setHold,
							i,
							hold,
							height,
							onScroll,
						}}
					>
						{child(item)}
					</SwipeableItem>
				))}
			</Animated.View>
		</View>
	);
};
