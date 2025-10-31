---
title: rt-thread 下，配置 stm32 的 sensor
date: 2025-10-31 08:40:57
tags:
  - stm32
  - rt-thread
---

以 aht10 为例

用法见 [这里](https://github.com/RT-Thread-packages/aht10#readme)

注意, 由于 aht 为温湿度传感器，因此，sensor 框架会抽象出 温度和湿度两个设备

```c
rt_hw_aht10_init("aaa", &cfg);
```

list_device 查看结果

```sh
device           type         ref count
-------- -------------------- ----------
humi_aaa Sensor Device        0
temp_aaa Sensor Device        0
i2c1     I2C Bus              0
uart1    Character Device     2
pin      Miscellaneous Device 0
```
