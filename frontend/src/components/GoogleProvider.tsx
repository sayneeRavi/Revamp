"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

interface GoogleProviderProps {
  children: React.ReactNode;
}

export default function GoogleProvider({ children }: GoogleProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Always wrap with GoogleOAuthProvider to provide context
  // If clientId is empty, GoogleLogin components won't work but won't crash
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
