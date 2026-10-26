# 迁移指南：将插件复制到其它机器

本插件是一个**标准 DSH 组合包(bundle)**:`package.json` 声明了 `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }`。迁移只有两步:**让目标机拿到这份代码** + **用插件管理安装它**。

---

## 方式 A：插件管理页安装（推荐，无需命令行）

目标机打开 DeepSeek Harness → **插件** 页面 → **添加插件**，输入以下任一地址：

- GitHub 仓库：`https://github.com/turboceo/dsh-plugin-cursor-agent`
- 或本地目录：`/你的/绝对路径/dsh-plugin-cursor-agent`

点击安装后**完全退出并重新打开 DeepSeek Harness** 即可生效。插件页可停用/卸载/更新该组合包；显示的名称、描述与图标来自包内 `locale/` 和 `icon.svg`。

---

## 方式 B：整包拷贝 + 手动挂载（不依赖插件页的兜底方式）

### 第一步:拷贝插件文件夹

把整个 `dsh-plugin-cursor-agent/` 目录(含 `lib/`、`locale/`、`icon.svg`、`cordis.patch.yml`、`package.json`、`README.md`)复制到目标机任意位置。

> 推荐放到与本机相同的位置,可省去改路径:
> `/Users/<用户名>/Documents/deepseek-harness/default-workspace/dsh-plugin-cursor-agent`

文件权限已统一为 `644`(所有用户可读),不受机器/用户差异影响。

### 第二步:在目标机上挂载(核心)

在目标机编辑用户级配置文件:

```
~/.dsh/profiles/desktop/cordis.patch.yml
```

在**文件顶部**(`- insert:` 下)添加两个条目,**路径改成目标机上插件的真实绝对路径**:

```yaml
- insert:
    - id: dsh-plugin-cursor-agent
      name: "/你的/绝对路径/dsh-plugin-cursor-agent/lib/index.js"
    - id: dsh-plugin-cursor-agent-todo
      name: "/你的/绝对路径/dsh-plugin-cursor-agent/lib/todo.js"
```

> 两个条目缺一不可:
> - `dsh-plugin-cursor-agent` 负责注入 Cursor 亮色主题 + 颜体字体 + TODO 清单样式;
> - `dsh-plugin-cursor-agent-todo` 负责 TODO 面板的自动展开脚本(它用独立入口,避免模块缓存放不下新脚本)。
>
> 若目标机该文件里已有内容(设置项、模型列表等),只新增 **insert** 部分,不要动其它行;设置界面改配置会往后追加行,不会删掉 insert。

### 第三步:生效

1. 完全退出并重新打开 DeepSeek Harness(插件在应用启动时加载;CSS 改动刷新页面即可,换机后首次必须重启应用以注册新插件);
2. 打开任意对话页面,输入区上方应出现自动展开的米黄色 TODO 清单卡片;
3. 检查:思考内容为米黄卡片、任务完成出现绿色圆 + SVG 勾、对话滚动时 TODO 固定不动。

---

## 常见问题

| 现象 | 原因与处理 |
| --- | --- |
| 刷新后没有任何变化 | 路径写错或 insert 被删:检查 yml 中 name 路径拼写、应用是否重启过 |
| 只有部分效果生效(比如样式有但 TODO 不自动展开) | `todo.js` 条目缺失:补上第二个 insert 并重启应用 |
| 应用重启后主题又没了 | 设置界面把 patch 文件重写导致的旧现象:重新加 insert 条目即可 |
| 字体不是颜体效果 | 目标机没装颜体类字体。字体按名称降级检索(华文颜体→方正颜体→汉仪颜楷→魏碑/楷体粗体),落到楷体也保持书法感;想要原效果,在目标机安装「华文颜体」或「汉仪颜楷简」 |
| 想自定义样式 | 只改 `lib/styles.css`(颜色/字号/间距),保存后刷新页面即时生效,无需重启 |

---

## 架构备忘(为什么这么设计)

- `styles.css` / `watchdog.js` 在**每次页面渲染时从磁盘读取**,修改后刷新即生效——这是"廉价热更新"的关键;
- 宿主会对插件入口模块(ESM)按 URL 做缓存,改 `index.js` 不重启不生效;因此可执行脚本独立成 `todo.js` 新入口,保证新机器首次加载即用最新代码;
- 所有样式用属性选择器(`[data-testid="todo-panel"]` 等)定位,不依赖应用内部 hash 类名,防应用升级失效。