import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "DM Transport Purworejo | Rental Mobil & Motor Terpercaya",
  description: "Rental mobil dan motor terpercaya di Purworejo. Harga terjangkau, kendaraan terawat, pelayanan 24 jam. Sewa mudah via WhatsApp!",
  keywords: "rental mobil purworejo, sewa mobil purworejo, rental motor purworejo, sewa motor purworejo, dm transport",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="id">
        <body className={inter.variable}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
