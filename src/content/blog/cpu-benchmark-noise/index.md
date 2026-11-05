---
title: "Why my first CPU benchmark was too noisy to use, and how I fixed it"
description: "How I turned an uncontrolled laptop benchmark into repeatable INT8 vs FP32 measurements: fixed clock, pinned cores, cooldown and a stability rule."
date: 2026-11-05
draft: true
# cover: ./cover.jpg
# coverAlt: Describe the image for screen readers
---
<!-- TODO(diyor): the brief title said "48% noise". The repo README and results/archive_summary.json only support "12 of 18 repeated rows differed by more than 5%", so this draft uses that. Confirm the 48% figure or keep this wording. -->

All numbers and claims below come from the README of [cpu-inference-bench](https://github.com/diyor-ai/cpu-inference-bench).

## The first attempt was invalid

I started by running ResNet-18 on PyTorch, ONNX Runtime and OpenVINO with default settings on a laptop CPU (Intel i7-12650H). To check repeatability I ran each configuration twice. In 12 of 18 repeated rows, the two identical runs differed by more than 5%. The results were not usable as a comparison, so I archived them.

A laptop has package power and thermal limits, so the clock changes during a run. Without control over that, a 2.3× vs 2.7× speedup could be an artifact of the machine rather than of the framework.

## A pilot that was still not enough

I capped the P-cores at 3000 MHz and ran a small pilot. Two of four rows still raised the kernel's thermal-throttle counters. The cap was too high for a clock the cores could hold.

## What I changed

All reported runs use:

- a fixed 2600 MHz clock on the 6 P-cores, with SMT siblings offline, a sustained clock the cores can hold rather than the peak clock;
- pinned cores, AC power and background services stopped;
- a cooldown wait until the package temperature is below 60 °C before every repeat;
- interleaved rounds, so drift affects all frameworks equally;
- a stability rule: a row is stable only if its spread over 5 repeats is below 5% and no thermal-throttle counter increased.

Speedup ratios are printed only between two stable rows. Unstable rows are shown and marked, not dropped.

## What this gave me

With these controls, ResNet-18 INT8 vs FP32 at batch 1 came out at 2.34× (PyTorch), 2.74× (ONNX Runtime) and 3.48× (OpenVINO, 2.6 ms). Five of 36 BERT rows and 2 of 18 ResNet INT8 rows were still unstable, and the README says so.

## What it does not show

Thermal counters do not detect power-limit throttling, so I also checked the frequency columns. A VPN client was running during all runs and I did not measure its effect. This is one laptop and one campaign. The code was written with Claude Code; the methodology, decisions and verification are mine.
