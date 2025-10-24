import { useAppSelector, useAppDispatch } from "@/lib/redux/hook";
import {
  logout as logoutAction,
  fetchUser as fetchUserAction,
} from "@/lib/redux/features/authSlice";
import { useRouter } from "next/navigation";

export function useAuth() {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Transform Redux user to match the expected format for new components
  const transformedUser = auth.user
    ? {
        id: auth.user.id?.toString() || "",
        name: `${auth.user.first_name} ${auth.user.last_name}`,
        email: auth.user.email,
        role:
          auth.user.roleName === "Event Organizer"
            ? ("ORGANIZER" as const)
            : ("CUSTOMER" as const),
        pointsBalance: auth.user.user_points || 0,
        organizer:
          auth.user.roleName === "Event Organizer"
            ? {
                displayName: `${auth.user.first_name} ${auth.user.last_name}`,
                bio: null,
                ratingsAvg: 0,
              }
            : null,
      }
    : null;

  const login = async (
    payload: { email: string; password: string },
    options?: { rememberMe?: boolean }
  ) => {
    // This will be handled by your existing login flow in authSlice
    throw new Error("Login should be handled through existing Redux auth flow");
  };

  const register = async (
    payload: {
      name: string;
      email: string;
      password: string;
      role: "CUSTOMER" | "ORGANIZER";
    },
    options?: { rememberMe?: boolean }
  ) => {
    // This will be handled by your existing register flow
    throw new Error(
      "Register should be handled through existing Redux auth flow"
    );
  };

  const logout = async () => {
    try {
      // Clear the token from cookies
      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Clear from localStorage and sessionStorage as well
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token");
        localStorage.removeItem("persist:root");
        sessionStorage.clear();
      }

      // Dispatch logout action to clear Redux state
      dispatch(logoutAction());

      // Force a hard refresh to clear any cached state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, still try to clear state
      dispatch(logoutAction());
      window.location.href = "/";
    }
  };

  const refreshProfile = async () => {
    try {
      await dispatch(fetchUserAction()).unwrap();
    } catch (error) {
      console.error("Failed to refresh profile:", error);
      // If refresh fails, logout the user
      await logout();
      throw error;
    }
  };

  return {
    user: transformedUser,
    token: auth.user?.token || null,
    isInitializing: auth.status === "loading",
    login,
    register,
    logout,
    refreshProfile,
  };
}
