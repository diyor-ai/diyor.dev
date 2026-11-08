---
title: CPU Inference Benchmark
summary: Bitta noutbuk CPU’sida PyTorch, ONNX Runtime va OpenVINO, FP32 va INT8 taqqoslanadi, o‘lchash metodi nazorat ostida.
order: 1
stats: [["3.48×", "ResNet-18 INT8 va FP32, OpenVINO"], ["2.6 ms", "OpenVINO INT8, batch 1"]]
tags: [PyTorch, ONNX Runtime, OpenVINO, NNCF]
repo: https://github.com/diyor-ai/cpu-inference-bench
---
<!-- REVIEW: translation -->
## Muammo
Noutbuk CPU’sida frameworklarni taqqoslashda xatoga yo‘l qo‘yish oson: quvvat va termal chegaralar ish davomida chastotani o‘zgartirib turadi. Men PyTorch, ONNX Runtime va OpenVINO uchun ishonish va takrorlash mumkin bo‘lgan INT8 va FP32 raqamlarini olmoqchi edim.

## Nima qildim
Intel i7-12650H’da ResNet-18 va ikkita kichik SST-2 BERT oilasi modelini (DistilBERT va BERT-mini) benchmark qildim; faqat 6 ta P-yadro ishlatildi, ular qat’iy 2.6 GHz chastotada qotirilgan. ONNX Runtime, OpenVINO NNCF va PyTorch yordamida INT8 post-training quantization (statik va dinamik) qo‘lladim, profillash uchun `torch.profiler`, ONNX Runtime profiling va OpenVINO `PERF_COUNT` ishlatdim. Loyiha doirasi — inference, kvantlash va profillash; o‘qitish kirmaydi.

## Metod
Birinchi, nazoratsiz urinishim yaroqsiz bo‘ldi: takrorlangan 18 qatordan 12 tasida ikki bir xil ishga tushirish orasidagi farq 5% dan oshdi. 3000 MHz’dagi pilot ham 4 qatordan 2 tasida termal-throttle hisoblagichlarini oshirdi. Yakuniy ishga tushirishlarda qat’iy chastota, qotirilgan yadrolar, har takrordan oldin sovitish va barqarorlik qoidasi qo‘llanadi: qator faqat tarqoqligi 5% dan kam bo‘lsa va hech bir throttle hisoblagichi oshmagan bo‘lsagina barqaror hisoblanadi. Nisbatlar faqat barqaror qatorlar orasida chiqariladi. Aniqlik o‘zgarishlari paired bootstrap va McNemar testi bilan baholandi, BERT taqqoslashlarida Bonferroni tuzatishi qo‘llandi.

## Natijalar
- ResNet-18, batch 1’da INT8 va FP32: PyTorch **2.34×**, ONNX Runtime **2.74×**, OpenVINO **3.48×**. OpenVINO INT8 bitta rasmga **2.6 ms** ga yetadi.
- ResNet-18 top-1 o‘zgarishi: −0.6 dan −0.9 punktgacha, 1000 ta rasmda statistik jihatdan ahamiyatsiz.
- DistilBERT va BERT-mini (SST-2): INT8 **1.10–3.12×** tezroq. Bonferroni tuzatishidan keyin aniqlikdagi farqlar ahamiyatsiz.

<figure class="chart-fig">
<svg class="chart" viewBox="0 0 360 214" role="img" aria-label="ResNet-18, INT8 ning FP32 ga nisbatan tezlashuvi, batch 1 (yuqori — yaxshiroq): PyTorch 2.34×; ONNX Runtime 2.74×; OpenVINO 3.48×">
<text class="c-label" x="0" y="16">PyTorch</text>
<rect class="c-bar" x="0" y="24" width="180.5" height="26" rx="4"/>
<text class="c-val" x="188.5" y="43">2.34×</text>
<text class="c-label" x="0" y="78">ONNX Runtime</text>
<rect class="c-bar" x="0" y="86" width="211.4" height="26" rx="4"/>
<text class="c-val" x="219.4" y="105">2.74×</text>
<text class="c-label" x="0" y="140">OpenVINO</text>
<rect class="c-bar" x="0" y="148" width="268.5" height="26" rx="4"/>
<text class="c-val" x="276.5" y="167">3.48×</text>
<line class="c-base" x1="77.1" y1="20" x2="77.1" y2="186"/>
<text class="c-note" x="83.1" y="206">FP32 = 1×</text>
</svg>
<figcaption>ResNet-18, INT8 ning FP32 ga nisbatan tezlashuvi, batch 1 (yuqori — yaxshiroq)</figcaption>
</figure>

## Cheklovlar
- Har bir frameworkning standart INT8 yo‘li taqqoslanadi, bir xil kvantlash emas. Masalan, BERT’da OpenVINO e’tibor (attention) MatMul’larini ham kvantlaydi.
- Tezlashuv sababini (masalan, VNNI) tekshirmadim. Kernel nomlari buni hal qilmaydi.
- Bitta noutbuk, bitta CPU, eng yuqori emas, barqaror 2.6 GHz chastota. ResNet-18 aniqligi 1000 ta rasmlik tanlanmada o‘lchangan.
- Barcha ishga tushirishlar davomida VPN klienti ishlab turdi; uning ta’siri o‘lchanmagan.

## AI yordami
Kod Claude Code yordamida yozilgan; metodologiya, qarorlar va tekshiruv menga tegishli.
