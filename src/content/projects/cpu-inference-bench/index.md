---
title: CPU Inference Benchmark
summary: PyTorch, ONNX Runtime and OpenVINO on one laptop CPU, FP32 vs INT8, with a controlled measurement method.
order: 1
stats: [["3.48×", "ResNet-18 INT8 vs FP32, OpenVINO"], ["2.6 ms", "OpenVINO INT8, batch 1"]]
tags: [PyTorch, ONNX Runtime, OpenVINO, NNCF]
repo: https://github.com/diyor-ai/cpu-inference-bench
---
## Problem
Framework comparisons on a laptop CPU are easy to get wrong: power and thermal limits move the clock during a run. I wanted INT8 vs FP32 numbers for PyTorch, ONNX Runtime and OpenVINO that I could trust and reproduce.

## What I did
Benchmarked ResNet-18 and two small SST-2 BERT-family models (DistilBERT and BERT-mini) on an Intel i7-12650H, using only the 6 P-cores pinned at a fixed 2.6 GHz. I applied INT8 post-training quantization (static and dynamic) with ONNX Runtime, OpenVINO NNCF and PyTorch, and profiled with `torch.profiler`, ONNX Runtime profiling and OpenVINO `PERF_COUNT`. The scope is inference, quantization and profiling, not training.

## Method
My first, uncontrolled attempt was invalid: 12 of 18 repeated rows differed by more than 5% between two identical runs. A pilot at 3000 MHz still raised thermal-throttle counters in 2 of 4 rows. The reported runs use a fixed clock, pinned cores, a cooldown before every repeat and a stability rule: a row counts as stable only if its spread is below 5% and no throttle counter increased. Ratios are printed only between stable rows. Accuracy changes use a paired bootstrap and the McNemar test, with a Bonferroni correction for the BERT comparisons.

## Results
- ResNet-18, INT8 vs FP32 at batch 1: PyTorch **2.34×**, ONNX Runtime **2.74×**, OpenVINO **3.48×**. OpenVINO INT8 reaches **2.6 ms** per image.
- ResNet-18 top-1 change: −0.6 to −0.9 points, not statistically significant on 1000 images.
- DistilBERT and BERT-mini (SST-2): INT8 was **1.10–3.12×** faster. Accuracy differences are not significant after Bonferroni correction.

## Limitations
- Each framework's standard INT8 path is compared, not identical quantization. In BERT, for example, OpenVINO also quantizes the attention MatMuls.
- I did not verify the cause of the speedup (for example VNNI). Kernel names do not settle it.
- One laptop, one CPU, 2.6 GHz sustained rather than peak clock. ResNet-18 accuracy uses a 1000-image sample.
- A VPN client was running during all runs; its effect was not measured.

## AI assistance
Code written with Claude Code; methodology, decisions and verification are mine.
