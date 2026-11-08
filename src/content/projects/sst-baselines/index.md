---
title: SST Baselines
summary: Baselines and a reproducible evaluation for daily sea surface temperature (NOAA OISST) in two North Pacific regions.
order: 2
stats: [["6", "baselines compared"], ["40", "tests"]]
tags: [Python, NOAA OISST, Ridge regression]
repo: https://github.com/diyor-ai/sst-baselines
---
## Problem
Before comparing any learned model on sea surface temperature (SST), you need to know how hard simple baselines are to beat. This is a study of those baselines, not a model for operational ocean forecasts. The work was done with the permission of my teacher at HEU.

## What I did
Built the data pipeline and evaluation for NOAA OISST v2.1 daily SST in two Pacific regions (Kuroshio and subtropical), 1982–2025. ERDDAP was missing 1,194 days per region, which I filled from NOAA PSL with verification checks. I compared six baselines: persistence, fixed smoothed climatology, anomaly persistence, damped persistence, a 10-year daily climatology (OCN) and per-grid-point Ridge regression. The project has 40 tests and CI.

## Method
Fixed split: 1982–2015 for training, 2016–2019 for validation, 2020–2025 for test. The test set was run once, after the configuration was frozen and tagged in git.

Afterwards I added a small LSTM experiment. It uses the same information as Ridge (the last 30 days of anomaly at one grid point), with 1 layer and hidden size 64 chosen on validation, and 3 seeds per region. Its protocol was written and tagged `pre-lstm-test` before the test years were loaded, and the test was run once (2026-11-05). Results are mean over seeds, with no seed picking.

## Results
Methods that pull toward climatology (damped persistence and Ridge) lost most of their validation advantage in the test years. This is consistent with a larger warm shift in the test period, but the cause is not proven.

> “Good job.”
>
> — Associate Professor Green, on the baseline results

The small LSTM beat Ridge in the subtropical box and did not beat it in the Kuroshio box. Skill vs Ridge at 1, 7 and 30 days on test: subtropical +0.029, +0.025, +0.022; Kuroshio −0.061, −0.017, −0.001. On validation the Kuroshio 7- and 30-day numbers had been slightly positive, and those gains did not hold. The subtropical result is weaker than it looks: Ridge is itself behind anomaly persistence at 1 and 7 days there, and so is the LSTM. The two regions disagree, so I make no general claim.

## Figures
Figures from the repository README; the text inside the images is in English.

![Figure 1. Mean SST and standard deviation of the daily anomaly (training years) in the two regions.](./fig1_regions.png)
*Figure 1. Mean SST and standard deviation of the daily anomaly (training years) in the two regions.*

![Figure 2 (validation). RMSE and skill vs anomaly persistence by lead.](./fig2_val_leads.png)
*Figure 2 (validation). RMSE and skill vs anomaly persistence by lead.*

![Figure 2 (test, 2020–2025). Same layout; values below the axis are listed in the box.](./fig2_test_leads.png)
*Figure 2 (test, 2020–2025). Same layout; values below the axis are listed in the box.*

![Figure 3. Test skill vs anomaly persistence by season (mean ± std over years, dots = years).](./fig3_test_seasons.png)
*Figure 3. Test skill vs anomaly persistence by season (mean ± std over years, dots = years).*

![Figure S1. Area-mean anomaly vs the 1982–2015 climatology; the validation period is shaded.](./figS1_area_mean_anomaly.png)
*Figure S1. Area-mean anomaly vs the 1982–2015 climatology; the validation period is shaded.*

![LSTM learning curves.](./figL1_lstm_curves.png)
*LSTM learning curves.*

## Limitations
- Simple baselines plus one small LSTM experiment, nothing else learned. The LSTM gets the full 30-day sequence and the day of year, while Ridge gets fewer inputs, so part of any LSTM gain may come from the inputs; this was not tested.
- Two small regions, one dataset.

## AI assistance
Code written with Claude Code; methodology and verification are mine.
