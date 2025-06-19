/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx, mdx}",
        "./_components/**/*.{js,ts,jsx,tsx, mdx}",
        "./app/**/*.{js,ts,jsx,tsx, mdx}"
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require("@tailwindcss/forms")({
            strategy: 'class'
        })
    ],
}
