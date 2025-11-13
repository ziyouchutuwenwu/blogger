---
title: rt-thread 下，配置 stm32 的 mqtt
date: 2025-11-13 09:35:08
tags:
  - stm32
  - rt-thread
---

目前使用的是 kawaii-mqtt

## 服务器

```sh
docker run --rm -d --name emqx -p 1883:1883 -p 8083:8083 -p 8883:8883 -p 8084:8084 -p 18083:18083 emqx/emqx:v3.1.1
```

说明：

```sh
1883 MQTT 端口
8883 MQTT / SSL 端口
8083 MQTT / WebSocket 端口
8084 MQTT / WebSocket / SSL 端口
8080 HTTP 管理 API 端口
18083 Web 仪表板端口
```

管理后台

```sh
http://127.0.0.1:18083
admin
public
```

## rtthread

```sh
RT-Thread online packages >
  IoT - internet of things
    [*] kawaii-mqtt: a mqtt client based on the socket API, support QoS2, mbedtls
    [*] using SAL

RT-Thread Components >
  Network > Socket abstraction layer
    [*] Enable BSD socket operated by file system API
```

## 代码

demo.py

```python
# -*-coding:utf-8-*-


# Import paho-mqtt Client class:
import paho.mqtt.client as mqtt
import time

unacked_sub = []  # a list for unacknowledged subscription

# Define the callback to handle CONNACK from the broker, if the connection created normal, the value of rc is 0
def on_connect(client, userdata, flags, rc):
    print("Connection returned with result code:" + str(rc))


# Define the callback to hande publish from broker, here we simply print out the topic and payload of the received message
def on_message(client, userdata, msg):
    print("Received message, topic: " + msg.topic + " payload: " + str(msg.payload))


# Callback handles disconnection, print the rc value
def on_disconnect(client, userdata, rc):
    print("Disconnection returned result: " + str(rc))


# Remove the message id from the list for unacknowledged subscription
def on_subscribe(client, userdata, mid, granted_qos):
    unacked_sub.remove(mid)


# Create an instance of `Client`
client = mqtt.Client()
client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_message = on_message
client.on_subscribe = on_subscribe

# Connect to broker
# connect() is blocking, it returns when the connection is successful or failed. If you want client connects in a non-blocking way, you may use connect_async() instead
client.connect("127.0.0.1", 1883, 60)

client.loop_start()

# Subscribe to a single topic
result, mid = client.subscribe("demo_topic", 0)
unacked_sub.append(mid)
# Subscribe to multiple topics
result, mid = client.subscribe([("temperature", 0), ("humidity", 0)])
unacked_sub.append(mid)

while len(unacked_sub) != 0:
    time.sleep(1)

client.publish("demo_topic", payload="Hello world!")
client.publish("temperature", payload="24.0")
client.publish("humidity", payload="65%")

# Disconnection
time.sleep(5)
client.loop_stop()
client.disconnect()
```

demo_mqtt.c

```c
#include <stdio.h>
#include <stdint.h>

#include "mqttclient.h"


static void on_message_receive(void* client, message_data_t* msg)
{
    (void) client;
    rt_kprintf("-----------------------------------------------------------------------------------");
    rt_kprintf("%s:%d %s()...\ntopic: %s\nmessage:%s", __FILE__, __LINE__, __FUNCTION__, msg->topic_name, (char*)msg->message->payload);
    rt_kprintf("-----------------------------------------------------------------------------------");
}


static int mqtt_say_hello(mqtt_client_t *client)
{
    mqtt_message_t msg;
    memset(&msg, 0, sizeof(msg));

    msg.qos = 0;
    msg.payload = (void *) "payload to sent";

    return mqtt_publish(client, "demo_topic", &msg);
}


int mqtt_demo(void)
{
    mqtt_client_t *client = NULL;

    mqtt_log_init();

    client = mqtt_lease();

    mqtt_set_host(client, "192.168.88.234");
    mqtt_set_port(client, "1883");
    mqtt_set_clean_session(client, 1);
    mqtt_set_keep_alive_interval(client, 10);

    mqtt_connect(client);
    mqtt_subscribe(client, "demo_topic", QOS0, on_message_receive);

    while (1) {
        mqtt_say_hello(client);
        mqtt_sleep_ms(4 * 1000);
    }
}

MSH_CMD_EXPORT(mqtt_demo, mqtt_demo);
```

## 注意

esp8266 可以连

LAN8720A 很稳定

目前 w5500 各种连不上
