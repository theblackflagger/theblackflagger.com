// Build the contact email at runtime so the plaintext address never appears in
// the served HTML — protecting it from simple scrapers.
//
// The address is base64-encoded (atob is a runtime call the bundler can't
// constant-fold), so even after Astro inlines + minifies this script the output
// only ever contains the encoded string, never the decoded address. A plain
// "user" + "@" + "domain" concatenation would be folded to the literal at build
// time and defeat the point.
function revealSecureEmail() {
	const link = document.getElementById("secure-contact");
	const text = document.getElementById("secure-text");
	if (!link || !text) return;

	// Decoded to the contact address at runtime (kept out of source as plaintext).
	const address = atob("cGlyYXRlQHRoZWJsYWNrZmxhZ2dlci5jb20=");

	link.setAttribute("href", "mailto:" + address);
	text.textContent = address;
}

// Astro `<script>` tags are deferred modules, so the DOM is usually ready by the
// time this runs — but guard both timing cases to be safe.
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", revealSecureEmail);
} else {
	revealSecureEmail();
}
