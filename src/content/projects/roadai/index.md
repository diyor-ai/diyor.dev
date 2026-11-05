---
title: RoadAI
summary: "Transfer-operations platform (MVP, pilot in preparation): driver app, dispatcher dashboard and LLM document extraction with human review."
order: 3
stats: [["646", "automated checks"], ["3", "test suites"]]
tags: [FastAPI, Flutter, React, PostgreSQL]
repo: https://github.com/diyor-ai/roadai-case-study
repoLabel: Case study (app code is private)
---
## Problem
Transfer companies move passengers between airports and hotels. The public case study describes the problems it addresses: paper vouchers that drivers retype by hand, no record of delivery, and no visibility into vehicle use.

## What I did
I defined the product, architecture and specifications, reviewed the code and the security of the design, and tested on a real device. The stack is FastAPI, Flutter, React and PostgreSQL. A Claude Haiku vision model extracts structured data from a voucher photo, and a human review step lets the driver correct it before anything is saved.

## Method
- Test suites: 469 backend checks, 145 Flutter tests and 32 dashboard tests, **646 automated checks** in total.
- On the first overnight real-device test the app stored very few location pings. I traced it through the phone's own logs to a HyperOS GNSS power-saving behavior, and changed the tracking design to work around it. The real-phone re-test of that fix is still pending.

## Results
646 automated checks across three suites, and a documented investigation of the HyperOS GNSS issue. The code is private; the case study contains no code or client data.

## Limitations
- No production users yet; a pilot with a transfer company is in preparation.
- Extraction accuracy is not measured.
- The post-fix real-phone re-test is still pending.

## AI assistance
Most of the code was written by Claude Code under my specifications and review. The decisions, test plans and the real-device investigation are mine.
