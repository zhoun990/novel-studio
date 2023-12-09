import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { Paragraph } from "@/utils/types";
import { createEstate } from "@e-state/react";
import { Novel, Episode, Groupe, Plot, PlotGroups, Tables } from "./types";
export const { useEstate, clearEstate, setEstates } = createEstate(
	{
		main: {
			session: null as null | Session,
			dif: [],
			paragraphs: [] as Paragraph[],
			focusedLine: 0,
			cursorPosition: { start: 0, end: 0 },
			focus: null as null | { line: number; cursor: number },
			title: "",
			description: "",
			saveLocal: false,
			loading: false,
		},
		persist: {
			novels: {} as Record<string, Novel>,
			episodes: {} as Record<string, Episode>,
			episodeGroups: {} as Record<string, Groupe>,
			selectedGroupe: {} as Record<string, string | null>,

			plots: {} as Record<string, Plot>,
			plotGroups: {} as Record<string, PlotGroups>,
			selectedPlotGroupe: {} as Record<string, string | null>,
			archive: {} as Record<string, Record<string, Tables["episodes"]["Row"]>>,
			signinRecommendation: false,
			timestamp: Date.now(),
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
export const setNovel = (
	novel_id: string | string[] | undefined,
	value: Novel | ((currentValue: Novel) => Novel)
) => {
	if (!novel_id) return;
	setEstates.persist({
		novels: (cv) => {
			if (typeof value === "function") {
				cv[String(novel_id)] = value(cv[String(novel_id)]);
				console.log(
					"^_^ Log \n file: estate.ts:59 \n cv[String(novel_id)]:",
					cv[String(novel_id)]
				);
			} else cv[String(novel_id)] = value;
			return Object.assign({}, cv);
		},
	});
};
export const setEpisode = (
	episode_id: string | string[] | undefined,
	value: Episode | ((currentValue: Episode) => Episode)
) => {
	if (!episode_id) return;
	setEstates.persist({
		episodes: (cv) => {
			if (typeof value === "function") {
				cv[String(episode_id)] = value(cv[String(episode_id)]);
			} else cv[String(episode_id)] = value;
			return Object.assign({}, cv);
		},
	});
};
export const setGroupe = (
	groupe_id: string | string[] | undefined,
	value: Groupe | ((currentValue: Groupe) => Groupe)
) => {
	if (!groupe_id) return;
	setEstates.persist({
		episodeGroups: (cv) => {
			if (typeof value === "function") {
				cv[String(groupe_id)] = value(cv[String(groupe_id)]);
			} else cv[String(groupe_id)] = value;
			return Object.assign({}, cv);
		},
	});
};
export const setPlot = (
	plot_id: string | string[] | undefined,
	value: Plot | ((currentValue: Plot) => Plot)
) => {
	if (!plot_id) return;
	setEstates.persist({
		plots: (cv) => {
			if (typeof value === "function") {
				cv[String(plot_id)] = value(cv[String(plot_id)]);
			} else cv[String(plot_id)] = value;
			return Object.assign({}, cv);
		},
	});
};
