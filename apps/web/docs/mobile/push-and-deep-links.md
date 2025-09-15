# Mobile — Push and Deep Links

Last updated: 2025-09-04

## Purpose
Explain push permissions and deep link testing.

## Who should read this
Mobile developers and QA.

## Push permissions flow
1) Ask permission on first use.
2) Handle denial gracefully.
3) Mask tokens in logs: `***redacted***`.

## Deep link structure
```
nexa://feature/path?param=xxx
```

## Testing
- iOS: `xcrun simctl openurl booted "nexa://feature/path"`
- Android: `adb shell am start -W -a android.intent.action.VIEW -d "nexa://feature/path"`

## Troubleshooting
- App not opening: check scheme and manifest settings.
- Query params ignored: log received URL and parse safely.



