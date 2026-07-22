import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

/** A distribution channel. `direct` = self-hosted download (no storefront brand). */
export type StoreType = "app-store" | "setapp" | "gumroad" | "direct";

/** One store entry in an app's front matter: a channel plus its URL. */
export interface AppStore {
	type: StoreType;
	url: string;
}

/**
 * Branded store -> human label, shared by cards, detail chips, and filter chips.
 * `direct` is intentionally absent: it's a plain download, not a storefront, so
 * it never renders as a tag/filter (only as a "Download for Free" button).
 */
export const STORE_LABELS: Record<string, string> = {
	"app-store": "App Store",
	setapp: "Setapp",
	gumroad: "Gumroad",
};

/** Store filter chips rendered on the /apps gallery, in display order. */
export const STORE_FILTERS = [
	{ value: "app-store", label: "App Store" },
	{ value: "setapp", label: "Setapp" },
	{ value: "gumroad", label: "Gumroad" },
] as const;

/** A resolved download action: either an official brand badge or a text button. */
export interface DownloadOption {
	type: StoreType;
	url: string;
	kind: "badge" | "button";
	/** Button text, and the accessible label / image alt for a badge. */
	label: string;
	/** Badge image path (only for kind === "badge"). */
	badgeSrc?: string;
}

/**
 * Turn an app's stores into the ordered download widgets shown on its detail
 * page. App Store / Setapp render as the official brand badge; Gumroad / direct
 * render as a styled button whose wording depends on `isPaid`. Badges lead,
 * buttons follow, so primary storefronts sit first as Apple/Setapp expect.
 */
export function getDownloadOptions(
	stores: AppStore[],
	isPaid: boolean,
): DownloadOption[] {
	const options = stores.map((store): DownloadOption => {
		switch (store.type) {
			case "app-store":
				return {
					...store,
					kind: "badge",
					label: "Download on the App Store",
					badgeSrc: "/assets/download-on-app-store-badge.svg",
				};
			case "setapp":
				return {
					...store,
					kind: "badge",
					label: "Download on Setapp",
					badgeSrc: "/assets/download-on-setapp-badge.svg",
				};
			case "gumroad":
				return {
					...store,
					kind: "button",
					label: isPaid ? "Buy on Gumroad" : "Download on Gumroad",
				};
			case "direct":
				return {
					...store,
					kind: "button",
					label: isPaid ? "Download" : "Download for Free",
				};
			default: {
				// Exhaustiveness guard: adding a StoreType without a case fails here.
				const unhandled: never = store.type;
				throw new Error(`Unhandled store type: ${String(unhandled)}`);
			}
		}
	});

	// Badges before buttons; order within each group is preserved (stable sort).
	return options.sort(
		(a, b) => Number(a.kind === "button") - Number(b.kind === "button"),
	);
}

/** A screenshot plus its intrinsic pixel size (read at build). */
export interface Screenshot {
	src: string;
	width: number;
	height: number;
}

/**
 * Screenshots follow the convention
 *   public/apps/<slug>/screenshot1.jpg, screenshot2.jpg, …
 * Resolved from disk at build time (SSG) so they stay out of the schema.
 * Intrinsic dimensions come along so the gallery can set <img width/height>
 * (no layout shift) and feed PhotoSwipe's required data-pswp-width/height.
 * Returns natural-sorted entries with web-root-relative URLs; empty if the
 * folder is absent. A corrupt/unreadable file is skipped, never fatal.
 */
export function getScreenshots(slug: string): Screenshot[] {
	try {
		const dir = path.join(process.cwd(), "public", "apps", slug);
		return readdirSync(dir)
			.filter((f) => /^screenshot\d+\.(jpe?g|png|webp)$/i.test(f))
			.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
			.flatMap((f) => {
				try {
					const { width, height } = imageSize(
						readFileSync(path.join(dir, f)),
					);
					if (!width || !height) return [];
					return [{ src: `/apps/${slug}/${f}`, width, height }];
				} catch {
					return []; // skip unreadable/corrupt file, keep the build alive
				}
			});
	} catch {
		return []; // folder absent
	}
}
