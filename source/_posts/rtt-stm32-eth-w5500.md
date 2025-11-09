---
title: rt-thread 下，配置 stm32 的 w5500 网卡
date: 2025-11-05 14:14:34
tags:
  - stm32
  - rt-thread
---

配置 w5500 网卡接入网络

## 物理接线

cubeMX 里面的 nss 脚貌似不需要接，cubeMX 里面的 sck 脚是对应模块的 sclk 脚

模块的 scs 脚接的位置就是, rt_hw_spi_device_attach 的`最后两个参数的值`

开发板和模块之间的 MISO 和 MOSI `不需要反接`

## cubeMX 配置

启用 spi1

设置 Mode 为 Full Duplex Master

设置 Hardware NSS Signal 为 output 模式

## menuconfig 配置

参考驱动配置，在 board/Kconfig 里面启用 spi1 的配置

配置 iot packages 里面的 wiznet 部分

```sh
RT-Thread online packages --->
  IoT - internet of things --->
    WIZnet: WIZnet TCP/IP chips SAL framework imlement --->
      WIZnet device configure
         (spi10) SPI device name
         (10) Reset PIN number (NEW)
         (11) IRQ PIN number (NEW)
```

参数说明

```sh
SPI device name 不是 spi 的总线名，需要手工创建，比如 spi10
设置 Reset PIN number
设置IRQ PIN number，也就是模块上的int引脚
```

## 编写 spi 初始化代码

```c
#include <rtthread.h>
#include <rtdevice.h>
#include <board.h>

static int w5500_spi_init(void)
{
    __HAL_RCC_GPIOA_CLK_ENABLE();

    // 最后两个参数是spi模块scs引脚的位置
    return rt_hw_spi_device_attach("spi1", "spi10", GPIOA, GPIO_PIN_4);
}
/* 导出到自动初始化 */
INIT_COMPONENT_EXPORT(w5500_spi_init);
```

## 重连测试

测试模拟：开机断网，中间断网，重连以后，看到 W5500 提示 link up 以后，可以 ping 通其他主机

无论 dhcp 模式打开还是关闭，均支持。
