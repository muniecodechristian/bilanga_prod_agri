import { useQuery } from "@tanstack/react-query";

const API_URL = "https://bilanga-app-backend2.vercel.app/api/recoltes";

export function useGetRecoltes() {
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["recoltes"], // clé unique
    queryFn: async () => {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des récoltes");
      }
      return response.json(); // retourne les données JSON
    },
    staleTime: 1000 * 60 * 2, // 2 min avant refetch
  });

  // On renvoie toujours un objet propre
  return {
    dataRecoltes: data || [],
    loading: isLoading || isFetching,
    error,
    refetch,
  };
}
