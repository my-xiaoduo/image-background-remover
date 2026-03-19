# Image Background Remover — MVP 需求文档

> 版本：v0.1 | 日期：2026-03-19 | 状态：草稿

---

## 1. 产品概述

### 1.1 产品定位

一个轻量级在线 AI 抠图工具，用户上传图片后一键去除背景，下载透明 PNG。目标用户为电商卖家、设计师、自媒体创作者。

### 1.2 核心价值

- 无需注册，打开即用
- 秒级出图，效果由 remove.bg AI 保障
- 零服务器存储，隐私友好

### 1.3 技术架构

```
前端（静态页面）→ Cloudflare Pages
后端（Edge Function）→ Cloudflare Pages Functions
AI 引擎 → remove.bg API
图片流转 → 全程内存，不落盘
```

---

## 2. 用户故事

| # | 角色 | 需求 | 验收标准 |
|---|------|------|----------|
| U1 | 普通用户 | 上传一张图片去除背景 | 上传后 ≤5s 返回透明 PNG |
| U2 | 普通用户 | 对比处理前后效果 | 页面展示 before/after 滑动对比 |
| U3 | 普通用户 | 下载处理结果 | 点击下载，获得 PNG 文件 |
| U4 | 普通用户 | 了解免费额度 | 页面明确展示免费次数限制 |
| U5 | 用户 | 在手机上使用 | 移动端布局正常，可操作 |

---

## 3. 功能需求

### 3.1 核心功能（必须上线）

#### F1 — 图片上传
- 支持拖拽上传 / 点击选择文件
- 支持格式：JPG、PNG、WebP
- 文件大小限制：≤ 10MB
- 上传后立即触发处理，无需额外点击

#### F2 — 背景去除
- 调用 remove.bg API 处理图片
- 处理过程显示 loading 状态（进度条或 spinner）
- 失败时展示友好错误提示（如：图片过大、API 额度不足）

#### F3 — 效果预览
- 处理完成后展示原图 vs 结果图对比
- 对比方式：左右滑动分割线（slider）
- 结果图背景用棋盘格纹理表示透明区域

#### F4 — 下载
- 提供"下载 PNG"按钮
- 文件名格式：`removed-bg-{原文件名}.png`

#### F5 — 免费额度提示
- 页面展示"每日免费 X 次"说明
- 超出额度时引导用户付费（预留入口，MVP 阶段可跳转等待页）

### 3.2 非功能需求

| 指标 | 目标 |
|------|------|
| 处理响应时间 | ≤ 5s（P90） |
| 页面首屏加载 | ≤ 2s |
| 移动端兼容 | iOS Safari / Android Chrome |
| 可用性 | 依赖 Cloudflare + remove.bg SLA |

---

## 4. 技术规格

### 4.1 前端
- 纯静态 HTML + CSS + Vanilla JS
- 部署到 Cloudflare Pages
- 无需登录/注册系统

### 4.2 后端（Cloudflare Pages Functions）

**接口：POST /api/remove-bg**

```
Request:
  Content-Type: multipart/form-data
  Body: { image: File }

Response (成功):
  Content-Type: image/png
  Body: 透明背景 PNG 二进制流

Response (失败):
  Content-Type: application/json
  Body: { error: "错误描述" }
```

**处理流程：**
1. 接收前端上传的图片（内存）
2. 转发至 remove.bg API（`https://api.remove.bg/v1.0/removebg`）
3. 将返回的 PNG 直接流式返回给前端
4. 全程不写磁盘，不存储任何用户数据

### 4.3 环境变量

| 变量名 | 说明 |
|--------|------|
| `REMOVE_BG_API_KEY` | remove.bg API 密钥，在 Cloudflare 后台配置 |

---

## 5. UI 设计要点

### 页面结构（单页）

```
[Header] Logo + 产品名 + 简短 slogan
[Hero]   上传区域（大拖拽框，虚线边框）
[Result] 处理结果展示区（上传前隐藏）
         ├── Before/After 滑动对比
         └── 下载按钮
[Footer] 免费额度说明 + 隐私声明
```

### 视觉风格
- 简洁白底，突出上传区域
- 主色调：紫色系
- 棋盘格背景用于透明图预览（标准 CSS 实现）

---

## 6. 不在 MVP 范围内

- 用户注册 / 登录
- 批量处理
- 自定义替换背景
- 付费订阅系统（预留入口即可）
- 历史记录
- API 接口（面向开发者）
- 浏览器插件

---

## 7. 上线检查清单

- [ ] remove.bg API Key 配置到 Cloudflare 环境变量
- [ ] 文件大小限制在前端和 Function 两侧均有校验
- [ ] 错误状态均有用户友好提示
- [ ] 移动端测试（iOS Safari + Android Chrome）
- [ ] 页面 meta 信息完整（title、description、og:image）
- [ ] 隐私声明页面（说明不存储用户图片）

---

## 8. 里程碑

| 阶段 | 内容 | 预计工期 |
|------|------|----------|
| M1 | 项目初始化 + CF Pages 部署跑通 | Day 1 |
| M2 | 上传 + remove.bg API 调用 + 下载 | Day 2-3 |
| M3 | Before/After UI + 移动端适配 | Day 4-5 |
| M4 | 错误处理 + 额度提示 + SEO meta | Day 6 |
| M5 | 测试 + 上线 | Day 7 |
