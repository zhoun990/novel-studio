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
	containerStyle,
	onPressItem,
	onDeleteItem,
	onPositionChange,
	data = [],
	keyExtractor = (item, i) => String(i),
	renderItem,
	itemHeight,
	dndEnabled = false,
	removeEnabled = false,
	ItemSeparatorComponent = () => (
		<View style={{ borderTopWidth: 1, borderColor: "gray" }} />
	),
	scrollBottomOffset = 0,
	scrollTopOffset = 0,
	id,
}: {
	itemStyle?: StyleProp<ViewStyle>;
	containerStyle?: StyleProp<ViewStyle>;
	onPressItem?: (item: T) => void;
	onDeleteItem?: (item: T) => void;
	onPositionChange?: (items: T[]) => void;
	data: T[];
	keyExtractor?: (item: T, index: number) => string;
	renderItem: (item: T) => ReactNode;
	itemHeight: number;
	dndEnabled?: boolean;
	removeEnabled?: boolean;
	ItemSeparatorComponent?: (props: { index: number }) => ReactNode;
	scrollBottomOffset?: number;
	scrollTopOffset?: number;
	id?: string;
}) => {
	const viewRef = useRef<View>(null);
	const [items, setItems] = useState<T[]>([]);
	const [hold, setHold] = useState(false);
	const [viewHeight, setViewHeight] = useState(0);
	const [absolutePos, setAbsolutePos] = useState<number[]>(
		data.map((_, i) => i)
	);
	const [stableAbsolutePos, setStableAbsolutePos] = useState<number[]>(
		data.map((_, i) => i)
	);
	const scrollY = useRef(scrollTopOffset);
	const translationY = useSharedValue(scrollTopOffset);
	const onScroll = (newY: number, updateBase = false) => {
		const min = -viewHeight - scrollBottomOffset;
		const max = scrollTopOffset;
		if (updateBase) {
			scrollY.current = Math.min(max, Math.max(min, translationY.value));
			newY = 0;
		}

		const a = Math.min(max, Math.max(min, scrollY.current + newY));
		const b = scrollY.current + newY;
		translationY.value = a + (b - a) / 2;
		console.log("^_^ Log \n file: Swipeable.tsx:64 \n (b - a):", b - a);
	};
	const animatedStyles = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: withSpring(translationY.value, {
						// mass: 5,
						// stiffness: 400,
						// damping: 60,
						mass: 2,
						stiffness: 300,
						damping: 50,
					}),
				},
			],
		};
	});
	useEffect(() => {
		setItems(data);
		setAbsolutePos(data.map((_, i) => i));
	}, [data.length, id]);
	useEffect(() => {
		if (!hold) {
			setStableAbsolutePos([...absolutePos]);
		}
	}, [hold, absolutePos]);
	useEffect(() => {
		if (!hold) {
			const newItems = absolutePos
				.reduce<T[]>((acc, k, i) => {
					acc[k] = items[i];
					return acc;
				}, items.concat())
				.filter((v) => !!v);
			if (newItems.length === data.length) {
				onPositionChange?.(newItems);
			}
		}
	}, [hold]);
	return (
		<View
			style={[
				{
					overflow: "hidden",
					flexGrow: 1,
					flex: 1,
				},
				containerStyle,
			]}
			ref={viewRef}
			onLayout={async ({ nativeEvent }) => {
				const { x, y, width, height: viewHeight } = nativeEvent.layout;
				setViewHeight(items.length * itemHeight - viewHeight);
			}}
		>
			<Animated.View style={[animatedStyles]}>
				{items.map((item, i) => (
					<SwipeableItem
						key={keyExtractor(item, i)}
						absolutePos={absolutePos[i]}
						onPositionChange={(item, ap) => {
							ap = Math.max(0, Math.min(data.length - 1, ap));
							setAbsolutePos((cv) => {
								const index = cv.indexOf(ap);
								cv[index] = cv[i];
								cv[i] = ap;
								return cv.concat();
							});
						}}
						{...{
							item,
							onDelete: onDeleteItem,
							onPress: onPressItem,
							itemStyle: itemStyle,
							setHold,
							i,
							hold,
							height: itemHeight,
							onScroll,
							dndEnabled,
							removeEnabled,
							ItemSeparatorComponent,
						}}
					>
						{renderItem(data[stableAbsolutePos[i]])}
					</SwipeableItem>
				))}
			</Animated.View>
		</View>
	);
};
