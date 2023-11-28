import { useCallback, useEffect } from "react";
import { useEstate } from "@/utils/estate";
let c = 0;
/**
 * パラグラフを更新します。
 * @param {number} param0.i - 挿入位置。指定なしの場合はpush（一番最後）を指定と同義。マイナスの場合はunshift（一番最初）を指定と同義。
 * @param {string} param0.text - 挿入するテキスト。デフォルトは空文字列。
 */
export const usePgh = () => {
	c++;
	const { session, setEstate: setMainEstate } = useEstate("main");

	return {
		insert: (i?: number, text = "") => {
			const key = Math.random().toString(36).substring(2);
			setMainEstate({
				paragraphs: (cv) => {
					if (!i) {
						cv.push({
							key,
							text,
							height: 0,
						});
					} else if (i < 0) {
						cv.unshift({
							key,
							text,
							height: 0,
						});
					} else {
						cv.splice(i, 0, {
							key,
							text,
							height: 0,
						});
						console.log("^_^ Log \n file: index.tsx:49 \n splice:");
					}

					return cv.concat();
				},
			});
			return key;
		},
		update: (i?: number, text?: string, height?: number, remove = false) => {
			setMainEstate({
				paragraphs: (cv) => {
					if (!i) i = cv.length - 1;
					i = Math.max(0, i);
					i = Math.min(cv.length - 1, i);
					if (remove) cv.splice(i, 1);
					else
						cv[i] = {
							key: cv[i].key,
							height: typeof height === "number" ? height : cv[i].height,
							text: typeof text === "string" ? text : cv[i].text,
						};

					return cv.concat();
				},
			});
		},
	};
};
