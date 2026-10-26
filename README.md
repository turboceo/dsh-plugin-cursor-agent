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
dsh-plugin-cursor-agent/
├── package.json        # 插件元信息与导出声明
├── README.md           # 插件说明文档
└── lib/
    ├── index.js        # 主插件入口（注入 Cursor 样式 + 读盘 watchdog）
    ├── styles.css      # Cursor Agent 样式层与颜体样式表
    ├── watchdog.js     # 客户端脚本：保证样式优先级 + 自动展开并固定 TODO 清单
    └── todo.js         # 独立入口：以新模块 URL 绕过宿主模块缓存，实时注入 watchdog
```

> 说明：`styles.css` 与 `watchdog.js` 均在每次页面渲染时从磁盘重新读取，因此修改后刷新页面即生效；`todo.js` 作为独立入口存在，避免宿主对主插件 `index.js` 的 ESM 模块缓存导致脚本更新不生效。

## 🔌 安装与配置

### 方式一：一键脚本（推荐）

```bash
git clone https://github.com/turboceo/dsh-plugin-cursor-agent.git
cd dsh-plugin-cursor-agent
bash install.sh
```

脚本会自动：备份 `~/.dsh/profiles/desktop/cordis.patch.yml` → 在顶部写入两条 insert 挂载（绝对路径自动生成）→ 幂等可重复执行。

**安装后请完全退出并重新打开 DeepSeek Harness**（插件在应用启动时注册，首次安装必须重启；重启后刷新页面即可）。

卸载：`bash install.sh --uninstall`（同样需要重启应用生效）。

### 方式二：手动挂载

在 DSH 的用户配置文件（`~/.dsh/profiles/desktop/cordis.patch.yml`）顶部挂载本插件（路径改为你本机实际路径）：

```yaml
- insert:
    - id: dsh-plugin-cursor-agent
      name: "/你本机的绝对路径/dsh-plugin-cursor-agent/lib/index.js"
    - id: dsh-plugin-cursor-agent-todo
      name: "/你本机的绝对路径/dsh-plugin-cursor-agent/lib/todo.js"
```

保存配置文件后，重启 DeepSeek Harness（CSS 类改动后续刷新页面即生效）。

### 升级

```bash
cd dsh-plugin-cursor-agent
git pull
```

升级后无需重装：`styles.css` / `watchdog.js` 每次渲染读盘，刷新页面即生效；若 `index.js` / `todo.js` 有更新，重启一次应用即可。更多细节见 `MIGRATION.md`。
