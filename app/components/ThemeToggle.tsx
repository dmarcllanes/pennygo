'use client'

import { useTheme } from "next-themes"
import { useState, useEffect } from 'react'

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {theme === 'dark' ? (
        // Sun icon for light mode
        <svg /* ... sun icon SVG ... */ />
      ) : (
        // Moon icon for dark mode
        <svg /* ... moon icon SVG ... */ />
      )}
    </button>
  )
}

export default ThemeToggle