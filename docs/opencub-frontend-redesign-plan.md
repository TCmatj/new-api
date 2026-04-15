# OpenCub 前端改造技术方案

## 1. 目标

将 `/home/ubuntu/new-api/web` 现有前端页面整体改造为 **简约、大气、统一** 的视觉风格，并将项目显示名称统一改为 **OpenCub**，且通过**单一变量源**集中控制，避免后续散落在各页面里逐个修改。

本方案先输出技术设计与实施路径，不直接改业务逻辑。

---

## 2. 当前项目结构与技术现状

### 2.1 技术栈

根据当前代码结构，前端栈为：

- **React 18**
- **Vite 5**
- **React Router 6**
- **Semi UI** (`@douyinfe/semi-ui`)
- **Tailwind CSS**
- **i18next**

### 2.2 当前结构特征

主要入口与关键目录：

- 入口：`web/src/index.jsx`
- 路由：`web/src/App.jsx`
- 全局样式：`web/src/index.css`
- 页面目录：`web/src/pages/*`
- 组件目录：`web/src/components/*`
- 国际化：`web/src/i18n/*`

### 2.3 当前 UI 现状判断

从依赖与样式结构看，当前前端具备以下特点：

1. **Semi UI + 自定义样式混合较多**
   - 已有一定组件化能力，但视觉一致性可能不强。
2. **全局样式体量较大**
   - `src/index.css` 很长，说明历史样式叠加较多，容易出现页面风格不统一。
3. **页面数量较多**
   - 包含 Home、Dashboard、Pricing、Playground、Channel、Token、User、Setting、About、Login/Register 等。
4. **品牌名称可能散落在多个位置**
   - 页面标题、Logo、导航标题、页脚、About、登录页、Setup 页、SEO 文案、国际化文案中都可能存在旧名称。

因此，不建议直接“逐页局部修补”，而应先建立一套**统一的品牌变量 + 设计令牌（Design Tokens）+ 页面模板规范**。

---

## 3. 改造总原则

### 3.1 风格目标

整体风格统一为：

- **简约**：减少装饰性元素、减少高饱和色块、减少无意义阴影
- **大气**：更多留白、卡片更克制、标题层级更清晰
- **一致**：页面头部、操作区、卡片区、列表区、空状态、表单、弹窗统一视觉规范
- **可维护**：所有品牌名称、主色、圆角、阴影、间距规则尽量变量化

### 3.2 实施原则

1. **先统一“设计基础层”，再改页面层**
2. **优先改通用布局和公共组件，再覆盖业务页面**
3. **品牌名称统一从单一配置导出**
4. **尽量不破坏原有业务逻辑与接口调用**
5. **样式改造优先采用增量替换，而非完全推翻重写**

---

## 4. 品牌命名统一方案（OpenCub）

## 4.1 目标

将界面展示名称统一为：

- `OpenCub`

要求：

- 前端显示统一由**单一变量源**控制
- 后续若改名，不需要全项目 grep 后逐个改

## 4.2 推荐实现

新增品牌配置文件，例如：

- `web/src/config/brand.js`

示例结构：

```js
export const BRAND = {
  appName: 'OpenCub',
  appNameLower: 'opencub',
  appDescription: 'Simple and elegant AI gateway console',
  companyName: 'OpenCub',
  supportEmail: '',
};
```

然后所有以下位置统一改为从该配置读取：

- 顶部导航标题
- 登录页/注册页标题
- Home 页 hero 标题
- About 页
- 页面 `<title>`
- 页脚
- 空状态文案
- Setup 页提示文案
- Logo 旁文字
- 可能出现的欢迎语/控制台名称

## 4.3 页面标题建议

增加一个标题工具函数，例如：

- `web/src/helpers/documentTitle.js`

示例：

```js
import { BRAND } from '../config/brand';

export function setDocumentTitle(pageTitle) {
  document.title = pageTitle
    ? `${pageTitle} · ${BRAND.appName}`
    : BRAND.appName;
}
```

这样能统一浏览器标题格式。

---

## 5. 视觉系统方案

## 5.1 设计令牌（Design Tokens）

建议新增统一主题变量层，例如：

- `web/src/styles/theme.css`
- 或拆分到 `web/src/index.css` 顶部 token 区域

建议定义：

### 色彩

```css
:root {
  --oc-bg: #f6f7f9;
  --oc-surface: #ffffff;
  --oc-surface-soft: #fbfbfc;
  --oc-border: #e7eaf0;
  --oc-text: #111827;
  --oc-text-soft: #667085;
  --oc-primary: #111827;
  --oc-primary-soft: #f3f4f6;
  --oc-accent: #2563eb;
  --oc-success: #16a34a;
  --oc-warning: #d97706;
  --oc-danger: #dc2626;
}
```

说明：

- 主体走**低饱和中性色 + 少量深色主色**
- 避免大量彩色块造成“控制台很花”
- 蓝色只作为交互强调色，不做大面积铺色

### 圆角

```css
:root {
  --oc-radius-xs: 8px;
  --oc-radius-sm: 12px;
  --oc-radius-md: 16px;
  --oc-radius-lg: 20px;
}
```

### 阴影

```css
:root {
  --oc-shadow-xs: 0 1px 2px rgba(16, 24, 40, 0.04);
  --oc-shadow-sm: 0 4px 12px rgba(16, 24, 40, 0.06);
  --oc-shadow-md: 0 10px 30px rgba(16, 24, 40, 0.08);
}
```

### 间距系统

统一页面节奏：

- 页面左右边距：24 / 32
- 卡片内边距：20 / 24
- 模块上下间距：16 / 24 / 32
- 页面标题与内容区间隔：24

---

## 5.2 字体与排版

建议保留现有系统字体方向，但统一层级：

- 一级标题：28-32 / 600
- 二级标题：22-24 / 600
- 页面区块标题：16-18 / 600
- 正文：14-15 / 400
- 辅助文案：12-13 / 400

目标：

- 标题更清楚
- 正文不拥挤
- 说明文案更克制

---

## 5.3 组件风格统一规则

### 按钮

- 主按钮：深色实底 / 清晰 hover
- 次按钮：白底 + 细边框
- 危险按钮：保留红色，但减少高饱和面积

### 卡片

- 统一白底
- 轻边框
- 小阴影
- 大圆角
- 卡片顶部标题与操作区对齐

### 表格

- 行高提升一点
- 减少边线压迫感
- 表头浅灰底
- 操作列按钮视觉统一

### 表单

- 输入框高度统一
- 聚焦态边框与阴影统一
- 表单标题与描述距离统一

### 空状态 / 错误状态

- 不要使用过于花哨的插图
- 使用简洁 icon + 1 行标题 + 1 行描述 + 1 个主按钮

---

## 6. 页面改造范围与优先级

## 6.1 第一批：基础框架层（必须先做）

### A. 页面骨架与导航

重点目录：

- `web/src/components/layout/*`
- `web/src/index.css`
- 可能的 Header / Sidebar / PageLayout 组件

改造目标：

- 顶部栏更轻、更简洁
- 侧边栏收敛视觉噪音
- 当前选中项高亮更克制
- 页面内容区增加统一留白与最大宽度控制

### B. 品牌统一

重点位置：

- PageLayout / Header
- 登录页 / 首页 / About
- HTML title / favicon / logo 文本说明

---

## 6.2 第二批：对外展示页（优先改）

### 1. Home

目标：

- 改造成简约 hero 区
- 强化 `OpenCub` 品牌识别
- 弱化杂乱营销信息
- 突出“控制台 / AI 接入 / Playground / 统一网关”核心价值

建议结构：

- Hero 标题
- 简洁副标题
- 主要 CTA
- 3~4 个能力卡片
- 页脚

### 2. Login / Register / Reset

目标：

- 统一认证页面风格
- 居中单卡片布局
- 去除多余视觉噪音
- 使用品牌名 `OpenCub`

### 3. About / Privacy / UserAgreement / NotFound / Forbidden

目标：

- 保持统一版式
- 标题、说明、按钮样式统一

---

## 6.3 第三批：控制台核心页（高价值改造）

### 1. Dashboard

目标：

- 指标卡更克制
- 图表区更干净
- 重要信息前置，次要信息折叠

### 2. Playground

目标：

- 输入区 / 参数区 / 输出区布局更整洁
- 操作按钮统一
- 响应区样式更现代

### 3. Channel / Token / User / Model / Subscription / Log / Setting

目标：

- 列表页采用统一“页面头 + 过滤区 + 表格卡片”模板
- 操作按钮统一尺寸与层级
- 弹窗、抽屉、表单统一视觉

---

## 7. 推荐实施方式

## 7.1 新增品牌配置层

新增：

- `web/src/config/brand.js`
- `web/src/helpers/documentTitle.js`

用途：

- 品牌名统一控制
- SEO / 标题统一控制

## 7.2 新增通用页面容器

新增建议：

- `web/src/components/common/layout/PageShell.jsx`
- `web/src/components/common/layout/PageHeader.jsx`
- `web/src/components/common/layout/SectionCard.jsx`
- `web/src/components/common/feedback/EmptyState.jsx`

这样后续页面改造不用每页自己拼结构。

## 7.3 新增主题样式层

新增建议：

- `web/src/styles/theme.css`
- `web/src/styles/utilities.css`

并在 `src/index.jsx` 或 `src/index.css` 中统一引入。

## 7.4 逐步替换旧页面样式

不建议一次性重写所有页面。

推荐节奏：

1. 品牌变量
2. 全局 token
3. Header / Sidebar / Layout
4. Home + Login/Register
5. Dashboard + Playground
6. 列表型业务页
7. 法务/异常页收尾

---

## 8. 命名与国际化改造策略

项目已有 `i18next`，因此品牌文案改造建议分层处理：

### 8.1 不需要翻译的品牌名

- `OpenCub`

直接来自 `BRAND.appName`

### 8.2 需要翻译的描述文案

例如：

- 欢迎语
- 首页副标题
- 登录提示
- About 描述

放入 i18n 资源中，不要硬编码在组件里。

### 8.3 避免到处手写项目名

错误示例：

```jsx
<h1>Welcome to OpenCub</h1>
```

推荐：

```jsx
<h1>{t('home.welcome', { appName: BRAND.appName })}</h1>
```

---

## 9. 风格规范示例

## 9.1 页面头模板

建议所有后台页统一结构：

- 左侧：页面标题 + 简短说明
- 右侧：主操作按钮 + 次操作按钮

例如：

- `Channel`：标题 + “新增渠道”
- `Token`：标题 + “创建令牌”
- `Model`：标题 + “添加模型”

## 9.2 内容卡片模板

统一为：

- 白底卡片
- 顶部标题行
- 内容区 20~24px padding
- 表格与表单都放入卡片中

## 9.3 控制台色彩使用规范

- 背景：浅灰
- 主要内容：白卡片
- 主按钮：深灰或深蓝
- 提示：低饱和色
- 危险操作：红色但仅在必要处使用

---

## 10. 交付物规划

本次完整改造建议产出如下：

### 文档类

- `docs/opencub-frontend-redesign-plan.md`（本文件）
- 可选：`docs/opencub-design-tokens.md`
- 可选：`docs/opencub-page-mapping.md`

### 代码类

- `web/src/config/brand.js`
- `web/src/helpers/documentTitle.js`
- `web/src/styles/theme.css`
- 若干公共布局组件
- 若干页面改造提交

---

## 11. 实施阶段建议

### Phase 1：基础统一

- 新增品牌变量
- 替换全局项目名显示
- 建立主题 token
- 改造 Header / Sidebar / PageLayout

### Phase 2：核心对外页面

- Home
- Login / Register / Reset
- About / NotFound / Forbidden

### Phase 3：控制台核心页

- Dashboard
- Playground
- Channel / Token / Model / User / Subscription / Setting / Log

### Phase 4：细节收尾

- 空状态
- 弹窗
- 表单校验提示
- 表格工具栏
- 页脚与 SEO 文案

---

## 12. 风险与注意事项

1. **不要直接在大量业务页面中硬编码 `OpenCub`**
   - 必须统一走品牌配置。
2. **不要一次性推翻所有样式**
   - 当前项目已有大量 Semi UI 依赖，硬重写风险高。
3. **注意 i18n 文案同步**
   - 页面标题和按钮文案可能在多语言资源中存在重复项。
4. **不要先改业务逻辑**
   - 本轮应聚焦前端视觉和品牌一致性。
5. **注意 Logo / favicon / 首页图片资源是否要同步替换**
   - 若后续要更彻底品牌升级，可一起处理。

---

## 13. 推荐下一步

在本方案确认后，建议按以下顺序实施：

1. 新增 `brand.js`，统一项目名为 `OpenCub`
2. 建立主题 token 与全局基础样式
3. 先改 `PageLayout / Header / Sidebar`
4. 再改 `Home + Login/Register`
5. 再批量改控制台页面

这样可以在**最少风险**下快速把整体界面风格统一起来。

---

## 14. 本方案结论

本项目适合采用：

- **品牌变量统一控制**
- **设计令牌统一视觉基础**
- **公共布局组件统一页面骨架**
- **分阶段逐页改造**

最终目标是把 `new-api/web` 改造成一个：

- 品牌统一为 **OpenCub**
- 视觉更简约
- 控制台更大气
- 页面更一致
- 后续更易维护

的前端界面系统。
