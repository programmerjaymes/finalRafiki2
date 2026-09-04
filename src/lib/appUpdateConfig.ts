/**
 * Mobile app update metadata.
 * Bump these values whenever you ship a new APK to public/downloads/.
 *
 * versionName  — matches pubspec `x.y.z` (before the +)
 * versionCode  — matches pubspec build number (after the +), e.g. 1.0.1+3 → 3
 * downloadUrl  — absolute HTTPS URL to the APK (or Play Store listing)
 * forceUpdate  — if true, users cannot dismiss the dialog
 */
export const appUpdateConfig = {
  platform: 'android' as const,
  versionName: '1.0.2',
  versionCode: 4,
  downloadUrl: 'https://rafikinisisi.com/downloads/rafiki-app-release.apk',
  forceUpdate: false,
  releaseNotesEn:
    'Install fix: improved APK signing for more Android phones, plus update prompts.',
  releaseNotesSw:
    'Marekebisho ya usakinishaji: saini bora ya APK kwa simu nyingi, pamoja na arifa za sasisho.',
};

export type AppUpdateConfig = typeof appUpdateConfig;
