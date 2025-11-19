---
title: linux 内核裁剪之 rootfs
date: 2025-11-19 15:19:13
tags:
  - linux
  - kernel
  - rootfs
---

## 说明

编译成功以后，貌似需要做很多其它的工作

## 步骤

### 源码

```sh
https://busybox.net/downloads/busybox-1.36.1.tar.bz2
```

### menuconfig

```sh
mkdir output

make defconfig
make menuconfig
```

配置静态编译

```sh
# 不然会提示找不到 working dir
Settings  --->
  [*] Build static binary (no shared libs)
```

### 编译

```sh
make -j$(nproc) CONFIG_PREFIX=$(pwd)/../rootfs/ install
```

### 自定义脚本

patch_fs.sh

```sh
#!/bin/bash

if [ "$(id -u)" -ne 0 ]; then
  echo "需要 root 权限。" >&2
  exit 1
fi

TTY_NAME="ttyAMA0"
HOST_NAME="xxx"

# 123456
ROOT_PASSWORD_HASH='$1$B3A6v4ws$ydvwSpAz0PYhYss1WOxOy1'

BUSYBOX_SRC_DIR="$(pwd)/busybox-1.36.1"
WORK_DIR="$(pwd)/"
ROOTFS_DIR="$(pwd)/rootfs"
IMAGE_NAME="rootfs.ext4"
IMAGE_SIZE_MB=32
TEMP_MOUNT_DIR="${WORK_DIR}/fs_mnt_tmp"

cleanup() {
    echo "清理临时挂载点（如果存在）..."
    if mountpoint -q "${TEMP_MOUNT_DIR}"; then
        umount "${TEMP_MOUNT_DIR}"
    fi
    rm -rf "${TEMP_MOUNT_DIR}"
    echo "清理完成。"
}

echo "开始执行 BusyBox rootfs 准备脚本 (以 root 权限运行)..."
set -e

if [ ! -d "${BUSYBOX_SRC_DIR}" ]; then
    echo "错误：BusyBox 源码目录 ${BUSYBOX_SRC_DIR} 未找到！"
    exit 1
fi

mkdir -p "${ROOTFS_DIR}"
echo "Rootfs 目录: ${ROOTFS_DIR}"
echo "输出镜像文件: ${WORK_DIR}/${IMAGE_NAME}"

echo "--- 检查 BusyBox 安装 ---"
BUSYBOX_EXEC_PATH="${ROOTFS_DIR}/bin/busybox"
if [ ! -x "${BUSYBOX_EXEC_PATH}" ]; then
    echo "错误：${BUSYBOX_EXEC_PATH} 不存在或不可执行！"
    echo "请提前准备好 BusyBox 安装到 ${ROOTFS_DIR} 目录。"
    exit 1
fi
echo "BusyBox 主程序 (${BUSYBOX_EXEC_PATH}) 存在且可执行。"

echo "使用 'file' 命令检查 BusyBox 可执行文件类型："
file "${BUSYBOX_EXEC_PATH}"

INIT_PATH_FOUND=""
if [ -L "${ROOTFS_DIR}/sbin/init" ] && [ "$(readlink -f "${ROOTFS_DIR}/sbin/init")" = "${BUSYBOX_EXEC_PATH}" ]; then
    INIT_PATH_FOUND="${ROOTFS_DIR}/sbin/init"
elif [ -L "${ROOTFS_DIR}/bin/init" ] && [ "$(readlink -f "${ROOTFS_DIR}/bin/init")" = "${BUSYBOX_EXEC_PATH}" ]; then
    INIT_PATH_FOUND="${ROOTFS_DIR}/bin/init"
fi

if [ -z "${INIT_PATH_FOUND}" ]; then
    echo "错误：未找到指向 busybox 的 init 符号链接！"
    exit 1
fi
echo "init 程序 (${INIT_PATH_FOUND}) 存在且正确链接到 busybox。"

if ! ([ -L "${ROOTFS_DIR}/bin/sh" ] && [ "$(readlink -f "${ROOTFS_DIR}/bin/sh")" = "${BUSYBOX_EXEC_PATH}" ]); then
    echo "错误：${ROOTFS_DIR}/bin/sh 未正确链接到 busybox！"
    exit 1
fi
echo "sh 程序 (${ROOTFS_DIR}/bin/sh) 存在且正确链接到 busybox。"
echo "BusyBox 安装验证通过。"

cd "${ROOTFS_DIR}"

# 创建必需目录
mkdir -p dev dev/pts dev/shm etc lib usr/bin usr/sbin usr/lib var/log var/run var/tmp home root mnt proc sys tmp

# 建立 usr -> bin, sbin, lib 软连接（如果不存在）
if [ -d usr/bin ] && [ ! -e bin ]; then ln -sf usr/bin bin; fi
if [ -d usr/sbin ] && [ ! -e sbin ]; then ln -sf usr/sbin sbin; fi
if [ -d usr/lib ] && [ ! -e lib ]; then ln -sf usr/lib lib; fi

echo "--- 创建配置文件 ---"

cat > etc/profile << EOF
PATH=/bin:/sbin:/usr/bin:/usr/sbin
export LD_LIBRARY_PATH=/lib:/usr/lib
/bin/hostname ${HOST_NAME}
USER=root
LOGNAME=\$USER
HOSTNAME=\$(/bin/hostname)
PS1='[\u@\h \W]\\# '
EOF

cat > etc/inittab << EOF
::sysinit:/etc/init.d/rcS

#${TTY_NAME}::respawn:/sbin/getty -L ${TTY_NAME} 115200 vt100

# 免密
${TTY_NAME}::respawn:/bin/sh </dev/${TTY_NAME} >/dev/${TTY_NAME} 2>&1

::restart:/sbin/init
::ctrlaltdel:/sbin/reboot
::shutdown:/bin/umount -a -r
::shutdown:/sbin/swapoff -a
EOF

cat > etc/fstab << EOF
proc            /proc           proc      defaults          0       0
sysfs           /sys            sysfs     defaults          0       0
devtmpfs        /dev            devtmpfs  mode=0755,nosuid  0       0
tmpfs           /tmp            tmpfs     defaults          0       0
tmpfs           /dev/shm        tmpfs     defaults          0       0
none            /var            ramfs     defaults          0       0
devpts          /dev/pts        devpts    gid=5,mode=0620   0       0
EOF

echo "${HOST_NAME}" > etc/hostname

cat > etc/passwd << EOF
root:x:0:0:root:/root:/bin/sh
EOF
chmod 644 etc/passwd

cat > etc/group << EOF
root:x:0:
EOF
chmod 644 etc/group

cat > etc/shadow << EOF
root:${ROOT_PASSWORD_HASH}:10933:0:99999:7:::
EOF
chmod 600 etc/shadow

mkdir -p etc/init.d
cat > etc/init.d/rcS << EOF
#!/bin/sh
mkdir -p /tmp
mkdir -p /dev/pts
mkdir -p /dev/shm
/bin/mount -a
if [ -f /etc/hostname ]; then
    /bin/hostname -F /etc/hostname
fi
EOF
chmod +x etc/init.d/rcS

cd "${WORK_DIR}"

echo "--- 创建并填充磁盘镜像 ${WORK_DIR}/${IMAGE_NAME} ---"

rm -f "${WORK_DIR}/${IMAGE_NAME}"
echo "正在创建空磁盘镜像 (${IMAGE_SIZE_MB}MB)..."
dd if=/dev/zero of="${WORK_DIR}/${IMAGE_NAME}" bs=1M count=${IMAGE_SIZE_MB} status=progress

echo "正在将磁盘镜像格式化为 ext4..."
mkfs.ext4 -F "${WORK_DIR}/${IMAGE_NAME}"

mkdir -p "${TEMP_MOUNT_DIR}"

echo "正在将loop设备挂载到 ${TEMP_MOUNT_DIR}..."
mount -o loop "${WORK_DIR}/${IMAGE_NAME}" "${TEMP_MOUNT_DIR}"

echo "正在从 ${ROOTFS_DIR} 复制 rootfs 内容到镜像..."
rsync -a --delete "${ROOTFS_DIR}/" "${TEMP_MOUNT_DIR}/"

echo "正在卸载 loop 设备..."
umount "${TEMP_MOUNT_DIR}"
rmdir "${TEMP_MOUNT_DIR}"

echo "--- Rootfs 镜像已创建: ${WORK_DIR}/${IMAGE_NAME} ---"
echo "Rootfs 内容也保留在: ${ROOTFS_DIR}"
echo ""
echo "构建过程完成！"
echo "您现在可以将 ${WORK_DIR}/${IMAGE_NAME} 用于 QEMU 或其他目标系统。"

exit 0
```

### 测试

append 后面的 root 不能缺

```sh
qemu-system-arm \
  -M vexpress-a9 \
  -m 512M \
  -kernel ~/downloads/linux-5.10.191/output/arch/arm/boot/zImage \
  -dtb ~/downloads/linux-5.10.191/output/arch/arm/boot/dts/vexpress-v2p-ca9.dtb \
  -nographic \
  -append "root=/dev/mmcblk0 rw console=ttyAMA0" \
  -sd ~/downloads/rootfs.ext4
```
