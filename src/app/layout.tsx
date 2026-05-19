import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { supabaseServer } from "@/lib/supabase/server";


const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Faculty Recruitment Portal",
  description: "Apply for faculty positions.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: brandings } = await supabaseServer.from("branding_settings").select("*").limit(1);
  const branding = brandings && brandings.length > 0 ? brandings[0] : null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative z-0">
        <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center opacity-[0.03]">
           <img src="https://www.gvpcdpgc.edu.in/gvpcdpgc-logo.png" alt="Watermark" className="w-[80vw] md:w-[40vw] max-w-2xl object-contain" />
        </div>
        <Header instituteName={branding?.institute_name || "Global University"} />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer 
           instituteName={branding?.institute_name || "Global University"} 
           footerText={branding?.footer_text} 
        />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
