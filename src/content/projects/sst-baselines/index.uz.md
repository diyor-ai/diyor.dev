---
title: SST Baselines
summary: Shimoliy Tinch okeanining ikki hududida kunlik dengiz sirti harorati (NOAA OISST) uchun baselinelar, kichik LSTM va fazoviy kontekst modellari hamda takrorlanadigan baholash.
order: 2
stats: [["6", "baseline taqqoslandi"], ["79", "test"]]
tags: [Python, NOAA OISST, Ridge regression]
repo: https://github.com/diyor-ai/sst-baselines
---
## Muammo
Dengiz sirti harorati (SST) bo‘yicha biror o‘qitiladigan modelni taqqoslashdan oldin, oddiy baselinelardan o‘zib ketish qanchalik qiyinligini bilish kerak. Bu — ana shu baselinelarni o‘rganish, operativ okean prognozi uchun model emas. Ish HEU’dagi o‘qituvchimning ruxsati bilan bajarildi.

## Nima qildim
1982–2025 yillar uchun Tinch okeanining ikki hududida (Kuroshio va subtropik) NOAA OISST v2.1 kunlik SST uchun ma’lumotlar konveyeri va baholashni qurdim. ERDDAP’da har bir hududda 1,194 kun yetishmasdi; ularni tekshiruvlar bilan NOAA PSL’dan to‘ldirdim. Oltita baselineni taqqosladim: persistence, qat’iy tekislangan klimatologiya, anomaliya persistence, so‘nuvchi persistence, 10 yillik kunlik klimatologiya (OCN) va har bir to‘r nuqtasi uchun Ridge regression. Loyihada 79 ta test va CI bor.

## Metod
Qat’iy bo‘linish: 1982–2015 — o‘qitish, 2016–2019 — validatsiya, 2020–2025 — test. Test to‘plami konfiguratsiya muzlatilib, git’da teglanganidan keyin bir marta ishga tushirildi.

Keyin kichik LSTM tajribasini qo‘shdim. U Ridge bilan bir xil ma’lumotdan foydalanadi (bitta to‘r nuqtasida so‘nggi 30 kunlik anomaliya), 1 qatlam va validatsiyada tanlangan 64 hidden size bilan, har bir hudud uchun 3 ta seed bilan. Uning protokoli test yillari yuklanishidan oldin yozilib, `pre-lstm-test` deb teglandi va test bir marta ishga tushirildi (2026-11-05). Natijalar seedlar bo‘yicha o‘rtacha, seed tanlashsiz.

## Natijalar
Klimatologiyaga tortadigan metodlar (so‘nuvchi persistence va Ridge) validatsiyadagi ustunligining ko‘p qismini test yillarida yo‘qotdi. Bu test davrida isish siljishining kattaroq bo‘lishiga mos keladi, ammo sabab isbotlanmagan.

> “Yaxshi ish.”
>
> — Associate Professor Green, baseline natijalari haqida

Kichik LSTM subtropik hududda Ridge’dan o‘zib ketdi, Kuroshio hududida esa o‘zib keta olmadi. Testda Ridge’ga nisbatan skill, 1, 7 va 30 kunlik prognozda: subtropik +0.029, +0.025, +0.022; Kuroshio −0.061, −0.017, −0.001. Validatsiyada Kuroshio uchun 7 va 30 kunlik raqamlar biroz musbat edi va bu yutuqlar saqlanmadi. Subtropik natija ko‘ringanidan zaifroq: u yerda Ridge o‘zi 1 va 7 kunda anomaliya persistence’dan orqada, LSTM ham shunday. Ikki hudud bir-biriga zid, shuning uchun umumiy da’vo qilmayman.

## Fazoviy kontekst (B1)
Keyin qo‘shni to‘r nuqtalari yordam beradimi va LSTM yutug‘ining qanchasi modeldan emas, qo‘shimcha kirishlardan ekanini tekshirdim. Kirish sifatida har bir maqsad nuqtasi atrofidagi 5×5 to‘r nuqtalari patch’i olindi: chiziqli Ridge-patch va kichik LSTM-patch (arxitektura bir xil, 3 ta seed). Hududlar 1° halo bilan kengaytirildi; halo faqat kirishlarni beradi, maqsad va baholash o‘zgarmagan. Protokol test yillaridan foydalanishdan oldin yozilib, `pre-b1-test` deb teglandi va test bir marta ishga tushirildi.

Testda (2020–2025) Ridge-patch Ridge’dan barcha oltita hudud/muddat kombinatsiyasida o‘zib ketdi (Ridge’ga nisbatan skill, 1, 7 va 30 kunda: Kuroshio +0.006, +0.015, +0.020; subtropik +0.038, +0.033, +0.032). Faqat yil kuni Ridge’ga hech narsa bermadi. Subtropik hududda 7 va 30 kunda LSTM-patch Ridge’dan (skill +0.069 ± 0.014 va +0.083 ± 0.004) hamda xuddi shu kirishli Ridge-patch’dan (+0.038 ± 0.015 va +0.053 ± 0.004) o‘zib ketdi. Kuroshio hududida u Ridge-patch’dan o‘zib keta olmadi (−0.190 ± 0.041, −0.022 ± 0.007, 30 kunda esa durang, −0.007 ± 0.010), shuning uchun u yerdagi eng yaxshi model — chiziqli Ridge-patch.

Ogohlantirishlar: subtropik hududda Ridge-patch 1 va 7 kunda hamon anomaliya persistence’dan yomonroq (skill −0.009, −0.014). Validatsiya raqamlari biroz optimistik, chunki yangi alphalar va LSTM’ning erta to‘xtatilishi bir xil validatsiya yillarida tanlangan. LSTM-patch’ning Ridge’ga nisbatan Kuroshio’dagi yutuqlari validatsiyadan testga o‘tganda kamaydi yoki yo‘qoldi. Bir-biriga zid ikki hudud, uchta seed va bitta test ishga tushirish: umumiy da’vo yo‘q; bu o‘rganish tajribasi, okean prognozi modeli emas.

![B1-rasm. LSTM o‘rganish egri chiziqlari, nuqta va patch (validatsiya davri; nuqta — eng yaxshi epoxa).](./figB1_curves.png)
*B1-rasm. LSTM o‘rganish egri chiziqlari, nuqta va patch (validatsiya davri; nuqta — eng yaxshi epoxa).*

## Grafiklar
Grafiklar repozitoriy README’sidan; rasmlardagi matn inglizcha.

![1-rasm. Ikki hududda o‘rtacha SST va kunlik anomaliyaning standart og‘ishi (o‘qitish yillari).](./fig1_regions.png)
*1-rasm. Ikki hududda o‘rtacha SST va kunlik anomaliyaning standart og‘ishi (o‘qitish yillari).*

![2-rasm (validatsiya). Prognoz muddati bo‘yicha RMSE va anomaliya persistence’ga nisbatan skill.](./fig2_val_leads.png)
*2-rasm (validatsiya). Prognoz muddati bo‘yicha RMSE va anomaliya persistence’ga nisbatan skill.*

![2-rasm (test, 2020–2025). Joylashuv bir xil; o‘q ostidagi qiymatlar ramkada keltirilgan.](./fig2_test_leads.png)
*2-rasm (test, 2020–2025). Joylashuv bir xil; o‘q ostidagi qiymatlar ramkada keltirilgan.*

![3-rasm. Fasllar bo‘yicha testdagi anomaliya persistence’ga nisbatan skill (yillar bo‘yicha o‘rtacha ± std, nuqtalar — yillar).](./fig3_test_seasons.png)
*3-rasm. Fasllar bo‘yicha testdagi anomaliya persistence’ga nisbatan skill (yillar bo‘yicha o‘rtacha ± std, nuqtalar — yillar).*

![S1-rasm. Hudud bo‘yicha o‘rtacha anomaliya, 1982–2015 klimatologiyasiga nisbatan; validatsiya davri bo‘yalgan.](./figS1_area_mean_anomaly.png)
*S1-rasm. Hudud bo‘yicha o‘rtacha anomaliya, 1982–2015 klimatologiyasiga nisbatan; validatsiya davri bo‘yalgan.*

![LSTM o‘rganish egri chiziqlari.](./figL1_lstm_curves.png)
*LSTM o‘rganish egri chiziqlari.*

## Cheklovlar
- Oddiy baselinelar, bitta kichik LSTM tajribasi va B1 fazoviy kontekst modellari (Ridge-patch, LSTM-patch), boshqa o‘qitiladigan narsa yo‘q. LSTM to‘liq 30 kunlik ketma-ketlik va yil kunini oladi, Ridge esa kamroq kirish oladi, shuning uchun LSTM yutug‘ining bir qismi modeldan emas, kirishlardan bo‘lishi mumkin; bu sinalmagan.
- B1 faqat ikki hududdagi 5×5 patch, uchta seed va bitta test ishga tushirishdan foydalanadi; halo faqat kirishlarni beradi. Ba’zi Ridge alphalar to‘rning pastki chetida turadi (validatsiya egri chizig‘i tekis, o‘zgartirilmagan), validatsiya raqamlari esa biroz optimistik: alphalar va erta to‘xtatish validatsiya yillarida tanlangan.
- Ikkita kichik hudud, bitta ma’lumotlar to‘plami.

## AI yordami
Kod Claude Code yordamida yozilgan; metodologiya va tekshiruv menga tegishli.
