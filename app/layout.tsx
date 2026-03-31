import type { Metadata } from 'next'
import { Noto_Sans_KR, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'InsureComp Pro - GA 보험 통합 비교·설명 플랫폼',
  description: 'GA 전용 보험상품 비교 및 고객 설명 자동화 시스템',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} ${ibmPlexMono.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <Providers>{children}</Providers>
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-50 border-t border-amber-200 px-4 py-1.5 text-center">
          <p className="text-xs text-amber-800">
            ⚠️ 본 비교 자료는 참고용이며 확정된 보장·수익이 아닙니다. 최종 보험료는 상담을 통해 확인하시기 바랍니다.
          </p>
        </div>
      </body>
    </html>
  )
}
