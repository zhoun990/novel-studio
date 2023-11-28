import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/utils/database.types";

const supabaseUrl = "https://pxshvmbgzfneqkcaiyky.supabase.co";
const supabaseAnonKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4c2h2bWJnemZuZXFrY2FpeWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA1MjU1MjIsImV4cCI6MjAxNjEwMTUyMn0.8eIBfF9hgz-IEGvBBZhlqhQaMO9gsyCbtlV07a6CW9Y";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});
