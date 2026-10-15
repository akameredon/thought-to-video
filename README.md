# Thought to Video

A separate mobile-first progressive web app for turning rough thoughts into short talking-head videos.

## Current starter capabilities
- Drafts saved locally in the browser
- Script shaping with selectable tone (template-based, not an AI model yet)
- Social caption draft and copy-to-clipboard
- Voice dictation where supported; iPhone keyboard dictation as fallback
- Camera and microphone preview with front/back camera switching
- Adjustable teleprompter
- Browser video recording, preview and save/download link
- PWA manifest and service worker for install/offline app shell

## Important limitations
- Real AI script generation requires a server-side provider integration and a secret API key. Never put an AI API key in client-side JavaScript.
- Camera/microphone access requires HTTPS and explicit browser permission.
- Recording formats and save behavior vary by browser and iOS version. Test on the target iPhone before relying on recordings.
- On iPhone, open the deployed HTTPS site in Safari, tap Share, then choose Add to Home Screen. This is a web app, not an App Store native app.
- Drafts and recordings stay on the device; this starter does not upload them.

## Preview
Use localhost or an HTTPS host because camera and microphone access generally require a secure context. With Node installed, run: npx serve .

## Pre-deployment QA
- [ ] Confirm layout and editing on iPhone Safari
- [ ] Confirm Add to Home Screen and standalone launch
- [ ] Confirm camera/microphone permissions and camera switching
- [ ] Record, stop, preview, and save a short clip
- [ ] Test the available recording format on iOS Safari
- [ ] Confirm offline shell after first successful load
- [ ] Choose an AI provider and usage budget before enabling remote generation
- [ ] Deploy only after device testing passes

## Deployment
Static site; publish the repository root with no build command. HTTPS is required for camera/microphone APIs. Do not deploy as a production AI service until a server-side AI endpoint, rate limits, and secret management are configured and tested.