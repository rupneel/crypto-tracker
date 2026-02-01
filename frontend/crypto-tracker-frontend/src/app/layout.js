import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "CryptoTracker - Real-time Cryptocurrency Tracking",
  description: "Track cryptocurrency prices, manage your portfolio, and stay updated with real-time market data.",
  keywords: "cryptocurrency, bitcoin, ethereum, crypto tracker, portfolio, prices",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Header />
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
