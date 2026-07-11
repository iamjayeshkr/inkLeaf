"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import LandingPage from "../layout/LandingPage";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isLoaded, isSignedIn } = useUser();

  // If Clerk is still loading, show a clean, elegant loading spinner
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] bg-[radial-gradient(#e4e2dd_1.5px,transparent_1.5px)] [background-size:24px_24px] flex items-center justify-center">
        <div className="text-center select-none animate-pulse">
          <div className="w-10 h-10 border-2 border-[#B25E43] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] text-[#8C7A6B] font-bold tracking-widest uppercase">
            Loading Inkleaf Studio...
          </p>
        </div>
      </div>
    );
  }

  // If the user is not signed in, render the LandingPage
  if (!isSignedIn) {
    return <LandingPage />;
  }

  // Otherwise, render the authenticated application content
  return <>{children}</>;
}
