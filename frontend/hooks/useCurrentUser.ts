import { useQuery } from "@tanstack/react-query";
import { useApiClient, userApi } from "../utils/api";
import { useAuthContext } from "@/context/AuthContext";

export const useCurrentUser = () => {
  const api = useApiClient();
  const { isSignedIn, user: contextUser } = useAuthContext();

  const {
    data: currentUser,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: () => userApi.getCurrentUser(api),
    select: (response) => response.data.user,
    enabled: isSignedIn, // Ne pas lancer la requête si non connecté
    initialData: contextUser ? { data: { user: contextUser } } : undefined,
  });

  return { currentUser, isLoading, error, refetch };
};
