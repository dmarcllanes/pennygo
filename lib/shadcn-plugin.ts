import plugin from 'tailwindcss/plugin'

export const shadcnPlugin = plugin(
  function ({ addBase, addComponents }) {
    addBase({
      ':root': {
        '--background': '0 0% 100%',
        '--foreground': '222.2 47.4% 11.2%',
        // ... add other variables as needed
      },
      '.dark': {
        '--background': '224 71% 4%',
        '--foreground': '213 31% 91%',
        // ... add other dark mode variables as needed
      },
    })
    addComponents({
      '.shadcn-button': {
        // ... add button styles
      },
      // ... add other component styles
    })
  },
  {
    theme: {
      // ... your theme configuration
    },
  }
)