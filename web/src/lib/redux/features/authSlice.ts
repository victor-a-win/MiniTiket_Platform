import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios"
import {IUser} from "../../../interfaces/user.interface";
import { RootState } from "@/lib/redux/store"; 

export const fetchUser = createAsyncThunk(
'auth/fetchUser',
   async (_, { getState }) => {
    const state = getState() as RootState;
    let token = state.auth.user?.token;
    
     // Fallback to cookie if token is missing in state
    if (!token) {
      token = getCookie('access_token'); // Ensure you have a way to read cookies
    }

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      ...response.data,
      token: (response.config.headers?.Authorization as string)?.split(' ')[1] || ''
    }
  }
);

export interface AuthState {
  isLogin?: boolean;
  user: IUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AuthState = {
  isLogin: false,
  user: null,
  status: 'idle'
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
      };
    },
    logout: (state) => {
      state.isLogin = false;
      state.user = null;
    },
    updateProfilePicture(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.profile_picture = 
          `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/w_200,h_200,c_fill/${action.payload}`;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.status = 'succeeded';
        state.user = {
            ...action.payload,
        // Preserve the token if it's not coming from the API
         PointTransactions: action.payload.PointTransactions || [],
        token: state.user?.token || action.payload.token
        };
        state.isLogin = true;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.status = 'failed';
        state.isLogin = false;
        state.user = null;
      });
  },
});

export const {login, logout, updateProfilePicture} = authSlice.actions;
export default authSlice.reducer;
function getCookie(name: string): string | undefined {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return undefined;
}
