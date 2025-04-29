import type { Metadata } from 'next';
import { Inter as FontSans } from "next/font/google" // Use Inter font
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider
import { cn } from "@/lib/utils"


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})


export const metadata: Metadata = {
  title: 'Thought Whisperer',
  description: 'A companion for prompting',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body
       className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col overflow-x-hidden", // Added overflow-x-hidden
          fontSans.variable
       )}
      >
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <div className="flex-grow flex flex-col"> {/* Ensure flex-grow takes height */}
            {children}
          </div>
          <footer className="py-4 px-6 text-center text-sm text-muted-foreground border-t">
            Built for StreamAlive by @appa using Firebase Studio
          </footer>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
