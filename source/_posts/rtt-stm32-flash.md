---
title: rtt-stm32-flash
date: 2025-11-04 11:56:10
tags:
  - stm32
  - rt-thread
---

外挂 flash 读写
参考[这里](https://www.rt-thread.org/document/site/application-note/components/sfud/an0048-sfud/)

## 配置

### cubeMX

根据原理图，找到相应的 spi 脚，配置引脚

### Kconfig

```sh
menuconfig BSP_USING_SPI
    bool "Enable SPI BUS"
    default n
    select RT_USING_SPI
    if BSP_USING_SPI
        config BSP_USING_SPI2
            bool "Enable SPI2 BUS"
            default n

        config BSP_SPI2_TX_USING_DMA
            bool "Enable SPI2 TX DMA"
            depends on BSP_USING_SPI2
            default n

        config BSP_SPI2_RX_USING_DMA
            bool "Enable SPI1 RX DMA"
            depends on BSP_USING_SPI2
            select BSP_SPI2_TX_USING_DMA
            default n
    endif
```

Kconfig 的 `"Onboard Peripheral Drivers"` 添加

```sh
config BSP_USING_QSPI_FLASH
    bool "Enable QSPI FLASH (W25Q128 spi10)"
    select BSP_USING_QSPI
    select RT_USING_SFUD
    select RT_SFUD_USING_QSPI
    default n
```

### menuconfig

```sh
Hardware Drivers Config > Onboard Peripheral Drivers
  [*] Enable QSPI FLASH (W25Q128 spi10)

RT-Thread Components > Device Drivers
  [*] Using MTD Nor Flash device drivers

RT-Thread online packages >
 system packages >
  [*] fal: Flash Abstraction Layer implement. Manage flash device and partition.  --->
    (W25Q128) The name of the device used by FAL
    这是 SFUD 初始化 flash 后创建的设备名

Hardware Drivers Config > On-chip Peripheral Drivers > Enable SPI BUS
  [*] Enable SPI BUS  --->
    [*]   Enable SPI2 BUS
    -*-     Enable SPI2 TX DMA
    [*]     Enable SPI1 RX DMA

RT-Thread Components > Device Drivers
  [*] Using SPI Bus/Device device drivers
  -*- Enable QSPI mode
  -*- Using Serial Flash Universal Driver
  [*] Using auto probe flash JEDEC SFDP parameter
  [*] Using defined supported flash chip information table
  -*- Using QSPI mode support
  (50000000) Default spi maximum speed(HZ)
```

## 代码

fal_cfg.h

```h
#ifndef _FAL_CFG_H_
#define _FAL_CFG_H_

#include <rtthread.h>
#include <board.h>

#if defined(BSP_USING_ON_CHIP_FLASH)
extern const struct fal_flash_dev stm32_onchip_flash;
#endif /* BSP_USING_ON_CHIP_FLASH */

#if defined(BSP_USING_QSPI_FLASH)
extern struct fal_flash_dev nor_flash0;
#endif /* BSP_USING_QSPI_FLASH */

/* ========================= Device Configuration ========================== */
#ifdef BSP_USING_ON_CHIP_FLASH
#define ONCHIP_FLASH_DEV     &stm32_onchip_flash,
#else
#define ONCHIP_FLASH_DEV
#endif /* BSP_USING_ON_CHIP_FLASH */

#ifdef BSP_USING_QSPI_FLASH
#define SPI_FLASH_DEV        &nor_flash0,
#else
#define SPI_FLASH_DEV
#endif /* BSP_USING_QSPI_FLASH */

/* flash device table */
#define FAL_FLASH_DEV_TABLE                                          \
{                                                                    \
    ONCHIP_FLASH_DEV                                                 \
    SPI_FLASH_DEV                                                    \
}

/* ====================== Partition Configuration ========================== */
#ifdef FAL_PART_HAS_TABLE_CFG

#ifdef BSP_USING_ON_CHIP_FLASH
#define ONCHIP_FLASH_PATITION          {FAL_PART_MAGIC_WROD, "app",   "onchip_flash",   0,           496 * 1024, 0},      \
                                       {FAL_PART_MAGIC_WROD, "param", "onchip_flash",   496* 1024,   16 * 1024,  0},
#else
#define ONCHIP_FLASH_PATITION
#endif

#ifdef BSP_USING_QSPI_FLASH
#define SPI_FLASH_PARTITION            {FAL_PART_MAGIC_WROD, "filesystem", "W25Q128", 9 * 1024 * 1024, 16 * 1024 * 1024, 0},
#else
#define SPI_FLASH_PARTITION
#endif

/* partition table */
#define FAL_PART_TABLE                                               \
{                                                                    \
    ONCHIP_FLASH_PATITION                                            \
    SPI_FLASH_PARTITION                                              \
}
#endif /* FAL_PART_HAS_TABLE_CFG */

#endif /* _FAL_CFG_H_ */
```

w25q128_auto_init.c

```c
#include <rtthread.h>
#include <rtdevice.h>
#include <board.h>

static int w25q128_auto_init(void)
{
    __HAL_RCC_GPIOB_CLK_ENABLE();

    // 最后俩参数是spi接口的cs脚
    rt_hw_spi_device_attach("spi2", "spi10", GPIOI, GPIO_PIN_0);

    if (RT_NULL == rt_sfud_flash_probe("W25Q128", "spi10"))
    {
        return -RT_ERROR;
    };

    return RT_EOK;
}
/* 导出到自动初始化 */
INIT_COMPONENT_EXPORT(w25q128_auto_init);
```

w25q128_flash_demo.c

```c
#include <rtthread.h>
#include <rtdevice.h>
#include <board.h>
#include <sfud.h>

#define SPI_FLASH_DEVICE_NAME "spi10"

void w25q128_flash_demo(void)
{
    sfud_err result;
    uint8_t* read_data;
    uint8_t* write_data;
    sfud_flash* sfud_dev = NULL;

    sfud_dev = rt_sfud_flash_find(SPI_FLASH_DEVICE_NAME);
    // 或者 sfud_dev = rt_sfud_flash_find_by_dev_name("W25Q128");

    sfud_erase(sfud_dev, 0, 4096);

    write_data = rt_malloc(32);
    rt_memset(write_data, 3, 32);
    sfud_write(sfud_dev, 0, 32, write_data);

    read_data = rt_malloc(32);
    sfud_read(sfud_dev, 0, 32, read_data);

    rt_kprintf("please run cmd to check result\r\n");
    rt_kprintf("sf probe %s\r\n", SPI_FLASH_DEVICE_NAME);
    rt_kprintf("sf read 0 32\r\n");
}

MSH_CMD_EXPORT(w25q128_flash_demo, w25q128_flash_demo);
```

## 测试

```sh
msh />list_device
device           type         ref count
-------- -------------------- ----------
W25Q128  Block Device         0
spi10    SPI Device           0
e0       Network Interface    0
spi2     SPI Bus              0
uart1    Character Device     2
pin      Miscellaneous Device 0
```

```sh
msh />sf probe spi10
msh />sf erase 0 10
msh />sf read 0 10
msh />sf bench yes
```

## 注意

Flash 先擦后写
写入之前请先擦除，这是 flash 特性决定的，因为 flash 的编程原理就是只能将 1 写为 0，而不能将 0 写为 1。擦除动作就是相应的页 / 块的所有位变为 1（所有字节均为 0xFF），所以不擦除直接写入会有问题。
