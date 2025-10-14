---
title: angular 下 signal用法
date: 2025-10-14 10:53:16
tags:
---

## 说明

```sh
computed() 的值随 signal 变化自动保持最新
effect() 在 signal 被改变时触发
```

## 例子

### component 例子

```html
<div>
  <p>计数值 {{ count() }}</p>
  <p>平方值 {{ squared() }}</p>
  <button (click)="inc()">inc</button>
  <button (click)="dec()">dev</button>
  <button (click)="reset()">set</button>
</div>
```

```typescript
export class Demo1 {
  count = signal(0);
  squared = computed(() => {
    return this.count() * this.count();
  });

  inc() {
    this.count.update((current) => {
      return current + 1;
    });
  }

  dec() {
    this.count.update((current) => {
      return current - 1;
    });
  }

  reset() {
    this.count.set(0);
  }

  constructor() {
    effect(() => {
      console.log(`on effect, count = ${this.count()}`);
    });
  }
}
```

### service 例子

demo-service.ts

```typescript
import { computed, effect, Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class DemoService {
  count = signal(0);
  squared = computed(() => {
    return this.count() * this.count();
  });

  constructor() {
    effect(() => {
      console.log(`on effect count = ${this.count()}, squared = ${this.squared()}`);
    });
  }

  set(value: number) {
    this.count.set(value);
  }

  inc() {
    this.count.update((current) => {
      return current + 1;
    });
  }
}
```

demo2.ts

```typescript
import { Component, OnInit, Signal, WritableSignal } from "@angular/core";
import { DemoService } from "../demo-service";

@Component({
  selector: "app-demo2",
  templateUrl: "./demo2.html",
  styleUrls: ["./demo2.css"],
})
export class Demo2 implements OnInit {
  count: any;
  squared: any;

  constructor(private demoService: DemoService) {}

  ngOnInit(): void {
    // 这里注意写法
    this.count = this.demoService.count;
    this.squared = this.demoService.squared;
  }

  inc() {
    this.demoService.inc();
  }

  reset() {
    this.demoService.set(0);
  }
}
```

demo2.html

```html
<div>
  <p>计数值 {{ count() }}</p>
  <p>平方值 {{ squared() }}</p>
  <button (click)="inc()">inc</button>
  <button (click)="reset()">set</button>
</div>
```
