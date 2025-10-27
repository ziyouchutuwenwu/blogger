---
title: rt-thread 下，配置 stm32 的 dac
date: 2025-10-27 10:18:16
tags:
  - stm32
  - rt-thread
---

## 配置

修改 board/Kconfig，添加 dac 相关部分，以下为参考

```sh
menuconfig BSP_USING_DAC
    bool "Enable DAC"
    default n
    select RT_USING_DAC
    if BSP_USING_DAC
        config BSP_USING_DAC1
            bool "Enable DAC1"
            default n
    endif
```

## 如果启用的 dac 不自带，需要手工修改，步骤如下

```sh
复制
libraries/HAL_Drivers/config/h7/dac_config.h
到
libraries/HAL_Drivers/config/f4/dac_config.h
```

```sh
修改
libraries/HAL_Drivers/drv_config.h
搜索
defined(SOC_SERIES_STM32F4)
添加
#include "f4/dac_config.h"
```

修改 `libraries/STM32F4xx_HAL/SConscript`, 添加

```sh
if GetDepend(["RT_USING_DAC"]):
    src += ["STM32F4xx_HAL_Driver/Src/stm32f4xx_hal_dac.c"]
    src += ["STM32F4xx_HAL_Driver/Src/stm32f4xx_hal_dac_ex.c"]
```

## menuconfig

```sh
使用 cubeMX 配置项目, 启用 dac 和对应的 channel
scons --menuconfig 启用 dac
stm32XXxx_hal_conf.h 需要启用 HAL_ADC_MODULE_ENABLED
```
