# DeepSeek Harness Plugin: Cursor Agent Theme & YanTi Typography

用于 DeepSeek Harness (DSH) 的定制主题插件，将界面深度定制为 **Cursor Agent 亮色风格**，并将聊天界面的中文字体升级为浑厚刚劲的 **颜体书法字（加粗展示）**。

## 🌟 特性

1. **Cursor Agent 极简浅色主题**
   - 告别原版浅蓝主色调，全面移植 Cursor / VS Code Light 设计语言。
   - 用户提问卡片：极简中性灰色（`#f4f4f5`），圆角规整，边框内敛。
   - 思考过程卡片：Cursor 标志性**米黄色**思考块（奶杏底 `#faf6ec`、米色描边 `#e8dcc0`、金棕侧条 `#c9a227`）。
   - 工具调用与执行节点：药丸型胶囊卡片，搭配代码与路径等宽高亮徽章。
   - 底部输入底栏（Composer Dock）：大圆角悬浮阴影，黑色纯色发送按钮。
   - 代码区域：GitHub / VS Code Light 浅色代码框与语法高亮，严格保持清晰等宽字体。

2. **TODO List → Cursor 多选清单（固定悬浮）**
   - 每条任务渲染为圆形复选框：待办空圈、进行中琥珀圆点、**完成绿色实心圆 + 白色 SVG 对勾（完成一项打一个勾,矢量渲染不依赖字体）**。
   - 已完成任务文案自动变为暖褐 + 删除线。
   - 面板默认自动展开，并固定在输入区上方：**对话如何滚动,TODO List 始终可见**（列表最多占 36vh,过长自滚动）。
   - 实现位置:面板固定在输入底栏的 dock 中（该 dock 本身 sticky 于滚动区底部），并叠加 `position: sticky` 兜底。

3. **聊天界面颜体书法（中粗/加粗增强）**
   - 颜体楷书（颜真卿《多宝塔碑》《颜勤礼碑》书法风格）以“骨肉停匀、横轻竖重、蚕头燕尾”著称。
   - 本插件将字体字重强化为 `font-weight: 600`，并补充了微墨晕效果（`text-shadow: 0 0 0.3px rgba(...)`），使毛笔笔画的厚重力道在现代显示屏上清晰呈现。
   - 字体降级链：华文颜体（STYan） → 方正颜宋/颜体（FZYanSong/FZYanTi） → 汉仪颜楷（HYYanKaiW） → 华文魏碑/楷体加粗（Weibei SC / Kaiti SC 粗体）。

## 📁 目录结构

```text
dsh-plugin-cursor-agent/     # 标准 DSH 组合包（bundle）
├── package.json        # 清单：声明 dsh.bundle.patch（组合包）与导出子路径
├── cordis.patch.yml    # 组合包的 patch：按包名声明两个插件行
├── locale/             # 插件商店展示元信息（meta.title / meta.description）
│   ├── en.json
│   └── zh.json
├── icon.svg            # 插件商店图标
├── README.md / MIGRATION.md
└── lib/
    ├── index.js        # 主插件入口（注入 Cursor 样式 + 读盘 watchdog）
    ├── styles.css      # Cursor Agent 样式层与颜体样式表
    ├── watchdog.js     # 客户端脚本：保证样式优先级 + 自动展开并固定 TODO 清单
    └── todo.js         # 独立插件行（子路径导出 ./todo）：以新模块 URL 绕过宿主模块缓存
```

> 说明：`styles.css` 与 `watchdog.js` 均在每次页面渲染时从磁盘重新读取，因此修改后刷新页面即生效；`todo.js` 作为独立插件行存在，避免宿主对主插件 `index.js` 的 ESM 模块缓存导致脚本更新不生效。

## 📚 官方参考资料

- 官方仓库(Everything is a Plugin):[github.com/deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)
- 插件市场用户指南:[docs/user/guide/plugin-market.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/plugin-market.md)(组合包/bundle 与 Git、npm 安装源)
- 扩展插件形态手册:[docs/cookbook/extension-cookbook.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/extension-cookbook.md)
- 组合包判定(源码):`packages/boot/plugin-manager/src/index.ts` 的 `inspectionOf()` —— `dsh` 存在且 `dsh.bundle` 为非空对象即视为组合包

## 🔌 安装与配置

本包是一个标准 **DSH 组合包（bundle）**：`package.json` 声明了 `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }`，可以由 DeepSeek Harness 插件管理直接安装、启用、卸载与升级。

### 方式一：插件管理页安装（推荐）

1. 打开 DeepSeek Harness → **插件** 页面 → **添加插件**（Add plugin）；
2. 输入以下任一地址：
   - GitHub 仓库：`https://github.com/turboceo/dsh-plugin-cursor-agent`
   - 或本地目录路径：`/你本机的绝对路径/dsh-plugin-cursor-agent`
3. 点击安装；安装完成后**完全退出并重新打开 DeepSeek Harness**（首次安装必须在启动时注册插件）。

安装后插件页会显示组合包详情（名称/描述/图标来自 `locale/` 与 `icon.svg`），并可随时停用/卸载。

### 方式二：GitHub 命令行 + 一键脚本（兜底，不依赖组合包注册）

```bash
git clone https://github.com/turboceo/dsh-plugin-cursor-agent.git
cd dsh-plugin-cursor-agent
bash install.sh
```

脚本会自动：备份 `~/.dsh/profiles/desktop/cordis.patch.yml` → 在顶部写入两条 insert 挂载（绝对路径自动生成）→ 幂等可重复执行。

**安装后请完全退出并重新打开 DeepSeek Harness**（插件在应用启动时注册，首次安装必须重启；重启后刷新页面即可）。

卸载：`bash install.sh --uninstall`（同样需要重启应用生效）。

> 若先在插件页安装过本包，又用脚本方式挂载，会出现相同插件 id 的两组行；插件页安装后请不要再运行 `install.sh`。

### 升级

- 插件页安装：在插件页对组合包执行更新（或卸载后重装）。
- 脚本方式：`cd dsh-plugin-cursor-agent && git pull`，重启一次应用即可；纯 CSS 改动刷新页面即生效。更多细节见 `MIGRATION.md`。
