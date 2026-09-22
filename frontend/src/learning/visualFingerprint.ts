import type { CapturedFrame } from "./types";

const HASH_SIZE = 8;

export interface DisplayCaptureSession {
  captureFrame: () => Promise<CapturedFrame>;
  stop: () => void;
}

async function loadImage(source: string): Promise<HTMLImageElement> {
  const image = new Image();

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () =>
      reject(new Error("The selected image could not be read."));
    image.src = source;
  });

  return image;
}

export async function fingerprintImage(source: string): Promise<string> {
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = HASH_SIZE;
  canvas.height = HASH_SIZE;
  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    throw new Error("Image processing is unavailable.");
  }

  context.drawImage(image, 0, 0, HASH_SIZE, HASH_SIZE);
  const pixels = context.getImageData(0, 0, HASH_SIZE, HASH_SIZE).data;
  const grayscale: number[] = [];

  for (let index = 0; index < pixels.length; index += 4) {
    grayscale.push(
      pixels[index] * 0.299 +
        pixels[index + 1] * 0.587 +
        pixels[index + 2] * 0.114,
    );
  }

  const average =
    grayscale.reduce((sum, value) => sum + value, 0) / grayscale.length;
  const bits = grayscale
    .map((value) => (value >= average ? "1" : "0"))
    .join("");

  return BigInt(`0b${bits}`).toString(16).padStart(16, "0");
}

export async function frameFromFile(file: File): Promise<CapturedFrame> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  return {
    dataUrl,
    fingerprint: await fingerprintImage(dataUrl),
  };
}

export async function frameFromDataUrl(dataUrl: string): Promise<CapturedFrame> {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1280 / image.naturalWidth);
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Screen capture is unavailable.");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.78);

  return {
    dataUrl: resizedDataUrl,
    fingerprint: await fingerprintImage(resizedDataUrl),
  };
}

export async function captureDisplayFrame(): Promise<CapturedFrame> {
  const session = await startDisplayCapture();

  try {
    return await session.captureFrame();
  } finally {
    session.stop();
  }
}

export async function startDisplayCapture(
  onEnded?: () => void,
): Promise<DisplayCaptureSession> {
  const desktopApi = window.achievementMakerDesktop;

  if (desktopApi) {
    return {
      captureFrame: async () => {
        const result = await desktopApi.captureScreen();
        if (result.error || !result.dataUrl) {
          throw new Error(result.error ?? "Screen capture failed.");
        }
        return frameFromDataUrl(result.dataUrl);
      },
      stop: () => undefined,
    };
  }

  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error(
      "Screen capture requires a supported browser and a secure connection.",
    );
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      frameRate: {
        ideal: 1,
        max: 2,
      },
    },
    audio: false,
  });

  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;

  const metadataReady =
    video.readyState >= HTMLMediaElement.HAVE_METADATA
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          video.addEventListener("loadedmetadata", () => resolve(), {
            once: true,
          });
        });

  try {
    await Promise.all([metadataReady, video.play()]);
  } catch (error) {
    stream.getTracks().forEach((streamTrack) => streamTrack.stop());
    video.srcObject = null;
    throw error;
  }

  const track = stream.getVideoTracks()[0];
  if (onEnded) track?.addEventListener("ended", onEnded);

  const captureFrame = async (): Promise<CapturedFrame> => {
    if (!track || track.readyState === "ended") {
      throw new Error("Screen sharing has ended.");
    }

    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1280 / video.videoWidth);
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Screen capture is unavailable.");
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.78);

    const frame = {
      dataUrl,
      fingerprint: await fingerprintImage(dataUrl),
    };

    return frame;
  };

  return {
    captureFrame,
    stop: () => {
      if (onEnded) track?.removeEventListener("ended", onEnded);
      stream.getTracks().forEach((streamTrack) => streamTrack.stop());
      video.pause();
      video.srcObject = null;
    },
  };
}
