#!/usr/bin/env bash
# ============================================================================
# dsh-plugin-cursor-agent — 一键安装脚本
# 用法:
#   bash install.sh             # 安装(幂等,可重复执行)
#   bash install.sh --uninstall # 卸载(移除两个挂载条目)
#
# 原理:向 ~/.dsh/profiles/desktop/cordis.patch.yml 顶部写入两个 insert 条目,
#       绝对路径自动生成为脚本所在目录,无需手改。
# 环境变量 DSH_PROFILE_PATCH 可覆盖自定义 patch 文件路径。
# ============================================================================
set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INDEX_JS="$PLUGIN_DIR/lib/index.js"
TODO_JS="$PLUGIN_DIR/lib/todo.js"
PATCH="${DSH_PROFILE_PATCH:-$HOME/.dsh/profiles/desktop/cordis.patch.yml}"

for f in "$INDEX_JS" "$TODO_JS"; do
  if [ ! -f "$f" ]; then
    echo "✘ 找不到 $f —— 请确认在插件目录内运行本脚本" >&2
    exit 1
  fi
done

echo "插件目录: $PLUGIN_DIR"
echo "目标配置: $PATCH"
mkdir -p "$(dirname "$PATCH")"
[ -f "$PATCH" ] || touch "$PATCH"

# 备份
BACKUP="$PATCH.bak.$(date +%Y%m%d%H%M%S)"
cp "$PATCH" "$BACKUP"
echo "已备份: $BACKUP"

python3 - "$PATCH" "$INDEX_JS" "$TODO_JS" "${1:-install}" <<'PY'
import sys

patch, index_js, todo_js, action = sys.argv[1:5]
IDS = ("id: dsh-plugin-cursor-agent", "id: dsh-plugin-cursor-agent-todo")

def esc(p: str) -> str:
    return '"' + p.replace("\\", "\\\\").replace('"', '\\"') + '"'

def ident(ln: str) -> str:
    """去掉 YAML 列表横杠与空白,得到纯条目 id。"""
    return ln.strip().lstrip("-").strip()

def has_entry(text: str) -> bool:
    return IDS[0] in text and IDS[1] in text

with open(patch, "r", encoding="utf-8") as f:
    lines = f.readlines()

text = "".join(lines)

if action == "--uninstall":
    if not has_entry(text):
        print("未检测到安装记录,无需卸载")
        sys.exit(0)
    # 移除:两个 id 行 + 紧随其后的 name 行 + 直接包裹它们的 "- insert:" 行
    drop = set()
    for i, ln in enumerate(lines):
        if ident(ln) in ("insert:", "insert"):
            # 只处理后面跟着我们条目的 insert 块
            j = i + 1
            while j < len(lines) and (not lines[j].strip() or lines[j].lstrip().startswith("#")):
                j += 1
            if j < len(lines) and ident(lines[j]) in IDS:
                drop.add(i)
        if ident(ln) in IDS:
            drop.add(i)
            if i + 1 < len(lines) and lines[i + 1].lstrip().startswith("name:"):
                drop.add(i + 1)
    kept = [ln for i, ln in enumerate(lines) if i not in drop]
    with open(patch, "w", encoding="utf-8") as f:
        f.writelines(kept)
    print("✔ 已卸载:移除 2 个挂载条目")
    print("  ⚠ 请重启 DeepSeek Harness 使卸载生效")
    sys.exit(0)

# 安装(幂等)
if has_entry(text):
    print("✔ 插件已安装,无需重复操作(如需重装先执行 --uninstall)")
    sys.exit(0)

block = (
    "- insert:\n"
    f"    - {IDS[0]}\n"
    f"      name: {esc(index_js)}\n"
    f"    - {IDS[1]}\n"
    f"      name: {esc(todo_js)}\n"
)

# 插到第一个非注释内容之前,保证仍是合法顶层 YAML 列表
head, i = "", 0
while i < len(lines) and (not lines[i].strip() or lines[i].lstrip().startswith("#")):
    head += lines[i]
    i += 1
rest = "".join(lines[i:])

with open(patch, "w", encoding="utf-8") as f:
    f.write(head + block + rest)
print("✔ 已写入挂载条目(2 个 insert)")
PY

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo "  安装完成!请【完全退出并重新打开 DeepSeek Harness】:"
echo "    插件在应用启动时注册,首次安装必须重启应用。"
echo "    重启后刷新网页,输入区上方应出现米黄色 TODO 清单卡片。"
echo "══════════════════════════════════════════════════════════════════"