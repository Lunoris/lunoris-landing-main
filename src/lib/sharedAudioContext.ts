"use client";

const MAX_DECODED_BUFFERS = 12;

let sharedAudioCtx: AudioContext | null = null;
const decodedBufferCache = new Map<string, AudioBuffer>();
const inflightDecodes = new Map<string, Promise<AudioBuffer | null>>();

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AudioCtx) {
      try {
        sharedAudioCtx = new AudioCtx();
      } catch {
        sharedAudioCtx = null;
      }
    }
  }
  return sharedAudioCtx;
}

export function resumeSharedAudioContext(): AudioContext | null {
  const ctx = getSharedAudioContext();
  if (ctx && ctx.state === "suspended") {
    void ctx.resume().catch(() => {});
  }
  return ctx;
}

export function getCachedDecodedAudioBuffer(url: string): AudioBuffer | null {
  const existing = decodedBufferCache.get(url);
  if (!existing) return null;
  // Refresh LRU position
  decodedBufferCache.delete(url);
  decodedBufferCache.set(url, existing);
  return existing;
}

function setCachedDecodedAudioBuffer(url: string, buffer: AudioBuffer): void {
  if (decodedBufferCache.has(url)) {
    decodedBufferCache.delete(url);
  } else if (decodedBufferCache.size >= MAX_DECODED_BUFFERS) {
    const oldestKey = decodedBufferCache.keys().next().value;
    if (typeof oldestKey === "string") {
      decodedBufferCache.delete(oldestKey);
    }
  }
  decodedBufferCache.set(url, buffer);
}

export function preloadDecodedAudioBuffer(
  url: string
): Promise<AudioBuffer | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }
  const cached = getCachedDecodedAudioBuffer(url);
  if (cached) {
    return Promise.resolve(cached);
  }
  const pending = inflightDecodes.get(url);
  if (pending) {
    return pending;
  }

  const ctx = getSharedAudioContext();
  if (!ctx) {
    return Promise.resolve(null);
  }

  const task = (async (): Promise<AudioBuffer | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arr.slice(0));
      setCachedDecodedAudioBuffer(url, decoded);
      return decoded;
    } catch {
      return null;
    } finally {
      inflightDecodes.delete(url);
    }
  })();

  inflightDecodes.set(url, task);
  return task;
}

export function playBufferedOrHtmlAudio(url: string, volume = 0.8): void {
  if (typeof window === "undefined") return;
  const clampedVolume = Math.min(1, Math.max(0, volume));
  const ctx = resumeSharedAudioContext();
  const buffer = getCachedDecodedAudioBuffer(url);

  if (ctx && buffer) {
    try {
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      gain.gain.value = clampedVolume;
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
      return;
    } catch {
      // Fallback to HTMLAudioElement below
    }
  }

  try {
    const audio = new Audio(url);
    audio.volume = clampedVolume;
    void audio.play().catch(() => {});
  } catch {
    // Ignore autoplay restriction
  }
}
