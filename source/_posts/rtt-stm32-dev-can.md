---
title: rt-thread 下，配置 stm32 的 can
date: 2025-10-27 10:18:11
tags:
  - stm32
  - rt-thread
---

## 步骤

修改 board/Kconfig，添加 can 相关部分，以下为参考

```sh
menuconfig BSP_USING_CAN
    bool "enable can"
    default n
    select RT_USING_CAN
    if BSP_USING_CAN
     config BSP_USING_CAN1
        bool "enable CAN1"
        default n
    endif
```

## menuconfig

```sh
scons --menuconfig 启用 can
stm32XXxx_hal_conf.h 需要启用 HAL_CAN_MODULE_ENABLED
```

## 注意

一定要注意 cubeMX 里面的时钟配置`apb1 peripheral clocks`，这个和 PSC, BS1, BS2, SJW, 会共同影响波特率错误，导致收不到数据

波特率计算公式 `baud = APB_PERIPHERAL_CLOCK / ( PSC*( BS1 + BS2 + SJW) )`
