# Mimaki 3D 列印油墨：為什麼這麼貴、為什麼印得這麼細？

> 研究日期：2026-06-29
> 範圍：Mimaki 3DUJ 系列全彩 UV 噴墨 3D 列印機（3DUJ-553 / 3DUJ-2207）之油墨定價與精細度成因
> 性質：市場/技術調查，數據以多來源交叉查證為主；售價為公開零售參考價，實際視代理商與合約而定。

---

## 一句話結論

Mimaki 不是在賣「塑膠原料」，而是在賣**一整套被精密調校過的化學＋硬體＋色彩管理系統**。
油墨之所以貴，是因為它同時是「成色材料、結構材料、結構支撐」三合一，並用**封閉耗材生態（晶片綁定）+ 刮鬍刀/刀片商業模式**回收龐大研發成本；
印得之所以細，是因為它用**壓電噴頭把 4 皮升（picoliter）的 UV 光固化液滴**逐點疊出物件，層厚低到 20 餘微米，並用 CMYK＋白＋透明墨做出**逾 1,000 萬色**的全彩 voxel 控制。

---

## 一、技術原理：它到底怎麼印的？

Mimaki 3DUJ 走的是 **UV 光固化噴墨（UV-curable inkjet / material jetting）**，跟一般 FDM 擠塑、SLA 槽中固化、SLS 燒結粉末都不同：

1. **壓電噴頭噴出微液滴**：印頭裡的壓電晶體（piezoelectric）施加電壓脈衝，產生壓力差，把液態光聚合物（photopolymer）以**約 4 皮升**的極小液滴精準噴到指定座標。
2. **即噴即固化**：每噴一層，UV-LED 光源立刻照射，引發**光聚合反應（photopolymerization）**——油墨中的光起始劑（photoinitiator）吸收 UV 能量釋放自由基，使單體（monomer）與寡聚物（oligomer）交聯成固態高分子。
3. **逐層堆疊**：一層硬化後再噴下一層，層層相疊直到成形。著色不是事後上色，而是**在堆疊當下就用彩色墨直接成色**，所以顏色是「長在材料裡」的。
4. **水溶性支撐墨**：懸空、複雜結構用另一種**水溶性支撐墨**撐住，印完泡水即可溶除，不會傷到精細的本體。

關鍵點：**同一顆噴頭、同一道工序，同時完成「造形 + 上色 + 支撐」**。這跟先印素模、再噴漆/染色的流程完全不同，也是它能做出細節與全彩兼具的根本原因。

---

## 二、為什麼「印得這麼細、這麼漂亮」？

| 精細度來源 | 規格 / 說明 |
|---|---|
| **超小液滴** | 壓電噴頭噴出 **約 4 皮升**液滴，等於用極細的「點」去描繪物件表面與顏色。 |
| **極薄層厚** | 3DUJ-553 層厚 **22 / 32 / 42µm**（最小層距約 22µm，部分宣傳稱 20µm 級）；3DUJ-2207 約 **28µm**。層越薄，階梯感越不明顯、曲面越平滑。 |
| **高解析度** | 3DUJ-2207 達 **1200 × 1200 dpi**，平面定位非常密。 |
| **逾 1,000 萬色全彩** | CMYK + 白墨打底 + 透明墨，可表現 **1,000 萬種以上顏色**，能做漸層、半透明、擬真膚色與髮絲層次。 |
| **白墨 + 透明墨的價值** | 白墨提供不透光底色讓彩色「顯色準」；透明墨可做透明件、調整每種顏色的透明度、做出光澤或保護層，是擬真感的關鍵。 |
| **顏色長在材料裡** | 著色發生在成形當下而非後處理，顏色不會掉、不會只停在表面。 |
| **水溶性支撐** | 溶除支撐時不刮傷本體，保住髮絲、手指、五官等細節。 |

> 第三方實測比較中，Mimaki 在「結構細節」（髮絲、五官、手指）的清晰度常被評為同級最佳，並帶有高質感的霧面手感。

---

## 三、為什麼油墨「賣這麼貴」？

公開零售參考價（以 MH-100 系列為例）：

| 品項 | 容量 | 參考價（USD） |
|---|---|---|
| MH-100 透明墨（Clear） | 1L | 約 $220 |
| MH-100 彩色/白墨（C/M/Y/K/White） | 1L | 約 $270–$274 |
| MH-100 大瓶 | 4.8L | 約 $707（透明）– $858（白） |
| SW-110 水溶性支撐墨 | 1L | 約 $118 |

換算下來，彩色模型墨約 **每公斤 270 美元上下**——遠高於 FDM 線材（每公斤常見 20–50 美元）或一般樹脂。原因可拆成五層：

1. **耗材本身是高階特殊化學品**
   不是普通塑膠，而是要同時滿足「能穩定噴出 4pl 微滴、低黏度、UV 一照即固、固化後有結構強度、顏色準、不堵頭」等多重矛盾條件的精密配方（單體＋寡聚物＋顏料＋光起始劑＋分散/潤濕添加劑）。配方門檻與品管成本都高。

2. **封閉耗材生態 + 晶片綁定（razor-and-blade 刮鬍刀模式）**
   墨瓶/墨水內含與機器溝通的晶片，第三方或回充墨難以正常使用。廠商用「機器賣得相對便宜、靠耗材長期賺錢」的商業模式回收成本——這跟桌上型印表機墨水貴是同一套邏輯，溢價與「液體本身的原料成本」關係不大，而是回收研發、行銷、硬體補貼。

3. **研發與色彩管理被攤進墨價**
   要做到逾千萬色、跨批次顏色一致，背後是大量的色彩科學、ICC profile、軟體與校色工程。這些 R&D 成本透過耗材長期攤提。

4. **一瓶墨身兼三職，消耗量大**
   它同時是成色材料、結構材料；再加上支撐墨，整個物件幾乎都是「墨」堆出來的。實心或大件作品的吃墨量遠比想像中高，單件材料成本自然墊高。

5. **隱性營運成本**
   除了墨，還有每年數千美元等級的維護合約（AMC）、噴頭保養與清潔耗材等，整體 TCO（總持有成本）高，也讓人覺得「這套東西處處都貴」。

---

## 四、與其他全彩 3D 列印技術比較

| 技術 / 機種 | 廠商 | 全彩能力 | 層厚 | 細節表現 | 著色方式 |
|---|---|---|---|---|---|
| **UV 噴墨（3DUJ）** | **Mimaki** | **1,000 萬+ 色，含白/透明** | **22–42µm** | **同級最佳細節、霧面質感** | 成形當下直接成色 |
| **PolyJet（J55 / J850）** | Stratasys | 全彩，可調透明度 | 低至 **18µm** | 細節接近 Mimaki，表面亮面但燈下較見層紋 | UV 光固化彩色樹脂 |
| **Multi Jet Fusion（580）** | HP | 色彩較有限，偏功能性 | 約 **80µm** | 偏功能件，細緻度較低 | 尼龍粉末 + 助劑熔合 |
| **ColorJet / CJP** | 3D Systems | 全彩（粉末黏結） | 約 **100µm** | 較粗、強度與細節較弱 | 粉末 + 彩色黏結劑 |

要點：

- **Mimaki vs PolyJet**：同屬「UV 光固化噴墨」家族，是真正的高細節全彩雙雄。Stratasys J55 層厚（18µm）甚至略勝，但 Mimaki 在細部結構清晰度與霧面質感上常被評更佳；兩者都遠勝粉末類技術。
- **vs HP MJF / 3D Systems**：粉末類（80–100µm 層厚）強在量產、速度、功能件，但全彩細緻度與擬真感明顯不如 Mimaki/Stratasys。
- 也就是說，Mimaki 的貴與細，本質上是**「噴墨光固化」這條技術路線的特性**——用微液滴換細節，用多色墨換全彩，代價就是耗材貴、單件慢。

---

## 五、給 Bardshop 的實務啟示（白話總結）

- **貴是有來由的，但不是「智商稅」**：你買的不只是塑膠，是一套能一次到位做出全彩、擬真、高細節成品的化學＋硬體＋色彩系統，且廠商靠耗材回收研發。
- **適合的生意**：客製公仔、人像、擬真模型、建築/醫療彩色樣件、需要顏色與細節的精品小批量——這些「細節與全彩就是賣點」的品項，貴墨換來的價值才划得來。
- **不適合的生意**：純功能件、要拚速度與低材料成本的量產——那是 HP MJF / FDM / SLS 的主場。
- **算成本時別只看機器**：要把「墨（成色＋結構＋支撐都吃墨）+ 維護合約 + 吃墨量隨實心度暴增」一起算進單件成本，再回推報價與毛利。

---

## 來源

- [Mimaki 3DUJ-553 產品頁 | MIMAKI](https://mimaki.com/product/3d/3d-inkjet/3duj-553/)
- [3DUJ-553 規格 | MIMAKI](https://mimaki.com/product/3d/3d-inkjet/3duj-553/specification.html)
- [Mimaki 全彩 3D 列印特設頁](https://mimaki.com/special/3d_print/)
- [Mimaki 推出 UV 固化噴墨全彩 3D 列印機 3DUJ-553（新聞稿）](https://mimaki.com/news/product/entry-265157.html)
- [Mimaki 3DUJ-553 規格 | Rapid Scan 3D](https://www.rapidscan3d.com/products/mimaki-3duj-553)
- [Mimaki 3DUJ-553 資料表 (PDF) | Mimaki USA](https://www.mimakiusa.com/wp-content/uploads/2019/10/3DUJ-553-ds-91819.pdf)
- [Mimaki 3DUJ-2207 全彩 3D 列印機 | MatterHackers](https://www.matterhackers.com/store/l/mimaki-3duj-2207-full-color-3d-printer/sk/MSVJD0ZM)
- [Mimaki 3D Model Ink MH-100 售價 | MatterHackers](https://www.matterhackers.com/store/l/mimaki-3d-model-ink-mh-100/sk/MZZ7FKY1)
- [Mimaki Magenta 3D Model Ink MH-100 (2L) | Buffalo Imaging](https://www.buffalous.com/product/mimaki-magenta-3d-model-ink-mh-100-2l/)
- [Mimaki 3D Support Ink SW-110 (1L) | MatterHackers](https://www.matterhackers.com/store/l/mimaki-3d-support-ink-sw-110/sk/M63WPK7J)
- [Mimaki 3D 價格指南 | GreatLight Metal 3D Printing](https://metal-3dprinting.com/mimaki-3d-price-guide/)
- [全彩專業 3D 列印比較：3D Systems vs HP vs Mimaki vs Stratasys | FacFox](https://facfox.com/docs/kb/full-color-pro-3d-printing-3d-systems-vs-hp-vs-mimaki-vs-stratasys)
- [Multi Jet Fusion vs. PolyJet 技術比較 | Cadmore](https://cadmore.com/blog/technical-differences-multi-jet-fusion-vs.-polyjet)
- [Stratasys J850 Prime 全彩 3D 列印機](https://www.stratasys.com/en/3d-printers/printer-catalog/polyjet/j8-series-printers/j850-prime-3d-printer/)
- [UV 壓電噴墨運作原理 | Danmajet](https://danmajet.com/blog/how-does-uv-piezoelectric-inkjet-work/)
- [UV 固化墨關鍵成分與特性 | Andresjet](https://www.andresjet.com/blogs/knowledge/what-are-the-key-components-and-properties-of-uv-curable-ink)
- [UV 固化單體與寡聚物——UV 噴墨墨的骨幹化學 | Wiley](https://onlinelibrary.wiley.com/doi/abs/10.1002/9783527828074.ch6)
- [從封閉材料生態走向開放材料 | 3DPrint.com](https://3dprint.com/306126/moving-from-a-closed-material-ecosystem-to-open-materials-increasing-am-adoption-in-production-and-unleashing-innovation/)
- [刮鬍刀/刀片定價模式回顧 | ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0007681316000124)

> 註：層厚、色數、液滴大小等數字以官方規格與多家經銷/評測交叉比對為準；少數來源在「20µm vs 22µm 最小層厚」「30µm vs 32µm」等措辭上略有出入，屬不同機型/不同表述差異，不影響結論。售價為公開零售參考，實際以正式報價為準。
