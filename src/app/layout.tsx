import "./globals.css";

export const metadata = {
  title: "QRIOUS",
  description: "Ask curious questions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
