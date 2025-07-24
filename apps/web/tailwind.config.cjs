// tailwind.config.cjs
module.exports = {
    content: [
        "./src/app/**/*.{ts,tsx,js,jsx}",       // includes /dashboard
        "./src/components/**/*.{ts,tsx,js,jsx}" // optional if using shared components
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
