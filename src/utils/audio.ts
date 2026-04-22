/**
 * Wait for audio metadata + fonts before starting playback, so the first
 * lyric frame isn't a FOUC flash.
 */
export async function waitForReady(audio: HTMLAudioElement): Promise<void> {
  const audioReady = new Promise<void>((resolve) => {
    if (audio.readyState >= 2) return resolve();
    audio.addEventListener('loadeddata', () => resolve(), { once: true });
  });
  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  await Promise.all([audioReady, fontsReady]);
}
