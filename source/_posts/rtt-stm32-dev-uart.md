---
title: rt-thread 下，配置 stm32 的 uart
date: 2025-11-01 10:24:19
tags:
  - stm32
  - rt-thread
---

## 注意

cubeMX 导出配置，引脚位置在 xxxx_hal_msp.c 中

## 步骤

参考下面的改 board/Kconfig

```sh
menuconfig BSP_USING_UART
    bool "Enable UART"
    default y
    select RT_USING_SERIAL
    if BSP_USING_UART
        config BSP_USING_UART1
            bool "Enable UART1"
            default y
        config BSP_UART1_RX_USING_DMA
            bool "Enable UART1 RX DMA"
            depends on BSP_USING_UART1 && RT_SERIAL_USING_DMA
            default n
    endif
```

## menuconfig

```sh
scons --menuconfig 启用 uart，默认启用
stm32XXxx_hal_conf.h 需要启用 HAL_UART_MODULE_ENABLED
```
