---
title: zig 编译 wasm
date: 2025-10-07 07:00:27
tags:
---

zig 编译为 wasm 给 js 调用

demo.zig

```zig
const std = @import("std");

export fn add(a: i32, b: i32) i32 {
    return a + b;
}
```

编译

```sh
zig build-exe src/demo.zig -target wasm32-freestanding -fno-entry --export=add

# 验证
wasm-dis xxx.wasm | grep export
```

### angular

ts

```typescript
import axios from "axios";

export class AppComponent {
  result: number | null = null;
  wasm: WebAssembly.Instance | null = null;

  async ngOnInit() {
    await this.loadWasm();
  }

  async loadWasm() {
    try {
      const response = await axios.get("/xxx/demo.wasm", {
        responseType: "arraybuffer",
      });
      const bytes = new Uint8Array(response.data);
      const module = await WebAssembly.instantiate(bytes);
      this.wasm = module.instance;
    } catch (error) {
      console.error("err loading wasm:", error);
    }
  }

  doAdd() {
    if (this.wasm) {
      console.log(this.wasm.exports);
      const add = this.wasm.exports["add"] as (a: number, b: number) => number;
      const result = add(5, 3);
      this.result = result;
    } else {
      console.warn("wasm instance is not initialized.");
    }
  }
}
```

```html
<div>
  <h1>wasm with angular</h1>
  <button (click)="doAdd()">call wasm</button>
  <p>result: {{ result }}</p>
</div>
```
