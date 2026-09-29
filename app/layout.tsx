import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/providers/cart-provider";
import { WalletProvider } from "@/components/providers/wallet-provider";
import "./globals.css";

const chakraPetch = Chakra_Petch({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EmergencyBox - ตู้กดของจำเป็น",
  description: "ของจำเป็น เมื่อคุณต้องการมันที่สุด",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={chakraPetch.className}>
        <CartProvider>
          <WalletProvider>
            {children}
            <Toaster theme="light" position="top-center" richColors />
          </WalletProvider>
        </CartProvider>
      </body>
    </html>
  );
}
