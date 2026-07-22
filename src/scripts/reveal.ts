// Elegant, cohesive text-reveal system (GSAP + ScrollTrigger).
// Every element tagged `data-reveal` fades + rises + un-blurs into place:
// above-the-fold ones on load (staggered), below-the-fold ones as they scroll
// into view.
//
// SSG-safety: the <head> guard in BaseLayout adds `.reveal-js` to <html> ONLY
// when motion is allowed. tokens.css hides `[data-reveal]` only under that
// class, so reduced-motion / no-JS visitors see everything immediately (no
// FOUC, nothing ever stuck hidden). If GSAP throws, we unhide as a failsafe.
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;

if (root.classList.contains("reveal-js")) {
	try {
		ScrollTrigger.batch("[data-reveal]", {
			start: "top 88%",
			once: true,
			onEnter: (batch) =>
				gsap.fromTo(
					batch,
					{ opacity: 0, y: 22, filter: "blur(10px)" },
					{
						opacity: 1,
						y: 0,
						filter: "blur(0px)",
						duration: 1,
						ease: "power3.out",
						stagger: 0.09,
						overwrite: true,
					},
				),
		});

		// Re-measure once late assets (icons, screenshots) settle so triggers
		// fire at the right scroll positions.
		window.addEventListener("load", () => ScrollTrigger.refresh());
	} catch {
		// Never leave content hidden — reveal everything if anything fails.
		root.classList.remove("reveal-js");
	}
}
