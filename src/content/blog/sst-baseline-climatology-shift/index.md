---
title: "When the test years were warmer: what happened to my SST baselines"
description: "In a baseline and evaluation study of sea surface temperature, methods that relax toward climatology lost their validation-period advantage in the 2020-2025 test years."
date: 2026-11-07
---
I wanted to know how hard simple baselines are to beat for daily sea surface temperature (SST) before comparing any learned model with them. The ranking I saw on the validation years (2016-2019) did not hold on the test years (2020-2025). This post is about what changed, what I can and cannot say about why, and a small LSTM I added afterwards.

All numbers come from the README and the `results/` files of [sst-baselines](https://github.com/diyor-ai/sst-baselines). It is a baseline and evaluation study, not an operational forecast system.

## Setup

- **Data:** NOAA OISST v2.1 daily SST, 1982-01-01 to 2025-12-31, 16,071 daily fields per region on a 40x40 grid. The ERDDAP aggregation lacked 1,194 days per region, which I filled from NOAA PSL after checking that the two sources agree on every overlapping day.
- **Regions:** two 10°×10° boxes in the North Pacific. A high-variability Kuroshio-extension box (30.125-39.875°N, 145.125-154.875°E) and a low-variability subtropical box (15.125-24.875°N, 150.125-159.875°E).
- **Split:** training 1982-2015, validation 2016-2019, test 2020-2025. Leads of 1, 7 and 30 days.
- **Six baselines:** persistence, climatology, anomaly persistence, damped persistence, a 10-year daily climatology (OCN) and per-grid-point Ridge regression.
- **Protocol:** fixed before I looked at validation or test scores. The test period was evaluated once, after I froze the configuration and tagged it `pre-test-freeze`; the code refuses to run the test otherwise.

I score each method by skill against anomaly persistence, which is "climatology for the target day plus today's anomaly". Skill is 1 − RMSE/RMSE_reference, so above 0 is better than anomaly persistence and below 0 is worse. Anomaly persistence turned out to be the bar to beat, especially at 1 day.

## What happened in the test years

Ridge and damped persistence both relax the forecast toward the 1982-2015 climatology. On validation they were ahead of anomaly persistence at most leads. On test they lost much or all of that advantage. Skill vs anomaly persistence at 1, 7 and 30 days:

| Method, region | Validation (2016-2019) | Test (2020-2025) |
|---|---|---|
| Ridge, Kuroshio | +0.041, +0.077, +0.176 | +0.025, +0.007, +0.088 |
| Ridge, subtropical | +0.022, +0.056, +0.090 | −0.049, −0.049, +0.006 |
| Damped persistence, Kuroshio | +0.010, +0.067, +0.164 | −0.017, −0.012, +0.058 |
| Damped persistence, subtropical | −0.004, −0.017, +0.028 | −0.109, −0.178, −0.091 |

Ridge in the Kuroshio box stayed ahead at every lead, with a much smaller margin at 7 days. In the subtropical box, damped persistence was already behind at 1 and 7 days on validation, and on test it was behind at every lead.

## A possible explanation, not a proven one

The validation and test years are warmer than the 1982-2015 climatology, and the test years more so. The mean bias of the climatology forecast goes from −0.500 °C (Kuroshio) and −0.539 °C (subtropical) on validation to −0.827 °C and −0.656 °C on test. The 30-day bias of damped persistence goes from −0.324 and −0.325 °C to −0.527 and −0.392 °C. A method that pulls toward an older climatology pays more when the sea is warmer than that climatology, so this fits.

But the repo does not show that the warm shift is the cause. I did not test any alternative explanation, so I cannot rank them or rule them out. What I can list are the limits that apply: I applied no detrending (OCN is included instead), there is one fixed split with no cross-validation over time blocks, six test years are a short record, and Ridge is fitted per grid point and ignores spatial structure. I am still learning oceanography, so I treat this as description, not a physical explanation.

## A small LSTM, and why I do not generalize from it

After the baselines were done, I added a small LSTM. It sees the same information as Ridge, the last 30 days of anomaly at one grid point, and has 1 layer with hidden size 64 chosen on validation. I trained 3 seeds per region and report the mean over seeds, with no seed picking and no ensemble. I wrote the protocol and tagged it `pre-lstm-test` before loading the test period, then ran the test once.

Skill vs Ridge at 1, 7 and 30 days on test:

- **Subtropical:** +0.029, +0.025, +0.022. The LSTM beat Ridge at every lead.
- **Kuroshio:** −0.061, −0.017, −0.001. It did not beat Ridge. On validation the 7- and 30-day numbers had been slightly positive (+0.006, +0.014), and those gains did not hold.

The subtropical result is weaker than it looks. Ridge itself is worse than anomaly persistence at 1 and 7 days in that box, and the LSTM is also behind anomaly persistence there (−0.018 and −0.023). The LSTM also gets the full 30-day sequence plus the day of year, while Ridge gets fewer inputs, so part of any gain may come from the inputs and not from the model. I did not test that. Two regions gave two different answers, so the only thing I take from this is not to build a story from one result in one region.

## What I took from it

- Check that a ranking from validation still holds on a later period before believing it.
- Say plainly which explanation is consistent with the data and which one is proven.
- A learned model that wins in one region and loses in the other is not a result about deep learning.

Limitations: two small regions and one product (OISST), simple statistical baselines only, and no uncertainty intervals. The code is public, so you can check every number in this post against `results/test_all.json`, `results/val_all.json` and `results/lstm_test.json`.

The code was written with Claude Code; the methodology, decisions and verification are mine.
