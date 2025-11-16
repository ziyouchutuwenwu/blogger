---
title: rt-thread 下，配置 stm32 的 u8g
date: 2025-11-16 09:26:39
tags:
  - stm32
  - rt-thread
---

## 配置

### menuconfig

```sh
RT-Thread online packages ->
  peripheral libraries and drivers --->
    U8G2: a monochrome graphic library --->
      Version (c-latest)
```

字体选用 `u8g2_font_wqy12_t_gb2312` 可以完整显示中文

### 代码

```c
u8g2_SetFont(&u8g2, u8g2_font_wqy12_t_gb2312);
u8g2_DrawUTF8(&u8g2, 1, 18, "我拿起那40米的大砍刀");
u8g2_DrawUTF8(&u8g2, 5, 40, "削你那15米的铅笔");
u8g2_SendBuffer(&u8g2);
```
