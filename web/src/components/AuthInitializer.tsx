"use client";
import { useEffect } from "react";
import { useAppDispatch } from "@/lib/redux/hook";
import { login, fetchUser } from "@/lib/redux/features/authSlice";
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
      try {
        const token = getCookie("access_token");
        
        if (token) {
          // Verify token is valid and not expired
          const decoded: any = jwtDecode(token.toString());
          const currentTime = Date.now() / 1000;
          
          console.log("🔍 Token Debug:", {
            tokenExists: !!token,
            decodedRole: decoded.roleName,
            decodedData: decoded
          });
          
          if (decoded.exp && decoded.exp < currentTime) {
            // Token expired, clear it
            document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            return;
          }

          // Try to fetch user profile with the token
          try {
            const result = await dispatch(fetchUser()).unwrap();
            console.log("🔍 User Profile Debug:", {
              roleName: result.roleName,
              userData: result
            });
          } catch (error) {
            console.error("Failed to fetch user profile:", error);
            // If fetching profile fails, clear the invalid token
            document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear any invalid tokens
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    };

    initializeAuth();
  }, [dispatch]);

  return <>{children}</>;
}