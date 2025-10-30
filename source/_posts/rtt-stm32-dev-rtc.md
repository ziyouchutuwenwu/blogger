---
title: rt-thread 下，配置 stm32 的 rtc
date: 2025-10-30 08:59:31
tags:
  - stm32
  - rt-thread
---

rtc 用于提供精确的实时时间，分为硬件 rtc 和软件模拟 rtc

## 提醒

```sh
硬件 rtc，cubeMX 里面配置的时候，选中`Activate Clock Source`，时钟树里面，rtc 的时钟需要配置为`LSE`
```

## 步骤

修改 board/Kconfig，添加 rtc 相关部分，以下为参考

```sh
menuconfig BSP_USING_ONCHIP_RTC
    bool "enable rtc"
    select RT_USING_RTC
    select RT_USING_LIBC
    default n
    if BSP_USING_ONCHIP_RTC
        choice
            prompt "select clock source"
            default BSP_RTC_USING_LSE

            config BSP_RTC_USING_LSE
                bool "rtc using lse"

            config BSP_RTC_USING_LSI
                bool "rtc using lsi"
        endchoice
    endif
```

如果没有硬件 rtc，则参考下面，选中软件 rtc 部分

```sh
RT-Thread Components →
  Device Drivers:
    -*- Using RTC device drivers
    [*] Using software simulation RTC device
```

## ntp

我们使用 rtc 一般用于启用 NTP 时间自动同步，这个功能需要联网

先开启 ntp

```sh
RT-Thread online packages →
  IoT - internet of things →
    netutils: Networking utilities for RT-Thread:
      [*] Enable NTP(Network Time Protocol) client
```

设置同步周期和首次同步的延时时间

```sh
RT-Thread Components →
  Device Drivers:
    -*- Using RTC device drivers                                 /* 使用 RTC 设备驱动 */
    [ ] Using software simulation RTC device                   /* 使用软件模拟 RTC */
    [*] Using NTP auto sync RTC time                           /* 使用 NTP 自动同步 RTC 时间 */
    (30) NTP first sync delay time(second) for network connect /* 首次执行 NTP 时间同步的延时。延时的目的在于，给网络连接预留一定的时间，尽量提高第一次执行 NTP 时间同步时的成功率。默认时间为 30S； */
    (3600)  NTP auto sync period(second)                          /* NTP 自动同步周期，单位为秒，默认一小时（即 3600S）同步一次。 */
```

## 注意

```sh
rtc 无论使用硬件还是软件模拟，目前只支持一个，名字就叫 rtc
```
