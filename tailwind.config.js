/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        tomato: ["Tomato Grotesk", "sans-serif"],
        // SF Pro Display ships here as a single 400-weight OTF, so every
        // font-medium/semibold/bold on a .font-sfpro element was rendered as a
        // synthetic (smeared) bold. Resolve to the real system UI font instead:
        // on Apple platforms that *is* SF Pro, with genuine weights.
        sfpro: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
}

