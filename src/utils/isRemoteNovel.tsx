import { store } from "@/utils/estate";

export const isRemoteNovel = (novel_id: string | string[] | undefined) => {
	const session = store.getValue("main", "session");
	const novels = store.getValue("persist", "novels");
	return session && session.user.id === novels[String(novel_id)]?.user_id;
};
