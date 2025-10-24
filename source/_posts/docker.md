---
title: docker
date: 2025-10-09 09:11:41
tags:
  - docker
---

### 基本用法

```sh
docker run -it xxx /bin/bash
docker run --rm xxx
docker rmi xxx --force
```

自动重启

```sh
docker run --restart=always xxxx
```

环境变量

```sh
docker run xxxx -e TZ=Asia/Shanghai
```

以某个用户名启动

```sh
docker run -u root
```

指定用户进入 shell

```sh
docker exec -it -u root xxx bash
```

默认是 root, 有时候希望不是

```sh
docker run -it --user $(id -u ${USER}):$(id -g ${USER}) xxx
```

默认 root 有些权限用不了

```sh
docker run -it --privileged xxx
```

清理

```sh
truncate -s 0 /var/lib/docker/containers/*/*.log
```

查看资源

查看 cpu，内存等等

```sh
docker stats
```

### 构建

```sh
docker build -t xxx ./ --no-cache
```

构建时使用变量

多阶段构建,需要在每个阶段都写一遍

```sh
ARG MIX_ENV
ENV MIX_ENV=${MIX_ENV}
```

例子

Dockerfile

```dockerfile
# 构建阶段
FROM debian:12.5 as builder

ARG MIX_ENV
ENV MIX_ENV=${MIX_ENV}

WORKDIR /build
COPY . .

ADD ./deploy/ustc.list /etc/apt/sources.list


# 运行阶段
FROM debian:12.5 as runner

WORKDIR /app

ARG MIX_ENV
ENV MIX_ENV=${MIX_ENV}
```

构建

```sh
docker build --build-arg MIX_ENV=test -t demo ../ --no-cache
```

### 同步时区

构建时

DockerFile

```sh
RUN rm -f /etc/localtime \
&& ln -sv /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
&& echo "Asia/Shanghai" > /etc/timezone
```

运行时

```sh
docker run xxx -v /etc/localtime:/etc/localtime -e TZ=Asia/Shanghai
```

或者

```sh
docker run xxx -v /usr/share/zoneinfo/Asia/Shanghai:/etc/localtime -e TZ=Asia/Shanghai
```

### 自定义存储路径

ntfs 分区不支持

```sh
/etc/docker/daemon.json
```

```json
{
  "data-root": "/mnt/vdb/docker"
}
```

### 导入导出

容器保存为 tar，比 save 保存的文件小很多

```sh
docker export ${CONTAINER_ID} > xxx.tar
```

从容器 tar 还原为 image

```sh
docker import xxx.tar image_name:tag
```

当前容器直接保存为 image

```sh
docker commit ${CONTAINER_ID} image_name:tag
```

保存 image 为 tar 包，使用 tag 保存，不然 load 的时候，会显示 `<none>`

```sh
docker save -o xxx.tar redis:5.0.0
```

tar 包还原为 image，不可以重命名，这里的 tar 是指`docker images`保存出的 tar

```sh
docker load -i xxx.tar
```
