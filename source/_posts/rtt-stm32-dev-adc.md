---
title: rt-thread 下，配置 stm32 的 adc
date: 2025-10-26 10:00:50
tags:
  - stm32
  - rt-thread
---

## 步骤

修改 board/Kconfig，添加 adc 相关部分，以下为参考

```sh
menuconfig BSP_USING_ADC
    bool "enable ADC"
    default n
    select RT_USING_ADC
    if BSP_USING_ADC
     config BSP_USING_ADC1
        bool "enable ADC1"
        default n
    endif
```

如果启用的 adc 不自带，需要手工修改

修改`libraries/HAL_Drivers/config/f4/adc_config.h`

```C
#ifdef BSP_USING_ADC1
#ifndef ADC1_CONFIG
#define ADC1_CONFIG                                                 \
    {                                                               \
       .Instance                   = ADC1,                          \
       .Init.ClockPrescaler        = ADC_CLOCK_SYNC_PCLK_DIV4,      \
       .Init.Resolution            = ADC_RESOLUTION_12B,            \
       .Init.DataAlign             = ADC_DATAALIGN_RIGHT,           \
       .Init.ScanConvMode          = DISABLE,                       \
       .Init.EOCSelection          = DISABLE,                       \
       .Init.ContinuousConvMode    = DISABLE,                       \
       .Init.NbrOfConversion       = 1,                             \
       .Init.DiscontinuousConvMode = DISABLE,                       \
       .Init.NbrOfDiscConversion   = 0,                             \
       .Init.ExternalTrigConv      = ADC_SOFTWARE_START,            \
       .Init.ExternalTrigConvEdge  = ADC_EXTERNALTRIGCONVEDGE_NONE, \
       .Init.DMAContinuousRequests = DISABLE,                       \
    }
#endif
#endif
```

## menuconfig

```sh
scons --menuconfig 启用 adc
stm32XXxx_hal_conf.h 需要启用 HAL_ADC_MODULE_ENABLED
```
