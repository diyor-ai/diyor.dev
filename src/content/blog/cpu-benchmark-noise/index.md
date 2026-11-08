---
title: "Why my first CPU benchmark was too noisy to use, and how I fixed it"
description: "How I turned an uncontrolled laptop benchmark into repeatable INT8 vs FP32 measurements: fixed clock, pinned cores, cooldown and a stability rule."
date: 2026-11-05
draft: false
# cover: ./cover.jpg
# coverAlt: Describe the image for screen readers
---
My first benchmark numbers looked reasonable, until I ran the same thing twice and got different answers. This post is about how I found out why, and what I changed before trusting any number.

All numbers come from the repo's README (including its "First attempt (archived)" section) and `results/archive_summary.json` in [cpu-inference-bench](https://github.com/diyor-ai/cpu-inference-bench).

## The first attempt was invalid

I started by running ResNet-18 on PyTorch, ONNX Runtime and OpenVINO with default settings on a laptop CPU (Intel i7-12650H). To check repeatability I ran each configuration twice. In 12 of 18 repeated rows, the two identical runs differed by more than 5%, up to 48.27% for one row (PyTorch, 12 threads, batch 1). The results were not usable as a comparison, so I archived them.

A laptop has package power and thermal limits, so the clock changes during a run. Without control over that, a difference of a few percent between frameworks would be within the noise.

## Finding the cause

The first attempt used default frequency scaling, so the clock was free to move. This CPU has a sustained package power limit of 45 W and a short-term limit of 115 W, and power and thermal limits like these can change the clock during a run. Background services and other processes sharing the cores can add noise as well.

The data from that attempt is archived locally and is not in the public repo, so I can't show its per-run frequencies or temperatures here. Instead of guessing which factor dominated, I changed the setup so that each one is either controlled or visible: every repeat now records the package temperature, the mean and minimum P-core frequency, and the kernel's thermal-throttle counters.

## A pilot that was still not enough

I capped the P-cores at 3000 MHz and ran a small pilot. Two of four rows still raised the kernel's thermal-throttle counters, so I chose 2600 MHz as a clock the cores could sustain.

## What I changed

All reported runs use:

- a fixed 2600 MHz clock on the 6 P-cores, with SMT siblings offline, a sustained clock the cores can hold rather than the peak clock;
- pinned cores, AC power and background services stopped;
- a cooldown wait until the package temperature is below 60 °C before every repeat;
- interleaved rounds, so drift affects all frameworks equally;
- a stability rule: a row is stable only if its spread over 5 repeats is below 5% and no thermal-throttle counter increased.

Speedup ratios are printed only between two stable rows. Unstable rows are shown and marked, not dropped.

## What this gave me

With these controls, ResNet-18 INT8 vs FP32 at batch 1 came out at 2.34× (PyTorch), 2.74× (ONNX Runtime) and 3.48× (OpenVINO, 2.6 ms). Five of 36 BERT rows and 2 of 18 ResNet rows (both FP32) were still unstable, and the README says so.

## What it does not show

Thermal counters do not detect power-limit throttling, so I also checked the frequency columns. A VPN client was running during all runs and I did not measure its effect. This is one laptop and one campaign.

## What I took from it

- Run the same configuration twice before comparing anything.
- Report unstable results instead of hiding them.
- Write down what you did not control (here: power limits, VPN).

The code was written with Claude Code; the methodology, decisions and verification are mine.
