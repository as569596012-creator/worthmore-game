---
name: daily-summary
description: >-
  Generate or update today's completed-work summary as a dated Markdown file in
  the project's summaries folder, based on all of this project's conversations
  today. Use when the user asks 今天做了什么 / 总结今天 / 今日总结 / 日报 /
  daily summary / "生成今天的摘要".
---

# 今日总结 (Daily Summary)

总结当前项目**今天**完成的工作，并写入/更新一个带日期的 Markdown 摘要文件。数据来源是本项目今天的所有对话记录（agent transcripts）。

## 数据来源

- 本项目的对话记录（past chats）存在该项目的 **agent-transcripts** 文件夹，结构为 `agent-transcripts/<uuid>/<uuid>.jsonl`，每个 `.jsonl` 是一次完整会话。
- 智能体的系统上下文里有该文件夹的绝对路径（形如 `...\.cursor\projects\<项目标识>\agent-transcripts`）。本项目标识是 `c-codes-gg`。
- 用文件修改时间或 `.jsonl` 内条目的时间戳，筛出属于"今天"的会话。

## 输出文件（重点）

- 摘要统一存到项目根目录的 **`每日总结/`** 文件夹（不存在则新建）。
- 每天一个文件，**文件名自带日期**：`每日总结/YYYY-MM-DD.md`。
- 行为类似 `任务清单.md`：
  - 今天的文件**不存在** → 按下方模板新建。
  - 今天的文件**已存在** → 读取后**增量更新**：补充本次对话新出现的完成项，刷新顶部时间；**保留用户手动编辑的内容，不整篇重写、不删除已有条目**。

## 步骤

1. 从当前对话上下文的 `<timestamp>` 取今天日期 `YYYY-MM-DD`。
2. 在本项目 agent-transcripts 文件夹里，找今天产生/修改的 `.jsonl` 会话文件（含当前这次对话）。
3. 读取这些会话，提取四类信息：完成了什么、做了哪些关键决定、改动/部署了什么、还有什么没做完。
4. 读取 `每日总结/YYYY-MM-DD.md`（若有），按模板**新建或增量更新**该文件。
5. 简述刚刚写入/更新了什么。

## 文件模板

```markdown
# 今日总结 YYYY-MM-DD · <项目名>
> AI 维护 · 可手动编辑 · 最后更新 YYYY-MM-DD HH:MM

## 完成了
- ...

## 关键决定
- ...

## 改动 / 部署
- 文件、提交、上线等

## 待办 / 明天接着做
- ...
```

## 规则

- **只总结今天、本项目**：不混入其它项目或往日的内容。
- **基于真实记录，不臆造**：记录里没有的不写；拿不准的标注"（待确认）"。
- **增量更新**：同一天多次调用时，在已有文件上补充，不重写、不丢失人工编辑。
- **引用过往会话**用 `[<不超过6词的标题>](<uuid>)` 格式，uuid 去掉 `.jsonl`；**只引用父会话 uuid，绝不引用子会话/subagent**。
- 总结要简洁、按重要性排序，抓主线，不要逐条复述每次工具调用。
