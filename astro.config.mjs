// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Static portable build — deployable to Cloudflare Pages and GitHub Pages
// from the same `dist/` output. See README for deploy details.
export default defineConfig({
	site: "https://theblackflagger.com",
	output: "static",
	trailingSlash: "never",
	// Emit flat files (/apps.html, /apps/blackflare.html) so URLs without a
	// trailing slash are served directly — no host-level redirect — keeping
	// canonical links consistent on both Cloudflare and GitHub Pages.
	build: { format: "file" },
	// Hide the floating dev toolbar during `astro dev`.
	devToolbar: { enabled: false },
	integrations: [sitemap()],
	vite: {
		// Tailwind v4 runs as a Vite plugin (no tailwind.config.js).
		plugins: [tailwindcss()],
	},
});
