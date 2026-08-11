import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Tarun Goluguri | Senior Network Engineer",
  description:
    "Cinematic portfolio for Tarun Goluguri, a senior network engineer designing secure, resilient enterprise and cloud networks.",
  openGraph: {
    title: "Tarun Goluguri | Senior Network Engineer",
    description: "Secure hybrid networks, cloud boundaries, and automation-led operations.",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Tarun Goluguri, Senior Network Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tarun Goluguri | Senior Network Engineer",
    description: "Secure hybrid networks, cloud boundaries, and automation-led operations.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
