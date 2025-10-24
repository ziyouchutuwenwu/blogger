---
title: stm32 对于 rt-thread 的 bsp 移植
date: 2025-10-25 07:33:44
tags:
  - stm32
  - rt-thread
---

## 参考链接

[STM32 系列 BSP 制作教程](https://github.com/RT-Thread/rt-thread/blob/master/bsp/stm32/docs/STM32%E7%B3%BB%E5%88%97BSP%E5%88%B6%E4%BD%9C%E6%95%99%E7%A8%8B.md)

[STM32 系列外设驱动添加指南](https://github.com/RT-Thread/rt-thread/blob/master/bsp/stm32/docs/STM32%E7%B3%BB%E5%88%97%E5%A4%96%E8%AE%BE%E9%A9%B1%E5%8A%A8%E6%B7%BB%E5%8A%A0%E6%8C%87%E5%8D%97.md)

## 步骤

### bsp 模板

复制 bsp/stm32/libraries/templates 下面复制你的型号的模板 到 bsp/stm32/下，改成你喜欢的名字

### 配置 gcc

rtconfig.py, 配置编译器

```python
if CROSS_TOOL == "gcc":
    PLATFORM = "gcc"
    EXEC_PATH = (
        os.getenv("HOME") + "/dev/embedded/rt-thread/gcc-arm-none-eabi-6_2-2016q4/bin/"
    )
```

```sh
scons -c; scons --dist
```

### 生成 cubeMX 项目

创建跟你 mcu 一样的项目，修改配置，生成代码。

复制 Inc 和 Src 目录到 board/CubeMX_Config 下覆盖

从 board/CubeMX_Config 里面找到 main.c，复制 `SystemClock_Config()` 到 board/board.c 里面，这是唯一需要手工复制的函数，如果不复制，可能会出现烧录以后失去响应的问题

### 时钟配置

强烈建议看一下原理图，里面 mcu 相关的晶振部分的频率，在 cubeMX 的时钟部分的 HSE 和 LSE 的频率，一定要和原理图里面的一致

### 串口引脚配置

注意看原理图里面的串口引脚，是否有重新映射的引脚，不然无法通信

### 配置 Kconfig

修改 board/Kconfig，搜索 config SOC_STM32, 改为相应的芯片型号

如果需要 i2c 等配置，而当前的 Kconfig 里面没有的话，可以从别的 bsp 里面借鉴一下

### flash 和 ram 大小相关

见 [bsp_helper.py](./bsp_helper.py)

### 注意真实的大小

mcu 具体的 flash 和 ram 大小，`最好看一下芯片手册`，比如 f407igt6 里面，有 64k 的内存是保留不能使用的

可以使用 segger 公司的 `JFlashLiteExe` 查看具体芯片的 flash 和 ram 大小, `v6.86g` 这个版本是最后一个能看内存大小的版本，推荐使用

### SConscript

修改 board/SConscript, 看看芯片等信息有没有错误

搜索 `CPPDEFINES`, 改成你的芯片对应的型号，具体写法参考 CPPDEFINES 上面的内容里面改

根据你的芯片型号，修改下面对应的汇编启动文件 `xxxxxx.s`, 如果不知道用哪个，可以用 cubeMX 生成项目以后找，看用的是哪个文件

```sh
if rtconfig.CROSS_TOOL == 'gcc':
    src += [startup_path_prefix + '/STM32F1xx_HAL/CMSIS/Device/ST/STM32F1xx/Source/Templates/gcc/startup_stm32f103xb.s']
elif rtconfig.CROSS_TOOL == 'keil':
    src += [startup_path_prefix + '/STM32F1xx_HAL/CMSIS/Device/ST/STM32F1xx/Source/Templates/arm/startup_stm32f103xb.s']
elif rtconfig.CROSS_TOOL == 'iar':
    src += [startup_path_prefix + '/STM32F1xx_HAL/CMSIS/Device/ST/STM32F1xx/Source/Templates/iar/startup_stm32f103xb.s']
```
