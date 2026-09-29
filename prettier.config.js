/** @type {import('prettier').Config} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  // Tailwind v4 entry point, so the plugin knows our theme and custom utilities
  tailwindStylesheet: "./src/styles/index.css",
  // Sort classes inside these helpers as well as in className
  tailwindFunctions: ["cn", "cva"],
};
