---
title: linux 的用户相关的东西
date: 2025-10-08 14:13:35
tags:
  - linux
---

### 查看信息

```sh
getent passwd postgres
```

### 用户组

查看

```sh
cat /etc/group
```

添加组

```sh
groupadd $GROUP
```

删除组

```sh
groupdel $GROUP
```

添加用户到用户组

```sh
gpasswd -a $USER $GROUP
```

用户组里面删除用户

```sh
gpasswd -d $USER $GROUP
```

目录权限

```sh
chown -R $USER $DIR
chgrp -R $GROUP $DIR
```

用户组赋予读写执行权限

```sh
chmod -R ug+w $DIR
chmod -R g=rwx $DIR
chmod -R ugo=rwx $DIR
```

修改 id

```sh
usermod -u $UID $USER
groupmod -g $GID $GROUP
```

修改完以后, 尤其是改完 uid

**一定要** 修改 **被修改 id 的用户** 目录下的文件权限，否则无法登录
