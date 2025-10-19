"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hook";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/redux/features/authSlice";
import { useEffect, useState } from "react";

import "./navbar.styles.css"

const menus = [
  {
    label: "EO Dashboard",
    path: "/eo-dashboard", // Make sure this matches the middleware matcher
    roleName: "Event Organizer"
  },
];

export default function Navbar() {
  const [isHydrated, setIsHydrated] = useState(false);
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // add loading state
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const hasRequiredRole = (requiredRole: string | undefined) => {
    if (!requiredRole) return true;
    if (!auth.isLogin || !auth.user?.roleName) return false;
    return auth.user.roleName.toLowerCase() === requiredRole.toLowerCase();
  };

  if (!isHydrated) {
    return <div className="h-[140px] p-10">Loading...</div>;
  }

  console.log("Auth state:", auth); // Debugging line

  // Function to handle menu item click
  const onMenuItemClick = (path: string) => () => {
    if (!auth.isLogin) {
      router.push("/login");
      return;
    }
    router.push(path);
  };

  return (
    <div
      className="NavBar-Styles bg-[url('/banner_web_minpro_v1.png')] h-[140px]">
      <div 
        className="size-16 absolute ml-3 mt-3
                    sm:size-28 sm:absolute sm:ml-5"
      > <button onClick={() => router.push("/")}>
          <img className="rounded-lg" src="logo_miniTiket_v1.jpg" alt="MiniProjek G2 Logo" />
        </button>
      </div>
      <div>
        <div>
          {auth.isLogin ? (
            <div className="flex flex-row justify-end items-center mt-4 mb-10 gap-2 text-xs
                            sm:text-base sm:mb-8"
            >
              <div className="cursor-pointer"
                    onClick={() => router.push("/profile")}
              >
                {auth.user?.profile_picture ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/w_100,h_100,c_fill/${auth.user.profile_picture}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                    <span className="text-gray-500 text-xs">No Image</span>
                  </div>
                )}
              </div>
              
              <div 
                className="Auth-Button-Styles no-underline hover:underline
                          pr-1.5 pl-1.5 sm:pl-3 sm:pr-3"
              > Welcome, {auth.user?.first_name}
              </div>

              <div>
                <button 
                  className="Auth-Button-Styles cursor-pointer pr-2 pl-2 mr-2
                            sm:pl-3 sm:pr-3 sm:mr-7" 
                  onClick={() => {
                  dispatch(logout());
                  router.push("/");
                     }}> Logout
                </button>
              </div>

            </div>
          ) : (
            <div className="flex flex-row justify-end items-end py-9 text-xs gap-3
                            sm:gap-6 sm:py-6 sm:text-base">
                <div className="Auth-Button-Styles pl-2 pr-2 sm:pl-2 sm:pr-3" >
                  <button onClick={() => router.push("/login")}>Login</button>
                </div>
                <div className="Auth-Button-Styles mr-5 pr-2 pl-2 sm:pl-3 sm:pr-3">
                  <button onClick={() => router.push("/register")}>Register</button>  
                </div>
            </div>
          )}
        </div>
        <div className="flex flex-row mt-4 px-12 justify-evenly items-center text-xs gap-2
                        sm:mt-5 sm:justify-center sm:text-xl sm:gap-4"
        >
          <button 
            className="Nav-Button-Stlyes pl-2 pr-2 sm:pl-4 sm:pr-4"
            onClick={() => router.push("/")}>
              Home
          </button>

          <button 
            className="Nav-Button-Stlyes pl-2 pr-2 sm:pl-4 sm:pr-4"
            onClick={() => router.push("/about")}>
              About
          </button>
  
          <button 
            className="Nav-Button-Stlyes pl-2 pr-2 sm:pl-4 sm:pr-4" 
            onClick={() => router.push("/contact")}>
              Contact
          </button>

          <div className="EO-Button-Stlyes cursor-pointer pl-2 pr-2 sm:pl-4 sm:pr-4">
            {menus.map((menu, idx) => {
          // Using the new role checking function
            if (!hasRequiredRole(menu.roleName)) return null;
              return (
              <div
                key={idx}
                onClick={onMenuItemClick(menu.path)}
              >
                {menu.label}
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
