import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  roleName?: string;
  [key: string]: any;
}

// Protected routes
const eoRoutes = ["/eo-dashboard"];

export default async function middleware(req: NextRequest) {
  try {
    const path = req.nextUrl.pathname;
    const token = req.cookies.get('access_token')?.value;

    console.log(`Middleware triggered for ${path}, token exists: ${!!token}`); // Debugging line

     // Check if the current path is a protected route
     const isEoRoute = eoRoutes.some(route => path.startsWith(route));

   // If trying to access protected route without token, redirect to login
   if (isEoRoute) {
    if (!token) {
      console.log("No token - redirecting to login");
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    try {
      console.log("Token content:", token);
      const decoded = jwtDecode<TokenPayload>(token);
      console.log("Decoded token:", decoded);

    // If trying to access EO route without EO role, redirect to unauthorized
    if (decoded.roleName?.toLowerCase() !== "event organizer") {
      console.log("Not an organizer - redirecting to home");
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    
  // If we get here, user is authorized
  console.log("User is authorized as organizer");
  return NextResponse.next();
  } catch (err) {
    console.error("Token decode error:", err);
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
}
  console.log("Path being matched:", req.nextUrl.pathname);
return NextResponse.next();
  } catch (err) {
    console.error("Middleware error:", err);
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }
}

export const config = {
    matcher: ["/eo-dashboard/:path*"]
};
