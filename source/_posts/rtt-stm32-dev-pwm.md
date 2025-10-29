---
title: rt-thread 下，配置 stm32 的 pwm
date: 2025-10-29 09:02:55
tags:
  - stm32
  - rt-thread
---

cubeMX 里面配置的时候，一定要注意，`Clock Source 记得选一下`，默认是 disable; ChannelX 选 `PWM Generation CHX`

一个定时器只能产生一个频率的 pwm，可以产生多个通道 pwm 信号，不同信道可以占空比不同但频率必须相同，否则会被后面启用的 pwm 覆盖

## 步骤

修改 board/Kconfig，添加 pwm 相关部分，以下为参考

```sh
menuconfig BSP_USING_PWM
    bool "enable pwm"
    default n
    select RT_USING_PWM
    if BSP_USING_PWM
    menuconfig BSP_USING_PWM2
        bool "enable timer2 output pwm"
        default n
        if BSP_USING_PWM2
            config BSP_USING_PWM2_CH4
                bool "enable pwm2 channel4"
                default n
        endif
    endif
```

如果启用的 pwm 不自带，需要手工修改，修改`libraries/HAL_Drivers/config/f4/pwm_config.h`

```C
#ifdef BSP_USING_PWM2
#ifndef PWM2_CONFIG
#define PWM2_CONFIG                             \
    {                                           \
       .tim_handle.Instance     = TIM2,         \
       .name                    = "pwm2",       \
       .channel                 = 0             \
    }
#endif
#endif
```

## menuconfig

```sh
scons --menuconfig 启用 pwm
stm32XXxx_hal_conf.h 需要启用 HAL_TIM_MODULE_ENABLED
开发板的时钟一定要设置正确，否则会出现正确的周期和占空比，但是电机转的结果错误
```
