"use client";
import { useEffect } from "react";
import { useAppDispatch } from "@/lib/redux/hook";
import { login } from "@/lib/redux/features/authSlice";
import { jwtDecode } from "jwt-decode";
import { getCookie } from "cookies-next";

import { IUser } from "@/interfaces/user.interface";

export default function AuthInitializer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getCookie("access_token");
      if (token) {
        try {
          const user: IUser = jwtDecode(token.toString());
          dispatch(login({ user, token: token.toString() }));
        } catch (error) {
          console.error("Token decode error:", error);
        }
      }
    };
    initializeAuth();
  }, [dispatch]);

  return <>{children}</>;
}