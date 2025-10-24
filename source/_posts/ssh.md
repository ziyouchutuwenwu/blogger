---
title: ssh 的一些用法
date: 2025-10-02 07:39:34
tags:
  - linux
  - freebsd
---

## 配置密钥

生成公钥

最好指定密钥文件名，默认是在 ~/.ssh 下面

```sh
ssh-keygen -t rsa -b 4096 -C "xxx@xxx.com" -f ~/downloads/key
```

私钥权限必须是 600

```sh
chmod 600 ~/downloads/*
```

上传公钥

```sh
ssh-copy-id -i ~/downloads/key.pub root@192.168.56.11
```

服务器上公钥的保存路径

```sh
# /etc/ssh/sshd_config
AuthorizedKeysFile ~/.ssh/authorized_keys
```

用私钥连接

```sh
ssh -i ~/downloads/key root@192.168.56.11
```

## 免密登陆

启动 agent

```sh
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

~/.profile

```sh
if ! pgrep -u "$USER" ssh-agent > /dev/null; then
    eval "$(ssh-agent -s 2> /dev/null | grep -v 'Agent pid')" > /dev/null
    trap 'ssh-agent -k > /dev/null 2>&1' EXIT
fi
ssh-add ~/downloads/keys/key > /dev/null 2>&1
```

连接

```sh
# 连接服务器 A
ssh -A root@xx.xx.xx.xx

# 成功以后，在当前 shell 内，连接服务器 B
ssh root@yy.yy.yy.yy
```

## 指纹更新

服务器无法登录，提示 fingerprint 更新

删除 `~/.ssh/known_hosts`

或者

```sh
ssh-keygen -R $SERVER_IP:$SERVER_PORT
```

## autossh

本地隧道

原来需要远程访问的服务，变为本地访问的服务

TARGET_IP 和 VPS_IP 可以不相同

```sh
autossh -M 0 -i ./keys/id_rsa \
  -o "StrictHostKeyChecking no" \
  -o "ServerAliveInterval 30" \
  -CfNg -L $LOCAL_IP:$LOCAL_PORT:$TARGET_IP:$TARGET_PORT \
  root@$VPS
```

把服务转发给其它机器

```sh
autossh -M 0 -i ./keys/id_rsa \
  -o "StrictHostKeyChecking no" \
  -o "ServerAliveInterval 30" \
  -CfNg -R $NEW_SERVER_PORT:$OLD_SERVER_IP:$OLD_SERVER_PORT \
  root@$NEW_SERVER_IP
```

## 远程 gui

远程 ssh 执行 gui,在本地显示

远程机器

```sh
# linux
sed -i 's/^#X11Forwarding no/X11Forwarding yes/' /etc/ssh/sshd_config

# freebsd
sed -i "" 's/^#X11Forwarding no/X11Forwarding yes/' /etc/ssh/sshd_config
```

本地

```sh
ssh -YC xxx@xx.xx.xx.xx
```
