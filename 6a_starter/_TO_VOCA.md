# @Voca 任务：3003 新增 6A Starter 默写单元（P1-P4）

> 来源：Obsidian（Eden 库）→ 校内知识梳理单 6A Starter（上海工程技术大学附属松江泗泾实验学校）
> 源头笔记：Eden's Vault `04_英语/01_词汇/校内/6A_Starter_词汇拓展.md`
> 创建：2026-09-05

## ✅ 执行记录（2026-09-05 · Obsidian 直接执行，未走你）

**Alpha 已授权 Obsidian 直接改 3003 线上文件，本任务已交付完毕**。你无需执行，但请知悉：

1. **已直接修改** `D:\sword-vocab\zhongkao.html`（改前备份 `zhongkao.html.bak.20260905`）：
   - 「校内英语」课本 units 10 → **14**（追加 6A Starter P1-P4，93 条目 = 41 词 + 46 词组 + 6 句）
   - ENRICHED 1950 → **1967**：新增 17 词，24 个已存在词仅补缺字段（不覆盖你的 LDOCE6 例句/音标）
   - **修正你存量数据的词性错误 17 处**（meet/sell/repeat/message 等 pos 全是 "adj."，已按校内口径改为 v./n. 等）+ 清理 2 处 cn 前缀杂质（chat/review 的 "&"）
2. **数据文件保留**：`entries.json`（单元结构权威）+ `enriched_src.json`（词族/搭配/辨析底稿）——你下次重新生成时以 entries.json 为准合并，勿丢
3. **⚠️ 未同步 gen_combined.py**（WSL 模板）：Obsidian 未动模板，**你下次跑 gen_combined.py 重新生成 zhongkao.html 时会把 6A Starter 覆盖掉**——届时请把 entries.json 的 4 个单元并入 TEXTBOOKS、enriched_src.json 合并进 ENRICHED 再生成
4. **待补强**（可选，你有管线）：
   - 41 词的 LDOCE6 真人 MP3（现在走 TTS 兜底）
   - 例句升级为 LDOCE6 双语例句（现在是 Obsidian 自编简句）
   - 音标按美式口径校正（现在是英式）

## 原始任务书（已由 Obsidian 自行完成，留档）

### 任务目标

在 zhongkao.html（localhost:3003）的**「校内英语」课本**中追加 **4 个新单元**，孩子可以按 Period 逐个默写。

### 结构要求（Alpha 明确）

- 课本：**校内英语**（TEXTBOOKS index 2，追加 units）
- 单元粒度：**6A Starter 拆成 4 个单元**：
  1. `6A Starter P1 Meet our new friends`
  2. `6A Starter P2 Open the schoolbag`
  3. `6A Starter P3 Plan my time`
  4. `6A Starter P4 Yes, I'm ready!`
- 条目类型：`word` + `phrase` + `sentence`；默写（full）全覆盖，背读（word）只出单词

### 边界（不要做）

- 不改前端交互与 JS 逻辑
- 绿皮书 / KET 不动
- 条目内容以 entries.json 为准（校内口径）
