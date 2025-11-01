---
title: rt-thread 下，配置 stm32 的 watchdog
date: 2025-11-01 10:24:24
tags:
  - stm32
  - rt-thread
---

## 步骤

修改 board/Kconfig，添加 watchdog 相关部分，以下为参考

```sh
config BSP_USING_WDT
    bool "Enable Watchdog Timer"
    select RT_USING_WDT
    default n
```

## menuconfig

```sh
scons --menuconfig 启用 watchdog
stm32XXxx_hal_conf.h 需要启用 HAL_IWDG_MODULE_ENABLED
```
