import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    base: "/personal-book-library/",
    build: { sourcemap: false },
    plugins: [react()],
});