import "./globals.css";
import type {Metadata} from "next";
import Script from 'next/script';
import {AuthProvider} from "@/components/auth/AuthProvider";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = {
    title: "Gugudan - AI Counselor",
    description: "AI-powered counselor for emotional problems between couples",
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
        <head>
            {/* Google Tag Manager */}
            {GTM_ID && (
                <Script
                    id="gtm-head"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                              })(window,document,'script','dataLayer','${GTM_ID}');
                            `,
                    }}
                />
            )}<title>Gugudan</title>
        </head>
        <body>
            
        {/* GTM noscript */}
        {GTM_ID && (
            <noscript>
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                    height="0"
                    width="0"
                    style={{display: 'none', visibility: 'hidden'}}
                />
            </noscript>
        )}
        <AuthProvider>
        <AppHeader />
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}
