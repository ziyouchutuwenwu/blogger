---
title: rtt-stm32-at-socket
date: 2025-11-07 10:09:24
tags:
  - stm32
  - rt-thread
---

参考[链接](https://www.rt-thread.org/document/site/application-note/components/at/an0014-at-client/#at-socket)

## 配置

先启用 uart2

### 软件包

开启 at device 的支持

```sh
RT-Thread online packages >
  IoT - internet of things >
    AT DEVICE: RT-Thread AT component porting or samples for different device
       [*]  Espressif ESP8266  --->
```

配置参数

```sh
缓冲区大小可以设置大一点
配置使用 laster 版本软件包；
```

### 驱动部分

```sh
RT-Thread Components
  Network
    Socket abstraction layer
      protocol stack implement
        [*]Support AT Commands stack
        [*]Enable BSD socket operated by the file system API
    Enable AT commands
      -*-   Enable AT commands client
      -*-     Enable BSD Socket API support by AT commnads
      # 这里是选择显示at命令日志
      [ ]     Enable print RAW format AT command communication data
     (128)   The maximum lenght of AT Commonds buffer
```

### 调试

使用 cutecom 连接，回车模式选择 CR/LF

```sh
AT+CWMODE=1
AT+CWJAP="ssid","password"
AT+CIFSR

AT+RST
```

### 注意

- 模块串口和开发板的串口反接
- 注意供电, wifi 芯片功耗很大，vcc 要接 5v，如果提示 `wait AT client(uart2) connect timeout(5000 tick)`，可能是 vcc 供电不足，可以`换一个 5v 的供电口解决`
- 模块如果使用杜邦线接线，用短的，长的可能会出现很多奇怪的问题
- 如果提示缓冲区不够，可以使用串口调试器（cutecom）先调试 at 指令，很可能是不同的模块里面，在某些非正常时刻，发出太多的 response 导致的，可以看情况修改调用 at_create_resp 函数的地方针对性的修改缓冲区大小

```sh
比如 [E/at.clnt] Read response buffer failed. The Response buffer size is out of buffer size(xxx)
可以在 at.client.c 的 at_create_resp 函数上下断点观察流程，尝试把缓冲区都改大一点
```

如果还有解决不了的问题，看[这里](https://www.rt-thread.org/qa/forum.php?mod=viewthread&tid=11919&extra=page%3D1%26filter%3Dtypeid%26typeid%3D5)
