import { Database } from "@/utils/database.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { Paragraph } from "@/utils/types";
import { createEstate } from "@e-state/react";
type Tables = Database["public"]["Tables"];
export const { useEstate, clearEstate, setEstates } = createEstate(
	{
		main: {
			session: null as null | Session,
			dif: [],
			paragraphs: [] as Paragraph[],
			focusedLine: 0,
			cursorPosition: { start: 0, end: 0 },
			focus: null as null | { line: number; cursor: number },
		},
		persist: {
			novels: {} as Record<
				string,
				Tables["novels"]["Row"] & { synced_at: null | string }
			>,
			episodes: {} as Record<string, Record<string, Tables["episodes"]["Row"]>>,
			archive: {} as Record<string, Record<string, Tables["episodes"]["Row"]>>,
			signinRecomendation: false,
		},
	},
	{
		persist: ["persist"],
		storage: AsyncStorage,
		// middleware: {
		// 	persist: {
		// 		episodes: (cv) => {
		// 			console.log("^_^ Log \n file: estate.ts:33 \n cv:", cv);
		// 			return cv;
		// 		},
		// 		novels: (cv) => {
		// 			console.log("^_^ Log \n file: estate.ts:37 \n cv:", cv);
		// 			return cv;
		// 		},
		// 	},
		// },
	}
);