import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SeedSync - Indian Oilseed Value Chain Platform",
  description: "Empowering farmers, FPOs, and processors in the Indian oilseed sector with blockchain-enabled transparency and fair pricing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#437409',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
            },
          }}
        />
      </body>
    </html>
  );
}
