---
title: mise
date: 2025-10-05 14:55:49
tags:
---

多版本管理工具，支持多种后端，自动选择，更好用

安装命令

```sh
curl https://mise.run | sh
```

~/.profile

```sh
# 普通配置
eval "$(mise activate zsh)"

# cursor 下
if [[ "$TERM_PROGRAM" == "vscode" && "$CHROME_DESKTOP" == "cursor.desktop" && -z "$CURSOR_INITED" ]]; then
    # echo "cursor shell"
    export CURSOR_INITED=1
    sh -c $SHELL
else
    # 系统 shell
    eval "$(mise activate zsh)"
fi
```

所在路径

```sh
$HOME/.local/bin/mise
$HOME/.config/mise/
$HOME/.local/share/mise/
$HOME/.local/state/mise/
```

搜索

```sh
mise search xxx
mise ls

# 可以看 tag
mise ls-remote node
```

安装并且写入 toml

```sh
mise use node@22
mise use -g node@lts

# 从 toml 里面删除
mise unuse node@22
```

安装卸载

```sh
mise install node@22
mise uninstall node@22
```

更新

```sh
mise self-update
```
