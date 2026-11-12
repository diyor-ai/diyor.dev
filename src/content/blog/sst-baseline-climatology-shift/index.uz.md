---
title: "Test yillari issiqroq bo‘lganda: SST baselinelarimga nima bo‘ldi"
description: "Dengiz sirti haroratining baseline va baholash tadqiqotida klimatologiyaga qaytadigan metodlar 2020-2025 test yillarida validatsiya davridagi ustunligini yo‘qotdi."
date: 2026-11-07
draft: false
---
> **Yangilanish (2026-yil 11-noyabr):** Ushbu maqoladan keyin men fazoviy kontekst (B1) va butun hudud (B2) modellarini qo‘shdim. 2020–2025 test yillarida B2’da taqqoslangan to‘rtta model orasida U-Net ikkala hududda ham 7 va 30 kunda eng past RMSE’ga ega bo‘ldi; 1 kunda butun hudud modellari anomaliya persistence’dan yomonroq chiqdi. To‘liq natijalar [loyiha sahifasida](/uz/projects/sst-baselines/).

Biror o‘qitiladigan modelni taqqoslashdan oldin, kunlik dengiz sirti harorati (SST) uchun oddiy baselinelardan o‘zib ketish qanchalik qiyinligini bilmoqchi edim. Validatsiya yillarida (2016-2019) ko‘rgan reytingim test yillarida (2020-2025) saqlanmadi. Bu maqola nima o‘zgargani, sababi haqida nimani ayta olishim va nimani ayta olmasligim hamda keyin qo‘shgan kichik LSTM haqida.

Barcha raqamlar [sst-baselines](https://github.com/diyor-ai/sst-baselines) README’sidan va `results/` fayllaridan olingan. Bu baseline va baholash tadqiqoti, operativ prognoz tizimi emas.

## Sozlama

- **Ma’lumotlar:** NOAA OISST v2.1 kunlik SST, 1982-01-01 dan 2025-12-31 gacha, har bir hududda 40x40 to‘rda 16,071 ta kunlik maydon. ERDDAP agregatsiyasida har bir hududda 1,194 kun yetishmasdi; ikki manba har bir umumiy kunda mos kelishini tekshirgach, ularni NOAA PSL’dan to‘ldirdim.
- **Hududlar:** Shimoliy Tinch okeanida ikkita 10°×10° quti. O‘zgaruvchanligi yuqori Kuroshio-extension qutisi (30.125-39.875°N, 145.125-154.875°E) va o‘zgaruvchanligi past subtropik quti (15.125-24.875°N, 150.125-159.875°E).
- **Bo‘linish:** o‘qitish 1982-2015, validatsiya 2016-2019, test 2020-2025. Prognoz muddatlari 1, 7 va 30 kun.
- **Oltita baseline:** persistence, klimatologiya, anomaliya persistence, so‘nuvchi persistence, 10 yillik kunlik klimatologiya (OCN) va har bir to‘r nuqtasi uchun Ridge regression.
- **Protokol:** validatsiya yoki test ballarini ko‘rishdan oldin belgilangan. Test davri konfiguratsiyani muzlatib, `pre-test-freeze` deb teglaganimdan keyin bir marta baholandi; aks holda kod testni ishga tushirishni rad etadi.

Har bir metodni anomaliya persistence’ga nisbatan skill bilan baholayman; bu "maqsad kunining klimatologiyasi plyus bugungi anomaliya". Skill = 1 − RMSE/RMSE_reference, shuning uchun 0 dan yuqori — anomaliya persistence’dan yaxshi, 0 dan past — yomonroq. Anomaliya persistence, ayniqsa 1 kunda, o‘zib ketilishi kerak bo‘lgan chegara bo‘lib chiqdi.

## Test yillarida nima bo‘ldi

Ridge ham, so‘nuvchi persistence ham prognozni 1982-2015 klimatologiyasi tomon tortadi. Validatsiyada ular ko‘pgina muddatlarda anomaliya persistence’dan oldinda edi. Testda bu ustunlikning ko‘p qismini yoki barchasini yo‘qotdi. 1, 7 va 30 kunda anomaliya persistence’ga nisbatan skill:

| Metod, hudud | Validatsiya (2016-2019) | Test (2020-2025) |
|---|---|---|
| Ridge, Kuroshio | +0.041, +0.077, +0.176 | +0.025, +0.007, +0.088 |
| Ridge, subtropik | +0.022, +0.056, +0.090 | −0.049, −0.049, +0.006 |
| So‘nuvchi persistence, Kuroshio | +0.010, +0.067, +0.164 | −0.017, −0.012, +0.058 |
| So‘nuvchi persistence, subtropik | −0.004, −0.017, +0.028 | −0.109, −0.178, −0.091 |

Kuroshio qutisida Ridge har bir muddatda oldinda qoldi, faqat 7 kunda farq ancha kichik. Subtropik qutida so‘nuvchi persistence validatsiyada 1 va 7 kunda allaqachon orqada edi, testda esa har bir muddatda orqada qoldi.

## Mumkin bo‘lgan tushuntirish, isbotlanmagan

Validatsiya va test yillari 1982-2015 klimatologiyasidan issiqroq, test yillari esa ko‘proq. Klimatologiya prognozining o‘rtacha siljishi validatsiyada −0.500 °C (Kuroshio) va −0.539 °C (subtropik) edi, testda −0.827 °C va −0.656 °C bo‘ldi. So‘nuvchi persistence’ning 30 kunlik siljishi −0.324 va −0.325 °C dan −0.527 va −0.392 °C ga o‘tdi. Eskiroq klimatologiyaga tortadigan metod dengiz shu klimatologiyadan issiqroq bo‘lganda ko‘proq yo‘qotadi, shuning uchun bu mos keladi.

Ammo repo isish siljishi sabab ekanini ko‘rsatmaydi. Boshqa tushuntirishlarni sinamadim, shuning uchun ularni saralay olmayman ham, rad eta olmayman ham. Qo‘llanadigan cheklovlarni sanab o‘tishim mumkin: detrending qo‘llamadim (uning o‘rniga OCN kiritilgan), bitta qat’iy bo‘linish bor va vaqt bloklari bo‘yicha cross-validation yo‘q, olti test yili qisqa qator, Ridge har bir to‘r nuqtasi uchun alohida o‘rnatiladi va fazoviy tuzilmani e’tiborsiz qoldiradi. Men hali okeanografiyani o‘rganyapman, shuning uchun buni jismoniy tushuntirish emas, tavsif deb bilaman.

## Kichik LSTM va nega undan umumlashtirmayman

Baselinelar tugagach, kichik LSTM qo‘shdim. U Ridge bilan bir xil ma’lumotni ko‘radi, ya’ni bitta to‘r nuqtasidagi so‘nggi 30 kunlik anomaliyani, va validatsiyada tanlangan 1 qatlam hamda 64 hidden size’ga ega. Har bir hudud uchun 3 ta seed o‘qitdim va seedlar bo‘yicha o‘rtachani keltiraman, seed tanlamasdan va ansamblsiz. Protokolni yozib, test davrini yuklashdan oldin `pre-lstm-test` deb teglaganman, so‘ng testni bir marta ishga tushirdim.

Testda Ridge’ga nisbatan skill, 1, 7 va 30 kunda:

- **Subtropik:** +0.029, +0.025, +0.022. LSTM har bir muddatda Ridge’dan o‘zib ketdi.
- **Kuroshio:** −0.061, −0.017, −0.001. U Ridge’dan o‘zib keta olmadi. Validatsiyada 7 va 30 kunlik raqamlar biroz musbat edi (+0.006, +0.014) va bu yutuqlar saqlanmadi.

Subtropik natija ko‘ringanidan zaifroq. Ridge o‘zi shu qutida 1 va 7 kunda anomaliya persistence’dan yomonroq, LSTM ham u yerda anomaliya persistence’dan orqada (−0.018 va −0.023). Bundan tashqari, LSTM to‘liq 30 kunlik ketma-ketlik va yil kunini oladi, Ridge esa kamroq kirish oladi, shuning uchun har qanday yutuqning bir qismi modeldan emas, kirishlardan bo‘lishi mumkin. Buni sinamadim. Ikki hudud ikki xil javob berdi, shuning uchun bundan oladigan yagona xulosam — bitta hududdagi bitta natijadan hikoya qurmaslik.

## Bundan nimani o‘rgandim

- Reytingga ishonishdan oldin, uning validatsiyadagi ko‘rinishi keyingi davrda ham saqlanishini tekshiring.
- Qaysi tushuntirish ma’lumotlarga mos kelishini va qaysi biri isbotlanganini ochiq ayting.
- Bir hududda yutadigan, ikkinchisida yutqazadigan o‘qitiladigan model chuqur o‘rganish haqidagi natija emas.

Cheklovlar: ikkita kichik hudud va bitta mahsulot (OISST), faqat oddiy statistik baselinelar va ishonch intervallari yo‘q. Kod ochiq, shuning uchun bu maqoladagi har bir raqamni `results/test_all.json`, `results/val_all.json` va `results/lstm_test.json` bilan tekshirishingiz mumkin.

Kod Claude Code yordamida yozilgan; metodologiya, qarorlar va tekshiruv menga tegishli.
