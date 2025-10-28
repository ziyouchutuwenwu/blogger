---
title: rt-thread 下，配置 stm32 的 i2c
date: 2025-10-28 08:35:48
tags:
  - stm32
  - rt-thread
---

修改 board/Kconfig，添加 i2c 的配置部分，以下为参考

```sh
menuconfig BSP_USING_I2C1
    bool "Enable I2C1 BUS (software simulation)"
    default n
    select RT_USING_I2C
    select RT_USING_I2C_BITOPS
    select RT_USING_PIN
    if BSP_USING_I2C1
        config BSP_I2C1_SCL_PIN
            int "i2c1 scl pin number"
            range 1 216
            default 22
        config BSP_I2C1_SDA_PIN
            int "I2C1 sda pin number"
            range 1 216
            default 23
    endif
```

## 步骤

```sh
scons --menuconfig 启用 i2c
stm32XXxx_hal_conf.h 需要启用 HAL_I2C_MODULE_ENABLED
i2c 需要从机的地址，可以看手册，也可以通过 i2c-tools
```

## 注意

```sh
目前 i2c 均为软件模拟 i2c
不需要在 cubeMX 里面的引脚配置
直接 Kconfig 里面配置即可
```

## 测试命令

```sh
i2c scan
i2c read
i2c write
```
