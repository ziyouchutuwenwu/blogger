---
title: rt-thread 下，配置 stm32 的 spi
date: 2025-10-31 08:41:00
tags:
  - stm32
  - rt-thread
---

```sh
mode 选择`Full-Duplex Master`全双工主模式，NSS Signal 选`Disable`即可
接线的时候，MOSI 和 MISO 不需要反接
```

## 步骤

修改 board/Kconfig，添加 SPI 部分，以下为参考

```sh
menuconfig BSP_USING_SPI
    bool "Enable SPI BUS"
    default n
    select RT_USING_SPI
    if BSP_USING_SPI
        config BSP_USING_SPI1
            bool "Enable SPI1 BUS"
            default n

        config BSP_SPI1_TX_USING_DMA
            bool "Enable SPI1 TX DMA"
            depends on BSP_USING_SPI1
            default n

        config BSP_SPI1_RX_USING_DMA
            bool "Enable SPI1 RX DMA"
            depends on BSP_USING_SPI1
            select BSP_SPI1_TX_USING_DMA
            default n
    endif
```

## menuconfig

```sh
scons --menuconfig 启用 spi
stm32XXxx_hal_conf.h 需要启用 HAL_SPI_MODULE_ENABLED
```
