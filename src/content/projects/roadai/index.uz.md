---
title: RoadAI
summary: "Transfer operatsiyalari platformasi (MVP, pilot tayyorlanmoqda): haydovchi ilovasi, dispetcher paneli va inson tekshiruvi bilan LLM orqali hujjatdan ma’lumot ajratib olish."
order: 3
stats: [["646", "avtomatik tekshiruv"], ["3", "test to‘plami"]]
tags: [FastAPI, Flutter, React, PostgreSQL]
repo: https://github.com/diyor-ai/roadai-case-study
repoLabel: Case study (ilova kodi yopiq)
---
<!-- REVIEW: translation -->
## Muammo
Transfer kompaniyalari yo‘lovchilarni aeroportlar va mehmonxonalar o‘rtasida tashiydi. Ommaviy case study u hal qiladigan muammolarni tasvirlaydi: haydovchilar qo‘lda qayta yozadigan qog‘oz voucherlar, yetkazib berish qaydining yo‘qligi va transport vositalaridan foydalanish ustidan ko‘rinishning yo‘qligi.

## Nima qildim
Mahsulotni, arxitekturani va texnik topshiriqlarni belgiladim, kodni va dizayn xavfsizligini ko‘rib chiqdim hamda haqiqiy qurilmada sinadim. Stek: FastAPI, Flutter, React va PostgreSQL. Claude Haiku vision modeli voucher suratidan tuzilgan ma’lumotni ajratib oladi, haydovchi esa hech narsa saqlanishidan oldin inson tekshiruvi bosqichida uni to‘g‘rilashi mumkin.

## Metod
- Test to‘plamlari: 469 ta backend tekshiruvi, 145 ta Flutter testi va 32 ta panel testi, jami **646 ta avtomatik tekshiruv**.
- Haqiqiy qurilmadagi birinchi tungi sinovda ilova juda kam joylashuv nuqtasini saqladi. Buni telefonning o‘z loglari orqali HyperOS’ning GNSS quvvat tejash xatti-harakatigacha kuzatdim va kuzatuv dizaynini uni aylanib o‘tadigan qilib o‘zgartirdim. Bu tuzatishning haqiqiy telefonda qayta sinovi hali kutilmoqda.

## Natijalar
Uchta to‘plamda 646 ta avtomatik tekshiruv va HyperOS GNSS muammosining hujjatlashtirilgan tekshiruvi. Kod yopiq; case study’da kod ham, mijoz ma’lumotlari ham yo‘q.

## Cheklovlar
- Hozircha ishlab chiqarishda foydalanuvchilar yo‘q; transfer kompaniyasi bilan pilot tayyorlanmoqda.
- Ma’lumot ajratib olish aniqligi o‘lchanmagan.
- Tuzatishdan keyingi haqiqiy telefondagi qayta sinov hali kutilmoqda.

## AI yordami
Kodning ko‘p qismini Claude Code mening texnik topshiriqlarim va ko‘rigim ostida yozgan. Qarorlar, test rejalari va haqiqiy qurilmadagi tekshiruv menga tegishli.
