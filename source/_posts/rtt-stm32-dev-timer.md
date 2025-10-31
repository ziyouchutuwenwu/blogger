---
title: rt-thread 下，配置 stm32 的 timer
date: 2025-10-31 08:41:03
tags:
  - stm32
  - rt-thread
---

## 步骤

修改 board/Kconfig，添加 TIM 部分，以下为参考

```sh
menuconfig BSP_USING_TIM
    bool "enable timer"
    default n
    select RT_USING_HWTIMER
    if BSP_USING_TIM
        config BSP_USING_TIM11
            bool "Enable TIM11"
            default n
    endif
```

如果启用的定时器不自带，需要手工修改，修改`libraries/HAL_Drivers/config/f4/tim_config.h`，irq 部分参考 f1 的模板修改

```C
#ifdef BSP_USING_TIM2
#ifndef TIM2_CONFIG
#define TIM2_CONFIG                                        \
    {                                                       \
       .tim_handle.Instance     = TIM2,                    \
       .tim_irqn                = TIM2_IRQn,       \
       .name                    = "timer2",                \
    }
#endif
#endif
```

## menuconfig

```sh
scons --menuconfig 启用 timer 配置
stm32XXxx_hal_conf.h 需要启用 HAL_TIM_MODULE_ENABLED
注意，硬件定时器的 timer 的超时时间结构体内，`秒和微秒不支持小数点`，开发板的时钟一定要设置正确，否则会出现延迟错误
```
