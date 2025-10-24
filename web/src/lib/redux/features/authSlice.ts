import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { IUser } from "../../../interfaces/user.interface";
import { RootState } from "@/lib/redux/store";

export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { getState }) => {
    const state = getState() as RootState;
    let token = state.auth.user?.token;

    // Fallback to cookie if token is missing in state
    if (!token) {
      token = getCookie("access_token");
    }

    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Fetching user profile with token...");

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Transform the response to match your Prisma schema
    const userData = response.data;
    console.log("User data received:", userData);

    const result = {
      ...userData,
      // Ensure the roleName matches your Prisma schema
      roleName: userData.role?.name || userData.roleName || "User",
      token:
        (response.config.headers?.Authorization as string)?.split(" ")[1] ||
        token,
    };

    console.log("Transformed user data:", result);
    return result;
  }
);

export interface AuthState {
  isLogin?: boolean;
  user: IUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: AuthState = {
  isLogin: false,
  user: null,
  status: "idle",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: IUser; token: string }>) => {
      state.isLogin = true;
      state.user = {
        ...action.payload.user,
        token: action.payload.token,
        // Ensure roleName is properly set
        roleName: action.payload.user.roleName || "User",
      };
    },
    logout: (state) => {
      state.isLogin = false;
      state.user = null;
      state.status = "idle";

      // Clear persisted data from storage
      if (typeof window !== "undefined") {
        // Clear Redux persist storage
        localStorage.removeItem("persist:root");
        sessionStorage.removeItem("persist:root");

        // Clear any other auth-related storage
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token");
      }
    },
    updateProfilePicture(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.profile_picture = `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/w_200,h_200,c_fill/${action.payload}`;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.status = "succeeded";
        state.user = {
          ...action.payload,
          // Preserve the token if it's not coming from the API
          PointTransactions: action.payload.PointTransactions || [],
          token: state.user?.token || action.payload.token,
          roleName: action.payload.roleName || "User",
        };
        state.isLogin = true;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.status = "failed";
        state.isLogin = false;
        state.user = null;
      });
  },
});

export const { login, logout, updateProfilePicture } = authSlice.actions;
export default authSlice.reducer;

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return undefined;
}
