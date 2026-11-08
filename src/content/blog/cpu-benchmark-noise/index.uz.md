---
title: "Birinchi CPU benchmarkim nega foydalanib bo‘lmas darajada shovqinli edi va uni qanday tuzatdim"
description: "Nazoratsiz noutbuk benchmarkini qanday qilib takrorlanadigan INT8 va FP32 o‘lchovlariga aylantirdim: qat’iy chastota, qotirilgan yadrolar, sovitish va barqarorlik qoidasi."
date: 2026-11-05
draft: false
---
Birinchi benchmark raqamlarim o‘rinli ko‘rindi, to‘g‘risi, bir xil narsani ikki marta ishga tushirib, turli javob olgunimcha. Bu maqola buning sababini qanday aniqlaganim va biror raqamga ishonishdan oldin nimani o‘zgartirganim haqida.

Barcha raqamlar [cpu-inference-bench](https://github.com/diyor-ai/cpu-inference-bench) repozitoriysining README’sidan (shu jumladan "First attempt (archived)" bo‘limidan) va `results/archive_summary.json` faylidan olingan.

## Birinchi urinish yaroqsiz edi

Men ResNet-18’ni PyTorch, ONNX Runtime va OpenVINO’da noutbuk CPU’sida (Intel i7-12650H) standart sozlamalar bilan ishga tushirishdan boshladim. Takrorlanuvchanlikni tekshirish uchun har bir konfiguratsiyani ikki martadan ishga tushirdim. Takrorlangan 18 qatordan 12 tasida ikki bir xil ishga tushirish orasidagi farq 5% dan oshdi, bir qatorda (PyTorch, 12 thread, batch 1) esa 48.27% gacha yetdi. Natijalar taqqoslash uchun yaroqsiz edi, shuning uchun ularni arxivladim.

Noutbukda paket quvvati va termal chegaralar bor, shuning uchun chastota ish davomida o‘zgaradi. Buni nazorat qilmasa, frameworklar orasidagi bir necha foizlik farq shovqin doirasida qoladi.

## Sababni topish

Birinchi urinishda standart chastota boshqaruvi ishlatilgan edi, ya’ni chastota erkin o‘zgara olardi. Bu CPU’ning doimiy paket quvvati chegarasi 45 W, qisqa muddatli chegarasi 115 W, va shunga o‘xshash quvvat hamda termal chegaralar ish davomida chastotani o‘zgartirishi mumkin. Fon xizmatlari va yadrolarni bo‘lishadigan boshqa jarayonlar ham shovqin qo‘shishi mumkin.

O‘sha urinish ma’lumotlari lokal arxivlangan va ommaviy repoda yo‘q, shuning uchun bu yerda har bir ishga tushirishning chastotalari yoki haroratlarini ko‘rsata olmayman. Qaysi omil ustun kelganini taxmin qilish o‘rniga, sozlamani shunday o‘zgartirdimki, har bir omil nazorat qilinadigan yoki ko‘rinadigan bo‘ldi: endi har bir takror paket haroratini, P-yadrolarning o‘rtacha va minimal chastotasini hamda yadroning termal-throttle hisoblagichlarini yozib boradi.

## Hali ham yetarli bo‘lmagan pilot

P-yadrolarni 3000 MHz bilan cheklab, kichik pilot o‘tkazdim. To‘rt qatordan ikkitasida yadroning termal-throttle hisoblagichlari baribir oshdi, shuning uchun yadrolar bardosh bera oladigan chastota sifatida 2600 MHz’ni tanladim.

## Nimani o‘zgartirdim

Barcha e’lon qilingan ishga tushirishlarda:

- 6 ta P-yadroda qat’iy 2600 MHz chastota, SMT juftliklari o‘chirilgan; bu eng yuqori emas, yadrolar ushlab tura oladigan barqaror chastota;
- qotirilgan yadrolar, tarmoq quvvati va to‘xtatilgan fon xizmatlari;
- har takrordan oldin paket harorati 60 °C dan pasayguncha sovitish kutish;
- navbatlashtirilgan raundlar, shunda siljish barcha frameworklarga bir xil ta’sir qiladi;
- barqarorlik qoidasi: qator faqat 5 ta takror bo‘yicha tarqoqligi 5% dan kam bo‘lsa va hech bir termal-throttle hisoblagichi oshmagan bo‘lsagina barqaror.

Tezlashuv nisbatlari faqat ikkita barqaror qator orasida chiqariladi. Barqaror bo‘lmagan qatorlar tashlab yuborilmaydi, balki ko‘rsatiladi va belgilanadi.

## Bu menga nima berdi

Shu nazoratlar bilan ResNet-18 INT8 va FP32, batch 1’da 2.34× (PyTorch), 2.74× (ONNX Runtime) va 3.48× (OpenVINO, 2.6 ms) chiqdi. 36 ta BERT qatoridan beshtasi va 18 ta ResNet qatoridan 2 tasi (ikkalasi ham FP32) hali ham barqaror emas edi va README buni aytadi.

## U nimani ko‘rsatmaydi

Termal hisoblagichlar quvvat chegarasi sabab throttle’ni aniqlamaydi, shuning uchun chastota ustunlarini ham tekshirdim. Barcha ishga tushirishlar davomida VPN klienti ishlab turdi va uning ta’sirini o‘lchamadim. Bu bitta noutbuk va bitta kampaniya.

## Bundan nimani o‘rgandim

- Biror narsani taqqoslashdan oldin bir xil konfiguratsiyani ikki marta ishga tushiring.
- Barqaror bo‘lmagan natijalarni yashirmasdan e’lon qiling.
- Nimani nazorat qilmaganingizni yozib qo‘ying (bu yerda: quvvat chegaralari, VPN).

Kod Claude Code yordamida yozilgan; metodologiya, qarorlar va tekshiruv menga tegishli.
