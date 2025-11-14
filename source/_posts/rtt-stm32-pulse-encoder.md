---
title: rt-thread 下，配置 stm32 的 pulse-encoder
date: 2025-11-14 08:05:51
tags:
  - stm32
  - rt-thread
---

脉冲编码器

## 配置

### cubemx

选一个定时器,设置 Combined Channels 为 `Encoder Mode`

### 接线

定时器对应的 channel 接 DT 和 CLK,正反接都可以

### 代码

pulse_encoder_demo.c

```c
#include <rtthread.h>
#include <rtdevice.h>

#define PULSE_ENCODER_DEV_NAME    "pulse3"

static int pulse_encoder_demo(int argc, char *argv[])
{
    rt_err_t ret = RT_EOK;
    rt_device_t pulse_encoder_dev = RT_NULL;

    rt_int32_t count;

    /* 查找脉冲编码器设备 */
    pulse_encoder_dev = rt_device_find(PULSE_ENCODER_DEV_NAME);
    if (pulse_encoder_dev == RT_NULL)
    {
        rt_kprintf("pulse encoder sample run failed! can't find %s device!\n", PULSE_ENCODER_DEV_NAME);
        return RT_ERROR;
    }

    /* 以只读方式打开设备 */
    ret = rt_device_open(pulse_encoder_dev, RT_DEVICE_OFLAG_RDONLY);
    if (ret != RT_EOK)
    {
        rt_kprintf("open %s device failed!\n", PULSE_ENCODER_DEV_NAME);
        return ret;
    }

    for(rt_uint32_t i = 0; i <= 10000; i++)
    {
        rt_thread_mdelay(500);

        rt_device_read(pulse_encoder_dev, 0, &count, 1);
        rt_device_control(pulse_encoder_dev, PULSE_ENCODER_CMD_CLEAR_COUNT, RT_NULL);
        rt_kprintf("get count %d\n",count);
    }

    rt_device_close(pulse_encoder_dev);
    return ret;
}

MSH_CMD_EXPORT(pulse_encoder_demo, pulse_encoder_demo);
```

## 注意

同一个定时器,如果某通道发了脉冲,其他通道不能再用来读取脉冲编码器了,会冲突
