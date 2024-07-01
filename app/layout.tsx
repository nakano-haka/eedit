import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_JP } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { jaJP } from "@clerk/localizations";

const IBMPLex = IBM_Plex_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex"
});

export const metadata: Metadata = {
  title: "EEdit",
  description: "Edit your pic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
    appearance={{
      variables: {colorPrimary: "#624cf5"}
    }}
    localization={jaJP}
    >
      <html lang="en">
        <body className={cn(" font-IBMPlex antialiased", IBMPLex.variable)}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
