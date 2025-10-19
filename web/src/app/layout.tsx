"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer"

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/lib/redux/store";
import AuthInitializer from "@/components/AuthInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AuthInitializer>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                  <main className="flex-grow">
                    {children}
                  </main>
                <Footer />
              </div>
            </AuthInitializer>
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
