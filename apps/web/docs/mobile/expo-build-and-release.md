# Mobile — Expo Build and Release

Last updated: 2025-09-04

## Purpose
Guide mobile builds for iOS and Android with Expo.

## Who should read this
Mobile developers and release managers.

## Local dev vs EAS
- Local dev: `pnpm --filter mobile start`
- EAS build: cloud builds for iOS/Android

## Build steps (summary)
1) Install deps: `pnpm install`
2) Login to Expo/EAS
3) `eas build --platform ios`
4) `eas build --platform android`

## Environment handling
Do not paste real secrets here.
```
# Do not paste real secrets here
EXPO_PUBLIC_API_URL=https://***redacted***/api
```

## Deep links and push
- Deep link scheme: `nexa://...`
- Push: request permission and handle tokens (masked in logs)

## Store assets
- Screenshots
- Privacy labels
- App icon and splash



