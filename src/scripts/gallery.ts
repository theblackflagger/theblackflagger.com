// App-detail screenshot gallery behavior. Two progressive-enhancement layers on
// top of the static markup in components/apps/AppGallery.astro:
//
//   1. Embla turns the native scroll-snap strip into a draggable carousel with
//      arrows + keyboard. Before init we add `.is-embla` so the viewport becomes
//      overflow:hidden (Embla translates the track). If JS is off or this throws,
//      the strip stays a plain scroll container — nothing is ever stuck.
//   2. PhotoSwipe (fullscreen zoom) is imported ONLY on first thumbnail click, so
//      the page ships ~6KB (Embla) up front and the ~30KB viewer loads on demand.
//
// Mirrors scripts/reveal.ts: guarded, self-healing, reduced-motion aware.
import EmblaCarousel from "embla-carousel";

type Lightbox = InstanceType<typeof import("photoswipe/lightbox").default>;

const SLIDE = ".app-gallery__slide";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll<HTMLElement>("[data-gallery]").forEach((root) => {
	const viewport = root.querySelector<HTMLElement>(".app-gallery__viewport");
	const prev = root.querySelector<HTMLButtonElement>(".app-gallery__prev");
	const next = root.querySelector<HTMLButtonElement>(".app-gallery__next");
	if (!viewport) return;

	try {
		// Flip to overflow:hidden only now that JS is driving the strip.
		root.classList.add("is-embla");
		const embla = EmblaCarousel(viewport, {
			align: "start",
			loop: false,
			dragFree: true,
			duration: reduce ? 0 : 25,
		});

		// Show arrows only when the strip actually overflows; keep bounds state.
		const sync = () => {
			const overflow = embla.canScrollPrev() || embla.canScrollNext();
			if (prev) {
				prev.hidden = !overflow;
				prev.disabled = !embla.canScrollPrev();
			}
			if (next) {
				next.hidden = !overflow;
				next.disabled = !embla.canScrollNext();
			}
		};
		// `init` fires inside the constructor (before this listener attaches), so
		// the manual sync() below covers first paint; only select/reInit matter.
		embla.on("select", sync).on("reInit", sync);
		prev?.addEventListener("click", () => embla.scrollPrev());
		next?.addEventListener("click", () => embla.scrollNext());

		// Keyboard access for the strip itself.
		viewport.tabIndex = 0;
		viewport.setAttribute("aria-label", "Screenshots — use arrow keys to scroll");
		viewport.addEventListener("keydown", (e) => {
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				embla.scrollPrev();
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				embla.scrollNext();
			}
		});
		// Tabbing to an off-screen thumb must bring it into view — Embla moves
		// slides with transforms (viewport is overflow:hidden), which the browser
		// won't auto-scroll to on focus.
		viewport.addEventListener("focusin", (e) => {
			const a = (e.target as HTMLElement).closest<HTMLElement>(SLIDE);
			if (a) {
				embla.scrollTo([...root.querySelectorAll<HTMLElement>(SLIDE)].indexOf(a));
			}
		});
		sync();

		// Lazy lightbox: first genuine click imports + inits PhotoSwipe and opens
		// the clicked image; afterwards PhotoSwipe's own handler owns the clicks.
		let lb: Lightbox | null = null;
		let loading = false;
		root.addEventListener("click", async (e) => {
			const a = (e.target as HTMLElement).closest<HTMLAnchorElement>(SLIDE);
			if (!a) return;
			// Keep native behavior for modified / non-primary clicks (open in tab).
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
			if (lb) return; // PhotoSwipe owns clicks once initialized
			e.preventDefault(); // block native nav for every real slide click
			if (loading) return; // import already in flight — swallow extra clicks
			loading = true;
			try {
				const index = [...root.querySelectorAll<HTMLElement>(SLIDE)].indexOf(a);
				const [{ default: PhotoSwipeLightbox }] = await Promise.all([
					import("photoswipe/lightbox"),
					import("photoswipe/style.css"),
				]);
				const instance = new PhotoSwipeLightbox({
					gallery: root,
					children: SLIDE,
					pswpModule: () => import("photoswipe"),
					showHideAnimationType: reduce ? "none" : "zoom",
				});
				instance.init();
				instance.loadAndOpen(index);
				lb = instance;
			} catch {
				// PhotoSwipe failed to load — nav was already cancelled, so restore
				// the fallback: open the raw full image (honors the anchor intent).
				loading = false;
				window.open(a.href, "_blank", "noopener");
			}
		});
	} catch {
		// Never leave the strip broken — revert to the native scroll container.
		root.classList.remove("is-embla");
	}
});
