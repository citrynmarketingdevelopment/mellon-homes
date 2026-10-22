import clip from "../../public/videos/mellon-scrub.json";

const lastFrame = clip.frameCount - 1;
const neutralTime = clip.neutralFrame / clip.fps;
const endTime = lastFrame / clip.fps;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Paused-video seeking: a continuous playhead, one outstanding seek, no crossfade. */
export function createVideoMascot(hero: HTMLElement, host: HTMLElement, artwork: HTMLElement) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });
  const video = document.createElement("video");
  const abort = new AbortController();
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  let poster: ImageBitmap | null = null;
  let objectUrl: string | null = null;
  let alive = true;
  let failed = false;
  let visible = true;
  let videoRequested = false;
  let videoLoaded = false;
  let initialized = false;
  let pendingFrame: number | null = null;
  let decodedFrame = -1;
  let frame = 0;
  let lastTick = 0;
  let current = neutralTime;
  let target = neutralTime;
  let pointerX: number | null = null;
  let loadTimer: ReturnType<typeof setTimeout> | undefined;
  let seekTimer: ReturnType<typeof setTimeout> | undefined;
  let width = 0;
  let height = 0;
  let imageX = 0;
  let imageY = 0;
  let scale = 1;

  const staticOnly = () => motion.matches || Boolean(saveData);
  const active = () => alive && !failed && visible && !document.hidden && !staticOnly();
  const idle = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    host.dataset.scrubMotion = "idle";
  };
  const reportFrame = (index: number) => {
    host.dataset.scrubFrame = String(index);
    host.dataset.scrubTime = (index / clip.fps).toFixed(3);
  };
  const metrics = () => {
    const bounds = hero.getBoundingClientRect();
    const art = artwork.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(3_000_000 / (width * height)));
    canvas.width = Math.ceil(width * ratio);
    canvas.height = Math.ceil(height * ratio);
    const mobile = window.innerWidth < 768;
    scale = art.width / (window.innerWidth < 901 ? 720 : 640);
    imageX = mobile
      ? width / 2 - 616 * scale
      : art.left - bounds.left + art.width * .55 - 616 * scale;
    imageY = art.top - bounds.top - (mobile ? 0 : 60 * scale);
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const draw = (source: CanvasImageSource | null) => {
    if (!context || !source || !alive || failed) return;
    const w = clip.width * scale;
    const h = clip.height * scale;
    context.fillStyle = "#e7a2ac";
    context.fillRect(0, 0, width, height);
    // Preserve the enlarged framing and extend only the empty pink studio edges.
    if (imageY > 0) context.drawImage(source, 0, 0, clip.width, 1, imageX, 0, w, imageY + 1);
    const bottom = imageY + h;
    if (bottom < height) context.drawImage(source, 0, clip.height - 1, clip.width, 1, imageX, bottom - 1, w, height - bottom + 1);
    if (imageX > 0) context.drawImage(source, 0, 0, 1, clip.height, 0, imageY, imageX + 1, h);
    if (imageX + w < width) context.drawImage(source, clip.width - 1, 0, 1, clip.height, imageX + w - 1, imageY, width - imageX - w + 1, h);
    context.drawImage(source, imageX, imageY, w, h);
    canvas.style.opacity = "1";
    host.dataset.renderer = "video";
  };
  const drawCurrent = () => draw(initialized && active() && video.readyState >= 2 ? video : poster);
  const fallback = () => {
    if (!alive || failed) return;
    failed = true;
    idle();
    clearTimeout(loadTimer);
    clearTimeout(seekTimer);
    abort.abort();
    video.pause();
    video.removeAttribute("src");
    video.load();
    canvas.style.opacity = "0";
    host.dataset.renderer = "logo";
    host.dataset.videoStatus = "fallback";
  };
  const watchSeek = () => {
    clearTimeout(seekTimer);
    if (pendingFrame !== null && active()) seekTimer = setTimeout(fallback, 5000);
  };
  const seek = (index: number) => {
    if (!active() || !videoLoaded || pendingFrame !== null || video.seeking || decodedFrame === index) return;
    pendingFrame = index;
    watchSeek();
    // The tiny offset stays inside the desired frame, avoiding boundary rounding.
    try { video.currentTime = index / clip.fps + .001; }
    catch { fallback(); }
  };
  const tick = (now: number) => {
    frame = 0;
    if (!active() || !initialized) { idle(); return; }
    const delta = Math.min((now - lastTick) / 1000 || 1 / 60, .05);
    lastTick = now;
    // Frame-rate-independent easing, with a speed limit for large pointer jumps.
    const step = (target - current) * (1 - Math.exp(-12 * delta));
    current += clamp(step, -5.5 * delta, 5.5 * delta);
    if (Math.abs(target - current) < 1 / (clip.fps * 4)) current = target;
    const index = clamp(Math.round(current * clip.fps), 0, lastFrame);
    seek(index);
    if (current !== target || pendingFrame !== null || decodedFrame !== index) {
      host.dataset.scrubMotion = "moving";
      frame = requestAnimationFrame(tick);
    } else idle();
  };
  const wake = () => {
    if (!active() || !initialized || frame) return;
    lastTick = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const setProgress = (progress: number) => {
    if (staticOnly() || !visible || document.hidden || failed) return;
    const x = clamp(progress, 0, 1);
    // The source's forward-facing moment is not halfway through the clip.
    // Calibrate both halves so the hero center always selects that neutral frame.
    target = x <= .5
      ? x * 2 * neutralTime
      : neutralTime + (x - .5) * 2 * (endTime - neutralTime);
    host.dataset.scrubTarget = target.toFixed(3);
    wake();
  };
  const point = (clientX: number) => {
    pointerX = clientX;
    const bounds = hero.getBoundingClientRect();
    setProgress((clientX - bounds.left) / bounds.width);
  };
  const look = (x: number) => {
    pointerX = null;
    setProgress((x + 1) / 2);
  };
  const reset = (immediate = false) => {
    pointerX = null;
    target = neutralTime;
    host.dataset.scrubTarget = target.toFixed(3);
    if (immediate || !active()) {
      idle();
      current = neutralTime;
      draw(poster);
      reportFrame(clip.neutralFrame);
      clearTimeout(seekTimer);
      if (active()) {
        seek(clip.neutralFrame);
        watchSeek();
        wake();
      }
    } else wake();
  };
  const seeked = () => {
    if (!alive || failed || pendingFrame === null) return;
    decodedFrame = pendingFrame;
    pendingFrame = null;
    clearTimeout(seekTimer);
    clearTimeout(loadTimer);
    initialized = true;
    host.dataset.videoStatus = staticOnly() ? "static" : "ready";
    if (active()) {
      draw(video);
      reportFrame(decodedFrame);
      wake();
    } else idle();
  };
  const loaded = () => {
    if (!alive || failed || videoLoaded) return;
    if (!Number.isFinite(video.duration) || video.duration <= endTime + .001) { fallback(); return; }
    videoLoaded = true;
    if (active()) seek(clip.neutralFrame);
    else clearTimeout(loadTimer);
  };
  async function loadVideo() {
    if (videoRequested || !alive || failed || staticOnly()) return;
    videoRequested = true;
    host.dataset.videoStatus = "loading";
    loadTimer = setTimeout(fallback, 20_000);
    try {
      // Buffer this small clip fully before scrubbing to avoid network range stalls.
      const response = await fetch(clip.video, { signal: abort.signal });
      if (!response.ok) throw new Error("Video unavailable");
      const blob = await response.blob();
      if (!alive || failed) return;
      objectUrl = URL.createObjectURL(blob);
      video.src = objectUrl;
      video.load();
    } catch { fallback(); }
  }
  const resume = () => {
    if (!active()) return;
    if (videoLoaded) {
      seek(clip.neutralFrame);
      watchSeek();
      if (initialized) {
        host.dataset.videoStatus = "ready";
        drawCurrent();
        wake();
      }
    } else void loadVideo();
  };
  const visibility = () => {
    if (document.hidden) reset(true);
    else resume();
  };
  const preferences = () => {
    reset(true);
    if (staticOnly()) host.dataset.videoStatus = failed ? "fallback" : "static";
    else resume();
  };
  const resize = new ResizeObserver(() => {
    metrics();
    drawCurrent();
    if (pointerX !== null) point(pointerX);
  });
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) reset(true);
    else resume();
  });

  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.videoMascot = "";
  Object.assign(canvas.style, {
    position: "absolute", inset: "0", width: "100%", height: "100%",
    zIndex: "0", pointerEvents: "none", opacity: "0",
  });
  video.dataset.scrubSource = "";
  video.setAttribute("aria-hidden", "true");
  video.style.display = "none";
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.autoplay = false;
  video.loop = false;
  video.disablePictureInPicture = true;
  video.addEventListener("loadeddata", loaded);
  video.addEventListener("seeked", seeked);
  video.addEventListener("error", fallback);
  hero.prepend(canvas, video);
  host.dataset.videoStatus = "loading";
  host.dataset.scrubMotion = "idle";
  host.dataset.scrubTarget = neutralTime.toFixed(3);
  metrics();
  resize.observe(hero);
  resize.observe(artwork);
  intersection.observe(hero);
  document.addEventListener("visibilitychange", visibility);
  motion.addEventListener("change", preferences);

  async function loadPoster() {
    try {
      if (!context || !window.createImageBitmap) throw new Error("Canvas unavailable");
      const response = await fetch(clip.poster, { signal: abort.signal });
      if (!response.ok) throw new Error("Poster unavailable");
      const bitmap = await createImageBitmap(await response.blob());
      if (!alive || failed) { bitmap.close(); return; }
      poster = bitmap;
      if (!initialized) {
        draw(poster);
        reportFrame(clip.neutralFrame);
      }
      if (staticOnly()) host.dataset.videoStatus = "static";
    } catch { fallback(); }
  }
  if (!context) fallback();
  else {
    void loadPoster();
    void loadVideo();
  }

  return {
    point, look, reset,
    get ready() { return initialized && !failed; },
    dispose() {
      alive = false;
      idle();
      abort.abort();
      clearTimeout(loadTimer);
      clearTimeout(seekTimer);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", preferences);
      video.removeEventListener("loadeddata", loaded);
      video.removeEventListener("seeked", seeked);
      video.removeEventListener("error", fallback);
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      poster?.close();
      video.remove();
      canvas.remove();
      host.dataset.renderer = "logo";
    },
  };
}
