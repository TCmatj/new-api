# 在线绘图台实施方案（v1）

## 目标

在 **不修改 `new-api` 后端** 的前提下，新增一个“在线绘图台”：

- 保留现有 `/console/image-workbench` 作为 **静态绘图台**
- 新增 `/console/online-image-studio` 作为 **在线绘图台**
- 在线绘图台前端调用独立后端服务 `image-studio`
- `image-studio` 在本机内通过 `http://127.0.0.1:3001` 调用 `new-api`
- 绘图实际执行、鉴权、分组、渠道选择、计费仍由 `new-api` 完成
- `image-studio` 负责任务化包装、图片短期存储（7天）、提示词长期保存、任务历史查询

## 关键约束

1. **不走公网 HTTPS 回源**：`image-studio` 只能本地访问 `new-api`，避免 tunnel / Cloudflare 超时。
2. **使用方案 A**：用户必须自行确保输入的 token 属于可用分组（例如 `Image2`）。
3. **不额外兜底分组切换**：若 token 不在对应分组内，直接透传 `new-api` 报错给前端。
4. **前端只提示，不强改逻辑**：在线绘图台的 token 输入框明确提示“请使用已加入 Image2 分组的 token”。
5. **静态绘图台保留现状**：仍用于直接调用与调试，不迁移为任务化。
6. **前端变更先部署测试环境**：优先走 `3002` 前端测试环境，确认后再考虑生产。

## 页面划分

### 1. 静态绘图台
- 路由：`/console/image-workbench`
- 定位：直接调接口的调试/静态工作台
- 保持现有 Base URL + Token 配置逻辑

### 2. 在线绘图台
- 路由：`/console/online-image-studio`
- 定位：任务化绘图台，适合正式使用
- 功能：
  - 文生图
  - 图生图
  - 任务创建
  - 任务状态查询
  - 结果图查看
  - 最近任务列表
  - Prompt 长期保存
  - 图片 7 天过期

## 调用链路

### 文生图
1. 浏览器请求 `image-studio`
2. `image-studio` 创建任务并立即返回 `task_id`
3. 后台 worker 调用：
   - `POST http://127.0.0.1:3001/v1/images/generations`
   - Header: `Authorization: Bearer <user_token>`
4. `new-api` 完成鉴权/分组/计费/relay
5. `image-studio` 保存结果图与任务记录
6. 前端轮询查看状态

### 图生图
1. 浏览器上传原图到 `image-studio`
2. `image-studio` 落地输入文件并创建任务
3. 后台 worker 调用：
   - `POST http://127.0.0.1:3001/v1/images/edits`
   - Header: `Authorization: Bearer <user_token>`
4. 其余流程相同

## 存储策略

### 长期保存
- `tasks.json`：任务元数据
- `prompts.json`：提示词记录

### 7 天保留
- `media/outputs/*`：生成结果图片
- `media/inputs/*`：用户上传原图（如有）

### 清理策略
- 在服务启动和每次列表请求前执行轻量清理：
  - 删除超过 7 天的输入/输出文件
  - 标记任务中对应文件失效
  - 保留 prompt / task 元信息

## 最小 API（image-studio）

### `GET /healthz`
健康检查

### `POST /api/tasks/image-generations`
创建文生图任务

请求体：
```json
{
  "token": "sk-xxx",
  "prompt": "...",
  "model": "gpt-image-2",
  "size": "1024x1024",
  "quality": "high",
  "background": "auto",
  "output_format": "png",
  "n": 1
}
```

### `POST /api/tasks/image-edits`
创建图生图任务（multipart）

字段：
- token
- prompt
- model
- size
- quality
- background
- output_format
- n
- image（文件）

### `GET /api/tasks`
最近任务列表

### `GET /api/tasks/:id`
任务详情

### `GET /media/...`
访问落地图片

## 错误处理

- `new-api` 返回什么错误，`image-studio` 尽量直接回传 message
- 对于 token 不在分组、模型不可用、配额不足等，不做隐藏包装
- 前端直接展示错误信息即可

## 前端提示文案

在线绘图台的 Token 输入框旁提示：

> 请使用已加入 Image2 分组的 token；若 token 不在可用分组内，将直接返回后端报错。

## 部署策略

### 前端
- 先执行：`/home/ubuntu/new-api/bin/rebuild-frontend-test.sh`
- 测试地址：`http://127.0.0.1:3002/console/online-image-studio`

### 新后端
- 先作为独立本地服务运行在：`127.0.0.1:3010`
- 前端测试环境通过 Nginx 代理 `/studio-api/` 与 `/studio-media/`

## 后续可增强项

- prompt 收藏/标签/搜索
- 任务取消
- 失败重试（注意与计费次数一一对应）
- 会话恢复与继续编辑
- 换成 SQLite/PostgreSQL 持久化
