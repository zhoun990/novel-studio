import { useGlobalSearchParams } from "expo-router";

export const useGlobalSearchParamsString = (): Record<string, string> => {
  const params = useGlobalSearchParams();
  return Object.keys(params).reduce<Record<string, string>>((acc, key) => {
    acc[key] = String(params[key] || "");
    return acc;
  }, {} as Record<string, string>);
};
