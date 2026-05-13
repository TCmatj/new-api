# new-api 后端同步策略（保护已改前端）

适用场景：
- 你已经对 `web/` 前端做了大量定制。
- 你希望继续吸收上游 `new-api` 的后端更新。
- 你不希望在拉新代码时覆盖自己的前端改动。

## 核心原则

**只同步后端路径，不同步 `web/`。**

这样做的好处：
- 前端定制不会被上游覆盖。
- 后端仍能按需跟进上游修复与新功能。
- 冲突面显著缩小，回滚更简单。

## 推荐流程

### 1. 配置上游 remote（只需一次）

当前仓库的 `origin` 是你自己的 fork：

```bash
git remote -v
```

为原始上游仓库增加 `upstream`（URL 按实际情况替换）：

```bash
git remote add upstream <UPSTREAM_GIT_URL>
```

如果你想用官方上游，候选通常是：

- `git@github.com:Calcium-Ion/new-api.git`
- 或 `git@github.com:QuantumNous/new-api.git`

> 先确认你要跟的是哪一个，不要盲加。

### 2. 先预览，再同步

仓库内已提供脚本：

```bash
PREVIEW_ONLY=1 ./bin/sync-backend-only.sh
```

它会：
- `fetch upstream`
- 显示远端新提交
- 显示与当前分支的文件差异
- 列出将要同步的后端路径
- **不会实际改文件**

### 3. 确认无误后执行同步

```bash
./bin/sync-backend-only.sh
```

它会只同步这些后端路径：

- `common`
- `constant`
- `controller`
- `dto`
- `i18n`
- `logger`
- `middleware`
- `model`
- `oauth`
- `pkg`
- `relay`
- `router`
- `service`
- `setting`
- `types`
- `main.go`
- `go.mod`
- `go.sum`
- `Dockerfile`
- `docker-compose.yml`
- `makefile`
- `VERSION`
- `bin`

**不会触碰：**
- `web/`
- 你的前端页面与样式定制

### 4. 检查并提交

```bash
git status
git diff --stat
git commit -m "chore(sync): pull backend updates from upstream"
```

### 5. 需要时再推送

```bash
git push origin main
```

## 为什么这是当前最优解

相对于直接 `merge upstream/main` 或 `rebase upstream/main`：

- 不会把上游 `web/` 变更冲进来
- 不需要反复解决大批前端冲突
- 能保留你现在的 OpenCub 前端定制路线
- 适合“前端强定制，后端跟上游”的长期维护模式

## 注意事项

1. **先提交本地改动，再做同步**
   - 避免本地脏工作区把同步过程搞乱。

2. **同步后要重点检查这些文件**
   - `go.mod`
   - `go.sum`
   - `Dockerfile`
   - `docker-compose.yml`
   - `setting/`
   - `relay/`
   - `model/`

3. **`bin/` 目录也会同步**
   - 这是为了保留后端运维脚本更新。
   - 但如果你后面把 `bin/` 用作大量本地自定义脚本目录，建议把本脚本改成只同步明确白名单文件，而不是整个 `bin/`。

4. **如果上游未来把前后端耦合得更紧**
   - 例如后端接口字段变化依赖前端同步修改，仍需人工评估。
   - 这套方案的目标是“降低误伤”，不是消灭所有集成成本。

## 常用命令

查看远端新增提交：

```bash
git fetch upstream --prune
git log --oneline HEAD..upstream/main
```

仅预览后端同步：

```bash
PREVIEW_ONLY=1 ./bin/sync-backend-only.sh
```

执行后端同步：

```bash
./bin/sync-backend-only.sh
```
