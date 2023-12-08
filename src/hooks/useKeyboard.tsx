import { useEffect, useState } from "react";
import { Keyboard, KeyboardEvent, KeyboardMetrics } from "react-native";

export const useKeyboard = () => {
	const [keyboardStatus, setKeyboardStatus] = useState<{
		screenX: number;
		screenY: number;
		width: number;
		height: number;
	}>({
		screenX: 0,
		screenY: 0,
		width: 0,
		height: 0,
	});

	useEffect(() => {
		const showSubscription = Keyboard.addListener(
			"keyboardWillShow",
			(e: KeyboardEvent) => {
				setKeyboardStatus(e.endCoordinates);

			}
		);
		const hideSubscription = Keyboard.addListener("keyboardWillHide", () => {
			setKeyboardStatus({
				screenX: 0,
				screenY: 0,
				width: 0,
				height: 0,
			});
		});

		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, []);
	return keyboardStatus;
};
