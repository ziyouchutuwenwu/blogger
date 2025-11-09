---
title: rt-thread 下，配置 stm32 的 LAN8720A 网卡
date: 2025-11-06 09:32:22
tags:
  - stm32
  - rt-thread
---

配置 LAN8720A 接入网络

参考[链接](https://www.rt-thread.org/document/site/application-note/components/network/an0010-lwip-driver-porting/)

## cubeMX 配置

启用 Eth 模块

```sh
选择 RMII
对比实际板的原理图，修改引脚位置，注意rst引脚的位置
```

## 项目配置

修改 ports/phy_reset.c 内 rst 引脚位置, 复制 ports 目录到 board 下，修改 SConscript

```sh
path += [cwd + '/ports']

if GetDepend(['BSP_USING_ETH']):
    src += Glob('ports/phy_reset.c')
```

## board/Kconfig 配置

Kconfig 里面，menu "Onboard Peripheral Drivers"内添加

```sh
config PHY_USING_LAN8720A
    bool
config BSP_USING_ETH
    bool "Enable Ethernet"
    default n
    select RT_USING_LWIP
    select PHY_USING_LAN8720A
```

```sh
RT-Thread Components >
  Network >
    Socket abstraction layer
      [*] Enable socket abstraction layer
      [*] Enable BSD socket operated by file system API
    light weight TCP/IP stack
      [] Enable alloc ip address through DHCP
      [*] Enable lwIP stack
```

在`light weight TCP/IP stack`里面, 选项 `Enable alloc ip address through DHCP`来控制 dhcp 或者固定 ip

## 打开调试开关

libraries/HAL_Drivers/drv_eth.c

```c
#define ETH_RX_DUMP
#define ETH_TX_DUMP
#define DRV_DEBUG
```

## 相关代码

phy_reset.c

```c
#include <board.h>

#define RESET_IO GET_PIN(H, 2)

void phy_reset(void)
{
    rt_pin_write(RESET_IO, PIN_LOW);
    rt_thread_mdelay(50);
    rt_pin_write(RESET_IO, PIN_HIGH);
}

int phy_init(void)
{
    rt_pin_mode(RESET_IO, PIN_MODE_OUTPUT);
    rt_pin_write(RESET_IO, PIN_HIGH);
    return RT_EOK;
}
INIT_BOARD_EXPORT(phy_init);
```
