type DesktopCaptureResult = {
  dataUrl?: string;
  error?: string;
};

type AchievementMakerDesktopApi = {
  isDesktop: true;
  captureScreen: () => Promise<DesktopCaptureResult>;
  onGlobalCapture: (
    callback: (result: DesktopCaptureResult) => void,
  ) => () => void;
};

interface Window {
  achievementMakerDesktop?: AchievementMakerDesktopApi;
}
