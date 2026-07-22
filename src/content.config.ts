import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Apps collection — one markdown file per app under src/content/apps/.
// Images live outside the schema by convention: public/apps/<slug>/icon.png and
// public/apps/<slug>/screenshotN.{jpg,png,webp} (resolved via getScreenshots).
const apps = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/apps" }),
	schema: z.object({
		title: z.string(),
		subtitle: z.string(),
		pubDate: z.coerce.date(),
		platforms: z.array(
			z.enum([
				"macOS",
				"iOS",
				"watchOS",
				"visionOS",
				"tvOS",
				"Linux",
				"Windows",
			]),
		),
		// Where the app is distributed. Each entry couples a store type with its
		// URL so the detail page auto-renders the right widget: the official Apple
		// / Setapp badges for those stores, a styled button for Gumroad or a direct
		// download. Multiple entries → multiple buttons. To support a new channel,
		// add a type here and a matching case in getDownloadOptions (lib/apps.ts).
		stores: z
			.array(
				z.object({
					type: z.enum(["app-store", "setapp", "gumroad", "direct"]),
					url: z.string().url(),
				}),
			)
			.default([]),
		isPaid: z.boolean().default(false),
		// Secondary text links shown under the download buttons: label -> URL
		// (e.g. Source, Docs, Changelog). Primary download actions come from
		// `stores`, not here.
		links: z.record(z.string(), z.string().url()).optional(),
		// The app's own domain. Present → the gallery card links out and the hub
		// generates NO inline page for it (two pages about one app would compete
		// with each other in search). Absent → the app renders inline at /<slug>.
		website: z.string().url().optional(),
		// Support channel shown at the bottom of an inline app page. Required for
		// anything submitted to the App Store, which demands a Support URL. Apps
		// with their own `website` handle this on their own site.
		support: z
			.object({
				email: z.string().email(),
				issues: z.string().url().optional(),
			})
			.optional(),
		faq: z
			.array(z.object({ q: z.string(), a: z.string() }))
			.optional(),
		featured: z.boolean().default(false),
		// Teaser entry: shows in the gallery as a non-clickable "Coming soon"
		// card (monogram placeholder, no icon/detail page required).
		comingSoon: z.boolean().default(false),
		// Visibility flags: archived + unlisted are hidden from the gallery;
		// draft is excluded from the build entirely.
		isArchived: z.boolean().default(false),
		isUnlisted: z.boolean().default(false),
		draft: z.boolean().default(false),
	}),
});

// Privacy collection — one markdown file per app, served at /<slug>/privacy.
// The entry id is the app slug, so content/privacy/foo.md pairs with
// content/apps/foo.md. Only apps rendered inline here need one: an app with its
// own `website` publishes its policy on its own site.
const privacy = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/privacy" }),
	schema: z.object({
		// Defaults to "<App> Privacy Policy" when omitted.
		title: z.string().optional(),
		// Shown as "Last updated" — a privacy policy without a date is not one.
		updated: z.coerce.date(),
	}),
});

// Blog collection — one markdown file per post under src/content/blog/. The
// entry id (filename sans extension) is the URL slug at /blog/<slug>.
const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		pubDate: z.coerce.date(),
		description: z.string(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
		heroImage: z.string().optional(),
	}),
});

export const collections = { apps, privacy, blog };
