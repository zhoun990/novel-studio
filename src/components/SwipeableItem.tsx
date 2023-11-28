import { useLocalSearchParams } from "expo-router";
import {
	View,
	ViewStyle,
	StyleProp,
	Pressable,
	Dimensions,
} from "react-native";
import Text from "@/components/CustomText";
import { useEffect, useRef, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	Easing,
	SharedValue,
	cancelAnimation,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";

const WindowWidth = Dimensions.get("window").width;

export const SwipeableItem = <T,>({
	children,
	item,
	onDelete,
	onPositionChange,
	onPress,
	itemStyle,
	setHold,
	absolutePos,
	i,
	hold,
	height: itemHeight,
	onScroll,
}: {
	children: React.ReactNode;
	item: T;
	onDelete?: (item: T) => void;
	onPreDelete?: () => void;
	onPress?: (item: T) => void;
	onPositionChange?: (item: T, relativePos: number) => void;
	itemStyle: StyleProp<ViewStyle>;
	setHold: React.Dispatch<React.SetStateAction<boolean>>;
	absolutePos: number;
	i: number;
	height: number;
	hold: boolean;
	onScroll: (translationY: number, updateBase?: boolean) => void;
}) => {
	const { novel_id } = useLocalSearchParams();

	const [offset, setOffset] = useState(0);
	const [deleting, setDeleting] = useState(false);
	const [isLongPress, setIsLongPress] = useState(false);
	const [currentPos, setCurrentPos] = useState(i);
	const x = useRef(0);
	const y = useRef(0);
	// const scrollYOffset = useRef(0);
	const movement = useRef(0);
	const translationX = useSharedValue(0);
	const translationY = useSharedValue(0);
	const opacity = useSharedValue(1);
	const height = useSharedValue(itemHeight);
	const constantsWidth = WindowWidth / 4;
	const animatedStyles = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateX: withSpring(translationX.value, {
						mass: 1,
						stiffness: 130,
						damping: 100,
					}),
				},
				{
					translateY: isLongPress
						? withSpring(
								translationY.value + (currentPos - i || 0) * itemHeight,
								{
									mass: 1,
									stiffness: 200,
									damping: 70,
								}
						  )
						: withTiming(
								translationY.value + (absolutePos - i || 0) * itemHeight,
								{
									duration: 400,
								}
						  ),
				},
				{ scale: withTiming(isLongPress ? 1.02 : 1, { duration: 100 }) },
			],
		};
	});

	const delStyle = useAnimatedStyle(() => {
		return {
			width: withTiming(deleting ? 0 : constantsWidth, {
				duration: 400,
				easing: Easing.linear,
			}),
			opacity: withTiming(deleting ? 0 : 1, {
				duration: 400,
			}),
		};
	});
	useEffect(() => {
		setHold(isLongPress);
	}, [isLongPress]);
	useEffect(() => {
		if (!isLongPress) {
			translationY.value = 0;
			setCurrentPos(absolutePos);
		}
	}, [isLongPress, absolutePos]);
	useEffect(() => {
		if (deleting) {
			x.current = -WindowWidth;
			translationX.value = x.current;
			// setOffset(x.current);
			opacity.value = withTiming(0.5, { duration: 2000 });
			height.value = withDelay(2000, withTiming(0, { duration: 1000 }));
			const id = setTimeout(() => {
				onDelete?.(item);
			}, 3000);
			return () => {
				clearTimeout(id);
			};
		} else {
			x.current = 0;
			translationX.value = withTiming(x.current, { duration: 1000 });
			opacity.value = withTiming(1);
			height.value = withTiming(itemHeight);
		}
	}, [deleting]);
	return (
		<GestureDetector
			gesture={Gesture.Pan()
				.runOnJS(true)
				// .onBegin(() => {
				// 	scrollYOffset.current = scrollY.value;
				// })
				.onUpdate((e) => {
					if (opacity.value !== 1) {
						setDeleting(false);
					}
					movement.current += Math.abs(e.translationX);
					y.current = e.translationY;

					if (isLongPress) {
						translationY.value = y.current;
						const ap = Math.round(y.current / itemHeight) + currentPos;
						if (absolutePos !== ap) {
							onPositionChange?.(item, ap);
						}
					} else if (Math.abs(e.velocityX) > Math.abs(e.velocityY)) {
						if (offset <= -constantsWidth)
							x.current = Math.min(
								0,
								Math.max(-WindowWidth, offset + e.translationX * 2)
							);
						else
							x.current = Math.min(
								0,
								Math.max(-constantsWidth, offset + e.translationX * 1.5)
							);
						translationX.value = x.current;
					} else {
						onScroll(e.translationY + e.velocityY / 10);
					}
				})
				.onEnd(() => {
					if (x.current < -WindowWidth * 0.6) {
						setDeleting(true);
					} else if (x.current < -constantsWidth * 0.8) {
						x.current = -constantsWidth;
					} else {
						x.current = 0;
					}
					setOffset(x.current);

					onScroll(0, true);

					movement.current = 0;

					translationX.value = x.current;
					y.current = 0;
					setIsLongPress(false);
				})}
		>
			<Animated.View
				style={[
					{
						position: "relative",
						height,
						maxHeight: itemHeight,
						zIndex: isLongPress ? 1 : 0,
					},
					animatedStyles,
					// hold ? animatedStyles : animatedStyles2,
				]}
			>
				<View
					style={{
						position: "absolute",
						height: "100%",
						right: -WindowWidth,
						flexDirection: "row",
						width: WindowWidth,
					}}
				>
					<Animated.View
						style={[
							{
								backgroundColor: "red",
								height: "100%",
								// alignItems: "baseline",
							},
							delStyle,
						]}
					>
						<Pressable
							style={{
								width: "100%",
								height: "100%",
								justifyContent: "center",
								alignItems: "center",
							}}
							onPress={() => {
								setDeleting(!deleting);
							}}
						>
							<Text style={{ color: "white" }}>削除</Text>
						</Pressable>
					</Animated.View>
					<Animated.View
						style={[
							{
								backgroundColor: "green",
								height: "100%",
								alignItems: "baseline",
								opacity,
								flexGrow: 1,
							},
						]}
					>
						<Pressable
							onPress={() => {
								setDeleting(false);
							}}
							style={{
								width: "100%",
								height: "100%",
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Text style={{ color: "white" }}>取り消す</Text>
						</Pressable>
					</Animated.View>
				</View>
				<Pressable
					style={[
						{
							flexGrow: 1,
							height: "100%",
							width: "80%",
						},
						itemStyle,
					]}
					onPress={() => {
						if (x.current === 0 && movement.current < 20 && !isLongPress)
							onPress?.(item);
						if (y.current === 0) {
							setIsLongPress(false);
						}
					}}
					onLongPress={() => {
						if (movement.current < 100) {
							setIsLongPress(true);
						}
					}}
				>
					{children}
				</Pressable>
				<Pressable
					style={{
						width: "20%",
						alignItems: "center",
						justifyContent: "center",
						position: "absolute",
						right: 0,
						height: "100%",
						backgroundColor:
							(itemStyle as ViewStyle)?.backgroundColor || "transparent",
					}}
					onPressIn={() => {
						setIsLongPress(true);
					}}
					onPressOut={() => {
						if (y.current === 0) {
							setIsLongPress(false);
						}
					}}
				>
					<Ionicons name="reorder-three-outline" size={40} color="white" />
				</Pressable>
				<View style={{ borderTopWidth: 1, marginTop: "auto" }} />
			</Animated.View>
		</GestureDetector>
	);
};
