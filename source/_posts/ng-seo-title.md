---
title: angular 动态修改 title description
date: 2025-10-11 12:41:48
tags:
  - angular
---

根据路由修改 title, description

用于 seo

## 步骤

### 创建

```sh
ng new demo

ng g c aaa
ng g c bbb
```

### 代码

app.routes.ts

```typescript
import { Routes } from "@angular/router";
import { Home } from "./home/home";
import { Aaa } from "./aaa/aaa";
import { Bbb } from "./bbb/bbb";

export const routes: Routes = [
  { path: "", component: Home },
  { path: "aaa", component: Aaa },
  { path: "bbb", component: Bbb },
];
```

app.html

```html
<div>
  <a [routerLink]="['/aaa']">aaa</a>
</div>
<div>
  <a [routerLink]="['/bbb']">bbb</a>
</div>

<input type="button" value="js 到 aaa" (click)="toAaa()" />
<router-outlet></router-outlet>
```

app.ts

```typescript
import { Component } from "@angular/core";
import { Router, RouterModule, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, RouterModule],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  protected title = "demo";

  constructor(private router: Router) {}

  toAaa() {
    this.router.navigate(["/aaa"]);
  }
}
```

aaa.ts

```typescript
export class Aaa implements OnInit {
  constructor(private title: Title, private meta: Meta) {}

  ngOnInit() {
    this.title.setTitle("aaa 页的 title");
    this.meta.updateTag({
      name: "description",
      content: "aaa 页的 description",
    });
  }
}
```

bbb.ts

```typescript
export class Bbb implements OnInit {
  constructor(private title: Title, private meta: Meta) {}

  ngOnInit() {
    this.title.setTitle("bbb 页的 title");
    this.meta.updateTag({
      name: "description",
      content: "bbb 页的 description",
    });
  }
}
```
