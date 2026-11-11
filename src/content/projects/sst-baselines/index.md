---
title: SST Baselines
summary: Six baselines, a small LSTM, spatial-context and whole-region (U-Net, ConvLSTM) models, evaluated reproducibly on daily sea surface temperature (NOAA OISST) in two North Pacific regions.
order: 2
stats: [["6", "baselines compared"], ["107", "tests"]]
tags: [Python, NOAA OISST, Ridge regression]
repo: https://github.com/diyor-ai/sst-baselines
---
## Problem
Before comparing any learned model on sea surface temperature (SST), you need to know how hard simple baselines are to beat. This is a study of those baselines, not a model for operational ocean forecasts. The work was done with the permission of my teacher at HEU.

## What I did
Built the data pipeline and evaluation for NOAA OISST v2.1 daily SST in two Pacific regions (Kuroshio and subtropical), 1982–2025. ERDDAP was missing 1,194 days per region, which I filled from NOAA PSL with verification checks. I compared six baselines: persistence, fixed smoothed climatology, anomaly persistence, damped persistence, a 10-year daily climatology (OCN) and per-grid-point Ridge regression. The project has 107 tests and CI.

## Method
Fixed split: 1982–2015 for training, 2016–2019 for validation, 2020–2025 for test. The test set was run once, after the configuration was frozen and tagged in git.

Afterwards I added a small LSTM experiment. It uses the same information as Ridge (the last 30 days of anomaly at one grid point), with 1 layer and hidden size 64 chosen on validation, and 3 seeds per region. Its protocol was written and tagged `pre-lstm-test` before the test years were loaded, and the test was run once (2026-11-05). Results are mean over seeds, with no seed picking.

## Results
Methods that pull toward climatology (damped persistence and Ridge) lost most of their validation advantage in the test years. This is consistent with a larger warm shift in the test period, but the cause is not proven.

> “Good job.”
>
> — Associate Professor Green, on the baseline results

The small LSTM beat Ridge in the subtropical box and did not beat it in the Kuroshio box. Skill vs Ridge at 1, 7 and 30 days on test: subtropical +0.029, +0.025, +0.022; Kuroshio −0.061, −0.017, −0.001. On validation the Kuroshio 7- and 30-day numbers had been slightly positive, and those gains did not hold. The subtropical result is weaker than it looks: Ridge is itself behind anomaly persistence at 1 and 7 days there, and so is the LSTM. The two regions disagree, so I make no general claim.

## Spatial context (B1)
Afterwards I asked whether neighbouring grid points help, and how much of an LSTM gain comes from extra inputs rather than the model. The inputs were a 5×5 patch of grid points around each target point, for a linear Ridge-patch and a small LSTM-patch (same architecture, 3 seeds). The boxes were extended by a 1° halo that provides inputs only; targets and scoring are unchanged. The protocol was written and tagged `pre-b1-test` before the test years were used, and the test was run once.

On test (2020–2025), Ridge-patch beat Ridge in all six region/lead cells (skill vs Ridge, Kuroshio +0.006, +0.015, +0.020; subtropical +0.038, +0.033, +0.032 at 1, 7 and 30 days). The day of year alone did nothing for Ridge. In the subtropical box at 7 and 30 days LSTM-patch beat Ridge (skill +0.069 ± 0.014 and +0.083 ± 0.004) and also Ridge-patch with the same inputs (+0.038 ± 0.015 and +0.053 ± 0.004). In the Kuroshio box it did not beat Ridge-patch (−0.190 ± 0.041, −0.022 ± 0.007, and a tie at 30 days, −0.007 ± 0.010), so the best model there is the linear Ridge-patch.

Caveats: in the subtropical box Ridge-patch is still worse than anomaly persistence at 1 and 7 days (skill −0.009, −0.014). Validation numbers are slightly optimistic, because the new alphas and the LSTM early stopping used the same validation years. The Kuroshio gains of LSTM-patch over Ridge shrank or vanished from validation to test. Two boxes that disagree, three seeds and one test run: no general claim; this is a learning experiment, not an ocean forecasting model.

![Figure B1. LSTM learning curves, point vs patch (validation period; dot = best epoch).](./figB1_curves.png)
*Figure B1. LSTM learning curves, point vs patch (validation period; dot = best epoch).*

## Whole-region models (B2)
**In short:** on the test years, both whole-region models beat Ridge-patch at 7 and 30 days in both boxes, with the U-Net lowest; at 1 day both were worse than anomaly persistence.

Afterwards I asked whether models that see the whole box at once beat the patch models. One model takes the full 48×48 box (30 days of anomaly plus sin/cos of the day of year) and predicts all three leads at once for the inner 40×40: a small U-Net (C = 32, 3 downsamplings, GroupNorm) and a ConvLSTM encoder-forecaster (C = 16; a deviation from the first spec for compute reasons, documented in the protocol). Each also has a residual variant (output = last input anomaly + network). Per region and model family, the variant with the lowest mean validation RMSE went to the test, chosen by code: the residual one in all four cases. They were trained on 1982–2015 only (~12k samples), with early stopping on 2016–2019 and 3 seeds each. The protocols were written and committed before the models were trained and before the test years were used (tag `pre-b2-test`), and the 12 checkpoints were tested once (2026-11-10), with weights hashes checked against the manifests.

**At 7 and 30 days**, on test (2020–2025), both models beat Ridge-patch in both boxes, by more than one seed-std (skill vs Ridge-patch: U-Net Kuroshio +0.037 ± 0.006 and +0.049 ± 0.009, subtropical +0.077 ± 0.003 and +0.146 ± 0.020; ConvLSTM-ED Kuroshio +0.028 ± 0.007 and +0.031 ± 0.004, subtropical +0.067 ± 0.014 and +0.128 ± 0.008). Among the four models compared in this section (Ridge-patch, LSTM-patch, U-Net, ConvLSTM-ED), the U-Net had the lowest test RMSE at 7 and 30 days in both boxes, for example 0.470 °C against 0.550 °C for Ridge-patch in the subtropical box at 30 days. The U-Net was lower than the ConvLSTM-ED in all six region/lead cells, but by small margins (Kuroshio 30 days: 1.194 vs 1.217 °C), with a ~50× larger parameter count. The gain over Ridge-patch is larger in the subtropical box than in the Kuroshio box at 7 and 30 days. Against LSTM-patch the means are positive in all 12 model/region/lead cells (U-Net +0.025 to +0.124, ConvLSTM-ED +0.010 to +0.118); the 1-day gain is partly because LSTM-patch was poor at 1 day on test (B1).

**At 1 day**, no. Both whole-region models are below Ridge-patch (U-Net −0.043 ± 0.002 Kuroshio, −0.017 ± 0.019 subtropical; ConvLSTM-ED −0.050 ± 0.009, −0.032 ± 0.022) and both are worse than anomaly persistence in all four cells (for example U-Net 0.261 vs 0.258 °C in the Kuroshio box and 0.125 vs 0.122 °C in the subtropical box).

Validation conclusions held where they were positive: the 7- and 30-day gains over Ridge-patch were positive on validation and larger on test. At 1 day the subtropical U-Net was slightly positive on validation (+0.014) and is negative on test.

Caveats: C, the variant and early stopping were chosen on the validation years. There are ~12k highly autocorrelated training samples for 4×10⁴–2×10⁶ parameters, and the validation best epochs were 2–8. Three seeds measure training noise only, not the sampling uncertainty of six test years. The residual variant mainly fixes the 1-day result and is nearly neutral at 7 and 30 days (validation only); the unchosen variant was not run on test. Learning experiment, not an ocean forecasting model.

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
- Simple baselines, one small LSTM experiment, the B1 spatial-context models (Ridge-patch, LSTM-patch) and the B2 whole-region models (U-Net, ConvLSTM-ED), nothing else learned. The LSTM gets the full 30-day sequence and the day of year, while Ridge gets fewer inputs, so part of any LSTM gain may come from the inputs; this was not tested.
- B1 uses only a 5×5 patch in two boxes, three seeds and one test run; the halo gives inputs only. Some Ridge alphas sit at the lower edge of the grid (flat validation curve, not changed), and validation numbers are slightly optimistic because alphas and early stopping used the validation years.
- B2: ~12k training samples for the whole-region networks, three seeds, one test run; the U-Net/ConvLSTM-ED margins over Ridge-patch at 7 and 30 days are measured on six test years in two boxes only.
- Two small regions, one dataset.

## AI assistance
Code written with Claude Code; methodology and verification are mine.
