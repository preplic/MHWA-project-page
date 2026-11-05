"use strict";
const config = window.MHWA_CONFIG || {};
let heroVersion = "";

function resource(id, url, label) {
  if (!url) return;
  const old = document.getElementById(id);
  const link = document.createElement("a");
  link.id = id;
  link.className = old.className.replace(/\bdisabled\b/g, "").trim();
  link.textContent = label + " ↗";
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  old.replaceWith(link);
}
resource("arxiv-link", config.paperUrl, "arXiv");
resource("code-link", config.codeUrl, "Code");
if (config.contactEmail) document.getElementById("contact-link").href = "mailto:" + config.contactEmail;
if (config.projectUrl) {
  const image = document.querySelector('meta[property="og:image"]');
  image.content = new URL("assets/social.png", config.projectUrl.replace(/\/?$/, "/")).href;
  const canonical = document.createElement("link");
  canonical.rel = "canonical";
  canonical.href = config.projectUrl;
  document.head.append(canonical);
}
if (config.arxivId) {
  document.getElementById("bibtex").textContent = `@misc{pan2026mhwa,
  title = {MHWA: Multi-timescale Hierarchical World-Action Model},
  author = {Pan, Pengcheng and Ma, Guoqing and Zhang, Yuhan
            and Chen, Yang and Liu, Yichen and Li, Ziheng and Yu, Shan},
  year = {2026},
  eprint = {${config.arxivId}},
  archivePrefix = {arXiv}
}`;
}

const player = document.getElementById("hero-video");
const playback = document.getElementById("hero-playback");
const status = document.getElementById("hero-status");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const previewDescription = status.textContent;
playback.hidden = false;

function syncPlayback() {
  playback.textContent = player.paused ? "Play preview" : "Pause preview";
  playback.setAttribute("aria-label", player.paused ? "Play gameplay preview" : "Pause gameplay preview");
}

async function playPreview() {
  try {
    await player.play();
    status.textContent = previewDescription;
  } catch (_) {
    status.textContent = "Select Play preview to start, or open the video directly.";
  }
  syncPlayback();
}

playback.addEventListener("click", () => {
  if (player.paused) playPreview();
  else player.pause();
});
player.addEventListener("play", syncPlayback);
player.addEventListener("pause", syncPlayback);
player.addEventListener("error", () => {
  status.textContent = "Preview unavailable. Use Open video to view or download the recording.";
});
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) player.pause();
});
if (!reducedMotion.matches) playPreview();

async function refreshHero() {
  try {
    const response = await fetch("assets/hero.json", { cache: "no-store" });
    if (!response.ok) return;
    const hero = await response.json();
    if (hero.version === heroVersion) return;
    const updated = Boolean(heroVersion);
    heroVersion = hero.version;
    document.getElementById("hero-coverage").textContent = hero.recordings + " games · 4 screens";
    document.getElementById("hero-download").href = hero.video;
    player.poster = hero.poster;
    if (updated) {
      const resume = !player.paused;
      player.src = hero.video + "?v=" + hero.version;
      if (resume && !reducedMotion.matches) playPreview();
    }
  } catch (_) {
    // Metadata is optional; the video source is available in the HTML.
  }
}
if (location.protocol === "http:" || location.protocol === "https:") {
  refreshHero();
  window.setInterval(refreshHero, 60000);
}

document.getElementById("copy-citation").addEventListener("click", async () => {
  const text = document.getElementById("bibtex").textContent;
  try {
    await navigator.clipboard.writeText(text);
    document.getElementById("copy-status").textContent = "Copied to clipboard.";
  } catch (_) {
    const input = document.createElement("textarea");
    input.value = text;
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.append(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    if (copied) {
      document.getElementById("copy-status").textContent = "Copied to clipboard.";
      return;
    }
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.getElementById("bibtex"));
    selection.removeAllRanges();
    selection.addRange(range);
    document.getElementById("copy-status").textContent = "Citation selected. Copy using your keyboard.";
  }
});
