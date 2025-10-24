---
title: zig 构建相关
date: 2025-10-06 17:40:58
tags:
  - zig
---

## 交叉编译

同时可以支持静态编译

查看

```sh
zig targets | grep musl
```

命令行交叉编译

```sh
zig build -Dtarget=x86_64-linux-musl --summary all --release=small
```

作为其它语言的交叉编译器

```sh
CC="zig cc -target x86_64-linux-musl" CXX="zig c++ -target x86_64-linux-musl"
```

```sh
CC="zig cc -target x86_64-linux-gnu.2.31" CXX="zig c++ -target x86_64-linux-gnu.2.31"
```

## 自定义构建

使用 musl, 无依赖

```zig
const default_target = std.Target.Query{
    // .cpu_arch = std.Target.Cpu.Arch.x86_64,
    // .os_tag = std.Target.Os.Tag.linux,
    .abi = std.Target.Abi.musl,
};
const target = b.standardTargetOptions(.{
    .default_target = default_target,
});
```

指定 release 使用方式

```zig
const optimize = b.standardOptimizeOption(.{
    .preferred_optimize_mode = std.builtin.OptimizeMode.ReleaseSmall,
});
```

## 编译为动态库

build.zig

```zig
const lib = b.addSharedLibrary(.{
    .name = "demo",
    .root_source_file = b.path("src/root.zig"),
    .target = target,
    .optimize = optimize,
  });
```
