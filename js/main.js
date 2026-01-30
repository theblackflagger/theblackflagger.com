// --- SECURE EMAIL DECODING ---
// We build the email in JS so static HTML scrapers don't see it
document.addEventListener("DOMContentLoaded", () => {
	const link = document.getElementById("secure-contact");
	const text = document.getElementById("secure-text");

	// Parts of the email split up to confuse simple bots
	const part1 = "pirate";
	const part2 = "theblackflagger.com";
	const fullAddress = part1 + "@" + part2;

	// Inject back into DOM
	link.href = "mailto:" + fullAddress;
	text.textContent = fullAddress;
});

document.getElementById("year").textContent =
	new Date().getFullYear();

// --- TEXT EFFECT ---
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
const quoteElement = document.querySelector(".quote");

function runTextEffect() {
	const originalText = quoteElement.dataset.value;
	let iterations = 0;
	const interval = setInterval(() => {
		quoteElement.innerText = originalText
			.split("")
			.map((l, i) => {
				if (i < iterations) return originalText[i];
				if (l === "\u{1F3F4}" || l === "\u2620" || l === "\uFE0F") return l;
				return letters[
					Math.floor(Math.random() * letters.length)
				];
			})
			.join("");
		if (iterations >= originalText.length)
			clearInterval(interval);
		iterations += 1 / 3;
	}, 30);
}
setTimeout(runTextEffect, 800);

// --- FLAG PHYSICS ---
const canvas = document.getElementById("flag");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;
const W = 400,
	H = 300;
canvas.width = W * dpr;
canvas.height = H * dpr;
canvas.style.width = W + "px";
canvas.style.height = H + "px";
ctx.scale(dpr, dpr);

const FLAG_X = 60,
	FLAG_Y = 30,
	FLAG_W = 280,
	FLAG_H = 180,
	COLS = 45,
	ROWS = 28;
let time = 0,
	waveOffset = 0,
	mouseX = 0,
	isCommandPressed = false;

let currentSpeed = 0.08;
let currentAmp = 8;

window.addEventListener(
	"mousemove",
	(e) => (mouseX = (e.clientX / window.innerWidth) * 2 - 1),
);
document.addEventListener("keydown", (e) => {
	if (e.key === "Meta" || e.key === "Control")
		isCommandPressed = true;
});
document.addEventListener("keyup", (e) => {
	if (e.key === "Meta" || e.key === "Control")
		isCommandPressed = false;
});

function getWave(col, row, offset, ampMultiplier) {
	const freq = 0.15;
	const distFromPole = col / COLS;
	const wave1 =
		Math.sin(col * freq - offset) *
		ampMultiplier *
		distFromPole;
	const wave2 =
		Math.sin(col * freq * 2 - offset * 0.5) *
		(ampMultiplier * 0.2) *
		distFromPole;
	return wave1 + wave2;
}

function render() {
	const targetSpeed = isCommandPressed ? 0.18 : 0.08;
	const targetAmp = isCommandPressed ? 12 : 8;

	currentSpeed += (targetSpeed - currentSpeed) * 0.02;
	currentAmp += (targetAmp - currentAmp) * 0.02;
	waveOffset += currentSpeed;
	time += 0.016;

	ctx.clearRect(0, 0, W, H);

	// Draw Pole
	ctx.beginPath();
	ctx.moveTo(FLAG_X, FLAG_Y - 10);
	ctx.lineTo(FLAG_X, FLAG_Y + FLAG_H + 40);
	ctx.strokeStyle = "#1a1a1a";
	ctx.lineWidth = 3;
	ctx.stroke();

	// Generate Grid
	const grid = [];
	for (let r = 0; r <= ROWS; r++) {
		grid[r] = [];
		for (let c = 0; c <= COLS; c++) {
			const wave = getWave(c, r, waveOffset, currentAmp);
			grid[r][c] = {
				x: FLAG_X + c * (FLAG_W / COLS),
				y: FLAG_Y + r * (FLAG_H / ROWS) + wave,
			};
		}
	}

	// Draw Mesh
	for (let r = 0; r < ROWS; r++) {
		for (let c = 0; c < COLS; c++) {
			const tl = grid[r][c],
				tr = grid[r][c + 1],
				br = grid[r + 1][c + 1],
				bl = grid[r + 1][c];
			const dx = tr.y - tl.y;
			// Simple lighting
			const shade = Math.max(0, Math.min(1, 0.5 + dx * 0.04));
			const b = 8 + shade * 15;
			ctx.fillStyle = `rgb(${b},${b},${b})`;
			ctx.beginPath();
			ctx.moveTo(tl.x, tl.y);
			ctx.lineTo(tr.x, tr.y);
			ctx.lineTo(br.x, br.y);
			ctx.lineTo(bl.x, bl.y);
			ctx.fill();
		}
	}

	// Draw Icon (⌘)
	const cp = grid[Math.floor(ROWS / 2)][Math.floor(COLS / 2)];
	const pL = grid[Math.floor(ROWS / 2)][Math.floor(COLS / 2) - 2],
		pR = grid[Math.floor(ROWS / 2)][Math.floor(COLS / 2) + 2];
	ctx.save();
	ctx.translate(cp.x, cp.y);
	ctx.rotate(Math.atan2(pR.y - pL.y, pR.x - pL.x));
	ctx.fillStyle = "rgba(232, 232, 232, 0.8)";
	ctx.font = "500 70px sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("⌘", 0, 5);
	ctx.restore();

	requestAnimationFrame(render);
}
render();
