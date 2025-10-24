---
title: 远程桌面
date: 2025-10-03 18:39:38
tags:
  - linux
---

## win 远程 linux

### rdp

linux 上配置，使用微软的远程工具连接

以 manjaro 为例

```sh
echo "Updating system..."
sudo pacman -Syu

echo "Installing xrdp and xorgxrdp-git..."
sudo pacman -Sy yay base-devel xorg-xserver-devel
yay -S xrdp xorgxrdp

echo "Configuring Xwrapper..."
echo "allowed_users=anybody" | sudo tee -a /etc/X11/Xwrapper.config

echo "Configuring .xinitrc..."
sed -i 's/^\(SESSION=${1:-xfce-session}\)$/#\1 # original\nSESSION=${1:-xfce4-session}/' ~/.xinitrc
sed -i 's/^\s*\(local dbus_args=(--sh-syntax --exit-with-session)\)$/#\1 # original\nlocal dbus_args=(--sh-syntax)/' ~/.xinitrc
sed -i 's/^\(exec $(get_session "$1")\)$/#\1 # original\nexec $(get_session "$SESSION")/' ~/.xinitrc

echo "Enabling xrdp service..."
sudo systemctl enable --now xrdp.service
```

### vnc

windows 用 vnc 客户端

安装

```sh
sudo pacman -S x11vnc
sudo apt install x11vnc -y
```

服务

```sh
/usr/local/lib/systemd/system/vnc.service
```

```ini
[Unit]
Description=vnc
After=multi-user.target

[Service]
Type=simple
# ExecStart=x11vnc -auth guess -forever -loop -noxdamage -scale 0.9x0.9 -passwd 90909090 -repeat -shared -o /var/log/x11vnc.log
ExecStart=x11vnc -auth guess -forever -noxdamage -scale 0.9x0.9 -passwd 90909090

[Install]
WantedBy=multi-user.target
```

开机启动

```sh
systemctl enable vnc --now
```

## linux 远程 win

一句话

```sh
rdesktop xx.xx.xx.xx:3389
```
