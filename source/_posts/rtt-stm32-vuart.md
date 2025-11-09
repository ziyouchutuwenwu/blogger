---
title: rt-thread 下，配置 stm32 的 虚拟串口
date: 2025-11-10 07:55:00
tags:
  - stm32
  - rt-thread
---

参考[这里](https://mp.weixin.qq.com/s/s8R4zg5-5HjxA4ldt0_n8g)

## 步骤

### cubeMX

```sh
打开 cubeMX，开启 USB_OTG, 使用 device 模式，启用 usb otg 的全局中断，配置时钟，生成代码，复制到项目

注意，cubeMX 里面配置的时候，rcc 需要启用 hse，外部晶震，usb 的时钟需要设置为 48MHZ，我是 F411CEU6 的板

复制 main.c 里面的时钟配置到 board.c
```

### Kconfig

```sh
config BSP_USING_USBD_FS
    bool "Enable OTGFS as USB device"
    select RT_USING_USB_DEVICE
    select _RT_USB_DEVICE_CDC
    default n
```

### menuconfig

```sh
Hardware Drivers Config >
  On-chip Peripheral Drivers
    [*] Enable OTGFS as USB device

RT-Thread Components >
  Device Drivers >
    Using USB >
      [*] Enable composite device >
        [*] Enable to use device as CDC device
```

### 测试代码

```c
#include <rtthread.h>
#include <rtdevice.h>

int vcom_test(void)
{
    rt_device_t dev = RT_NULL;
    char buf[] = "hello vcom!\r\n";

    dev = rt_device_find("vcom");

    if (dev)
        rt_device_open(dev, RT_DEVICE_FLAG_RDWR);
    else
        return -RT_ERROR;

    while (1)
    {
        rt_device_write(dev, 0, buf, rt_strlen(buf));
        rt_thread_mdelay(500);
    }

    rt_device_close(dev);
}

MSH_CMD_EXPORT(vcom_test, vcom_test)
```
