---
title: rt-thread 下，配置 stm32 的脉冲编码器
date: 2025-10-29 09:02:51
tags:
  - stm32
  - rt-thread
---

cubeMX 里面配置，选某定时器 TIM ,比如 TIM3，Combined Channels 里面，选择 Encoder Mode，记住下面 gpio 部分的两个引脚

## 步骤

修改 board/Kconfig，添加 pulse encoder 相关部分

以下为参考

```sh
menuconfig BSP_USING_PULSE_ENCODER
    bool "enable pulse encoder"
    default n
    select RT_USING_PULSE_ENCODER
    if BSP_USING_PULSE_ENCODER
        config BSP_USING_PULSE_ENCODER3
            bool "enable pulse encoder3"
            default n
    endif
```

如果启用的 pulse encoder 不自带，需要手工修改

修改`libraries/HAL_Drivers/config/f4/pulse_encoder_config.h`

```C
#ifdef BSP_USING_PULSE_ENCODER3
#ifndef PULSE_ENCODER3_CONFIG
#define PULSE_ENCODER3_CONFIG                          \
    {                                                  \
       .tim_handler.Instance    = TIM3,                \
       .encoder_irqn            = TIM3_IRQn,           \
       .name                    = "pulse3"             \
    }
#endif
#endif
```

## menuconfig

```sh
scons --menuconfig 启用 pulse encoder
stm32XXxx_hal_conf.h 需要启用 HAL_TIM_MODULE_ENABLED
```

## 注意

如果发现旋转过程中突然产生了很大的数，需要改一下驱动

`libraries/HAL_Drivers/drv_pulse_encoder.c`, `，pulse_encoder_init`方法内, `sConfig.IC1Filter` 和 `sConfig.IC2Filter` 都改成最大 15

但是不能根本解决，根本上解决的话，需要滤波电容。
