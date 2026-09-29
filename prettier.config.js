/** @type {import('prettier').Config} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  // Sort classes inside these helpers as well as in className
  tailwindFunctions: ["cn", "cva"],
};
