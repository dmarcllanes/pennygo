'use client';

// @ts-ignore
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// @ts-ignore
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { ThemeProvider } from "@/components/theme-provider"
import { useState, ReactNode, Component, ErrorInfo } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClientComponentClient())

  return (
    <ErrorBoundary>
      <SessionContextProvider supabaseClient={supabase}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </SessionContextProvider>
    </ErrorBoundary>
  )
}