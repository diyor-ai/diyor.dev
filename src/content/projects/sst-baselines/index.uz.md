---
title: SST Baselines
summary: Shimoliy Tinch okeanining ikki hududida kunlik dengiz sirti harorati (NOAA OISST) uchun baselinelar va takrorlanuvchi baholash.
order: 2
stats: [["6", "taqqoslangan baseline"], ["40", "test"]]
tags: [Python, NOAA OISST, Ridge regression]
repo: https://github.com/diyor-ai/sst-baselines
---
<!-- REVIEW: translation -->
## Muammo
Dengiz sirti harorati (SST) bo‘yicha biror o‘qitiladigan modelni taqqoslashdan oldin, oddiy baselinelardan o‘zib ketish qanchalik qiyinligini bilish kerak. Bu — ana shu baselinelarni o‘rganish, operativ okean prognozi uchun model emas. Ish HEU’dagi o‘qituvchimning ruxsati bilan bajarildi.

## Nima qildim
1982–2025 yillar uchun Tinch okeanining ikki hududida (Kuroshio va subtropik) NOAA OISST v2.1 kunlik SST uchun ma’lumotlar konveyeri va baholashni qurdim. ERDDAP’da har bir hududda 1,194 kun yetishmasdi; ularni tekshiruvlar bilan NOAA PSL’dan to‘ldirdim. Oltita baselineni taqqosladim: persistence, qat’iy tekislangan klimatologiya, anomaliya persistence, so‘nuvchi persistence, 10 yillik kunlik klimatologiya (OCN) va har bir to‘r nuqtasi uchun Ridge regression. Loyihada 40 ta test va CI bor.

## Metod
Qat’iy bo‘linish: 1982–2015 — o‘qitish, 2016–2019 — validatsiya, 2020–2025 — test. Test to‘plami konfiguratsiya muzlatilib, git’da teglanganidan keyin bir marta ishga tushirildi.

Keyin kichik LSTM tajribasini qo‘shdim. U Ridge bilan bir xil ma’lumotdan foydalanadi (bitta to‘r nuqtasida so‘nggi 30 kunlik anomaliya), 1 qatlam va validatsiyada tanlangan 64 hidden size bilan, har bir hudud uchun 3 ta seed bilan. Uning protokoli test yillari yuklanishidan oldin yozilib, `pre-lstm-test` deb teglandi va test bir marta ishga tushirildi (2026-11-05). Natijalar seedlar bo‘yicha o‘rtacha, seed tanlashsiz.

## Natijalar
Klimatologiyaga tortadigan metodlar (so‘nuvchi persistence va Ridge) validatsiyadagi ustunligining ko‘p qismini test yillarida yo‘qotdi. Bu test davrida isish siljishining kattaroq bo‘lishiga mos keladi, ammo sabab isbotlanmagan.

> “Yaxshi ish.”
>
> — Associate Professor Green, baseline natijalari haqida

Kichik LSTM subtropik hududda Ridge’dan o‘zib ketdi, Kuroshio hududida esa o‘zib keta olmadi. Testda Ridge’ga nisbatan skill, 1, 7 va 30 kunlik prognozda: subtropik +0.029, +0.025, +0.022; Kuroshio −0.061, −0.017, −0.001. Validatsiyada Kuroshio uchun 7 va 30 kunlik raqamlar biroz musbat edi va bu yutuqlar saqlanmadi. Subtropik natija ko‘ringanidan zaifroq: u yerda Ridge o‘zi 1 va 7 kunda anomaliya persistence’dan orqada, LSTM ham shunday. Ikki hudud bir-biriga zid, shuning uchun umumiy da’vo qilmayman.

## Cheklovlar
- Oddiy baselinelar va bitta kichik LSTM tajribasi, boshqa o‘qitiladigan narsa yo‘q. LSTM to‘liq 30 kunlik ketma-ketlik va yil kunini oladi, Ridge esa kamroq kirish oladi, shuning uchun LSTM yutug‘ining bir qismi modeldan emas, kirishlardan bo‘lishi mumkin; bu sinalmagan.
- Ikkita kichik hudud, bitta ma’lumotlar to‘plami.

## AI yordami
Kod Claude Code yordamida yozilgan; metodologiya va tekshiruv menga tegishli.
