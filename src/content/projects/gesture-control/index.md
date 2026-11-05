---
title: Gesture Control
summary: Controls the computer with hand gestures through a webcam, using MediaPipe hand tracking and OpenCV.
order: 4
stats: [["29.9 FPS", "camera + tracking, CPU"], ["228", "tests in ~1.6 s"]]
tags: [MediaPipe, OpenCV, Python]
repo: https://github.com/diyor-ai/gesture-control-system
---
## Problem
Control the computer (clicks, scrolling, volume, screenshots) with hand gestures from an ordinary webcam, on CPU only, including on Linux/Wayland where common input libraries do not work.

## What I did
Built a real-time pipeline with MediaPipe hand tracking and OpenCV, plus a gesture engine that debounces poses so detector flicker cannot trigger actions. On Wayland, input is injected through a virtual pointer with `uinput`. The project has CI.

## Method
Frame rate was measured with a benchmark script (real webcam and MediaPipe, no window, no input injection) on a CPU-only machine. Tests run against synthetic hand landmarks, so they need no camera.

## Results
- **29.9 FPS** for camera plus tracking with a hand in view (the camera limit is about 30 FPS), up from 16.5–21.6 FPS with the first settings.
- **228 tests** in about 1.6 s.

## Limitations
- Recognition accuracy is not measured.
- The full application (window, overlay, input injection) was not benchmarked, only camera plus tracking.

## AI assistance
Code written with Claude Code; methodology, decisions and verification are mine.
