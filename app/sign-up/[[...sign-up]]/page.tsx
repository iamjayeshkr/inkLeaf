import { SignUp } from "@clerk/nextjs";
import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] bg-[radial-gradient(#e4e2dd_1.5px,transparent_1.5px)] [background-size:24px_24px] flex items-center justify-center p-4">
      <SignUp path="/sign-up" />
    </div>
  );
}
