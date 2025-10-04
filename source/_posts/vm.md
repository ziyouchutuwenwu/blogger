---
title: virt-manager
date: 2025-10-04 08:01:20
tags:
---

## 权限问题

说明

| Group        | 用途说明                                            |
| ------------ | --------------------------------------------------- |
| libvirt      | `virt-manager` 管理虚拟机<br>`virsh` CLI 管理虚拟机 |
| libvirt-qemu | `libvirt` 启动 vm `qemu-system-*`                   |
| kvm          | 手动运行 `qemu-system-xxx` 用                       |

查看 group 有没有

```sh
getent group kvm
getent group libvirt
getent group libvirt-qemu
```

如果你的 vm 目录不是标准目录，建议

```sh
/etc/libvirt/qemu.conf
```

```conf
user = "xxx"
```

## 网络配置

NAT

```sh
10.0.2.0/24
```

隔离网络

```sh
192.168.56.0/24
```

虚拟机 nic 里面添加两个网卡

nat 网卡

/etc/network/interfaces.d/nat

```sh
auto enp1s0
iface enp1s0 inet dhcp
```

或者

```sh
auto enp1s0
iface enp1s0 inet static
   address 10.0.2.15/24
   gateway 10.0.2.1
```

或者

```sh
auto enp1s0
iface enp1s0 inet static
   address 10.0.2.15
   netmask 255.255.255.0
   gateway 10.0.2.1
```

host-only 网卡

/etc/network/interfaces.d/host_only

```sh
auto enp2s0
iface enp2s0 inet static
   address 192.168.56.11/24
```

指定网关

如果双网卡都配置了网关，则需指定默认网关

否则由于加载顺序的原因，默认网关可能为 host-only，无法访问外网

```sh
/etc/network/interfaces
```

最后一行添加

```sh
ip route add 10.0.2.0/24 via 10.0.2.1 dev enp1s0
```

dns 配置

如果需要手动指定 dns

```sh
sudo systemctl stop NetworkManager
```

或者

```sh
/etc/NetworkManager/NetworkManager.conf
```

```ini
[main]
dns=none
```

手动设置 dns

```sh
/etc/resolv.conf
```

```sh
nameserver 223.5.5.5
nameserver 223.6.6.6
```

重启网络

```sh
sudo systemctl restart networking
```

检查路由

```sh
sudo route -n
```

## vm 增强

用于共享剪贴板，分辨率自适应

物理机

debian

```sh
sudo apt install qemu-guest-agent
```

manjaro

```sh
yay -S spice-guest-tools-windows
```

虚拟机

win

虚拟机挂载驱动, 对应在物理机上的路径

```sh
/usr/share/spice-guest-tools/spice-guest-tools.iso
```

vm 最好使用 qxl 作为显卡，不然缩放会出问题

debian

虚拟机安装

```sh
sudo apt install spice-vdagent
```

manjaro

虚拟机安装

```sh
sudo pacman -S spice-vdagent
```

## win7

必须在物理机上安装这个，否则无法安装 win7 虚拟机

```sh
pacman -S virtio-win
```

smb 共享

```sh
安装 smb 客户端
net use z: \\192.168.56.1\smb
net use * /del /y
```
