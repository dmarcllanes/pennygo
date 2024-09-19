import dynamic from 'next/dynamic'
import { AppProps } from 'next/app'

const ThemeProvider = dynamic(
  () => import('../app/components/theme-provider').then(mod => mod.ThemeProvider),
  { ssr: false }
)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp