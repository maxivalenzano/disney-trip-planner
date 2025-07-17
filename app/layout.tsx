import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import SharedLayout from "./components/shared-layout"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "J&M Disney Planner - Nuestra Aventura Mágica",
  description: "Planificá tu aventura mágica a Disney con tu pareja. Organizá juntos parques, películas, tareas y recuerdos especiales en un solo lugar encantado. Donde los sueños se hacen realidad para dos.",
  keywords: "Disney, planificador, viaje, parques, películas, magia, aventura, J&M, pareja, argentina",
  authors: [{ name: "Team J&M" }],
  metadataBase: new URL('https://www.jymdisneyplanner.com.ar'),
  alternates: {
    canonical: 'https://www.jymdisneyplanner.com.ar'
  },
  openGraph: {
    title: "J&M Disney Planner - Nuestra Aventura Mágica",
    description: "Planificá tu aventura mágica a Disney con tu pareja. Organizá juntos parques, películas, tareas y recuerdos especiales.",
    url: 'https://www.jymdisneyplanner.com.ar',
    siteName: 'J&M Disney Planner',
    locale: 'es_AR',
    type: 'website',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#667eea' },
    { media: '(prefers-color-scheme: dark)', color: '#764ba2' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'J&M Disney Planner'
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Disney Planner" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#667eea" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="icon" href="/icons/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SharedLayout>
            {children}
          </SharedLayout>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
