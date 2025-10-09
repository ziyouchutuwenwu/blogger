---
title: zig基础用法
date: 2025-10-06 08:07:48
tags:
---

### 遍历

```zig
const std = @import("std");

pub fn main() !void {
    const data_list = [_]u8{ 'a', 'b', 'c' };
    for (data_list, 0..data_list.len) |item, index| {
        std.log.debug("index: {d}, item: {c}", .{ index, item });
    }
}
```

### 错误处理

普通用法

向上抛出错误

```zig
const std = @import("std");

pub fn main() !void {
    const file = try std.fs.cwd().openFile("does_not_exist/foo.txt", .{});
    defer file.close();
}
```

捕获错误

```zig
const std = @import("std");

pub fn main() void {
    const file = std.fs.cwd().openFile("does_not_exist/foo.txt", .{}) catch |err| {
        std.log.debug("无法打开文件: {}", .{err});
        return;
    };
    defer {
        std.log.debug("错误的时候不会到这里", .{});
        file.close();
    }
}
```

自定义错误

```zig
const std = @import("std");

const MyError = error{
    AAA,
    BBB,
    CCC,
};

fn demo_func(num: i32) !i32 {
    if (num < 0) {
        return MyError.AAA;
    } else {
        return num * num;
    }
}

pub fn main() void {
    const result = demo_func(-111) catch |err| {
        std.log.debug("custom error reason {}", .{err});
        return;
    };
    std.log.debug("result {d}", .{result});
}
```

errdefer

```zig
const std = @import("std");

pub fn aa() !void {
    errdefer {
        std.log.debug("errdefer 清理垃圾", .{});
    }
    return error.aaa;
}

pub fn main() !void {
    // try aa();

    aa() catch |err| {
        std.log.debug("捕获错误 {}", .{err});
    };

    std.log.debug("正常运行", .{});
}
```

### 泛型

```zig
const std = @import("std");

const MyType = u64;

fn max(comptime T: type, a: T, b: T) T {
    return if (a > b) a else b;
}

pub fn main() void {
    const result = max(MyType, 11, 22);
    std.log.debug("result {d}", .{result});
}
```

### 回调函数

```zig
const std = @import("std");

const CallBackProc = fn (arg: u64) void;

fn demo(comptime callback_proc: CallBackProc, ms: u64) void {
    callback_proc(ms);
}

fn on_callback(argument: u64) void {
    std.log.debug("proc args {d}", .{argument});
}

pub fn main() void {
    demo(on_callback, 10000);
}
```

### 类型转换

```zig
const std = @import("std");

pub fn main() !void {
    const a: u64 = 111;
    const b: u32 = @truncate(a);
    std.log.debug("a {d} b {d}", .{ a, b });

    const isok = false;
    const val: u8 = @intCast(@intFromBool(isok));
    std.log.debug("isok {d}", .{val});
}
```

### 内存分配器

建议把 allocator 当作为参数，类型是 std.mem.Allocator

- page_allocator

通常用于处理大块内存的分配, 很慢, 不需要 deinit

```zig
const std = @import("std");
const expect = std.testing.expect;

test "page allocator" {
    const allocator = std.heap.page_allocator;

    const memory = demo(allocator) catch |err| {
        std.debug.print("error occurred: {}\n", .{err});
        return;
    };

    try expect(memory.len == 100);
    try expect(@TypeOf(memory) == []u8);
}

pub fn demo(allocator: std.mem.Allocator) ![]u8 {
    const memory = try allocator.alloc(u8, 100);

    defer {
        std.debug.print("准备 free allocator\n", .{});
        allocator.free(memory);
    }

    return memory;
}
```

- fba

不能使用堆内存的时候用，比如写内核的时候, 如果字节用完，会报 OutOfMemory 错误

不需要 deinit, alloc 出来的内存可以多次 free

```zig
const std = @import("std");
const expect = std.testing.expect;

test "fba" {
    var buffer: [1000]u8 = undefined;
    var fba = std.heap.FixedBufferAllocator.init(&buffer);
    const allocator = fba.allocator();

    const memory = demo(allocator) catch |err| {
        std.log.debug("error occurred: {}", .{err});
        return;
    };

    try expect(memory.len == 100);
    try expect(@TypeOf(memory) == []u8);
}

pub fn demo(allocator: std.mem.Allocator) ![]u8 {
    const memory = try allocator.alloc(u8, 100);

    defer {
        std.debug.print("准备 free allocator\n", .{});
        allocator.free(memory);
    }

    return memory;
}
```

- gpa

为安全设计的内存分配器

deinit 返回状态值，用来检测内存泄漏

```zig
const std = @import("std");
const expect = std.testing.expect;

test "gpa" {
    const config = .{};
    var gpa = std.heap.GeneralPurposeAllocator(config){};
    defer {
        if (gpa.deinit() != .ok) {
            @panic("发现内存泄漏");
        }
    }

    const allocator = gpa.allocator();

    const memory = demo(allocator) catch |err| {
        std.log.debug("error occurred: {}", .{err});
        return;
    };

    try expect(memory.len == 100);
    try expect(@TypeOf(memory) == []u8);
}

pub fn demo(allocator: std.mem.Allocator) ![]u8 {
    const memory = try allocator.alloc(u8, 100);

    defer {
        std.debug.print("准备 free allocator\n", .{});
        allocator.free(memory);
    }

    return memory;
}
```

- testing_allocator

用于测试用例里面检测 leak

运行 `zig test xxx.zig` 的时候才能用

```zig
const allocator = std.testing.allocator;
```

- ArenaAllocator

用于短期内需要临时创建和销毁多个小对象

alloc 出来的内存会自动 free

```zig
const std = @import("std");

test "arena" {
    var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
    defer {
        std.debug.print("准备 arena Allocator.deinit\n", .{});
        arena.deinit();
    }

    const allocator = arena.allocator();

    const m1 = try allocator.alloc(u8, 1);
    const m2 = try allocator.alloc(u8, 10);
    _ = try allocator.alloc(u8, 100);

    defer {
        std.debug.print("准备 free arena Allocator\n", .{});
        allocator.free(m1);
        allocator.free(m2);
        // allocator.free(m3);
    }
}
```

### 封装

safe_gpa.zig

```zig
const std = @import("std");

pub const Gpa = struct {
    gpa: std.heap.GeneralPurposeAllocator(.{}) = std.heap.GeneralPurposeAllocator(.{}){},

    pub fn allocator(self: *Gpa) std.mem.Allocator {
        return self.gpa.allocator();
    }

    pub fn deinit(self: *Gpa) void {
        if (self.gpa.deinit() != .ok) {
            @panic("发现内存泄漏");
        }
    }
};

pub fn init() Gpa {
    return Gpa{};
}
```

main.zig

```zig
const std = @import("std");
const safe_gpa = @import("safe_gpa.zig");

pub fn main() !void {
    var gpa = safe_gpa.init();
    defer gpa.deinit();

    const gpa_allocator = gpa.allocator();

    // 外面包一层线程安全的 allocator
    var thread_safe_fba = std.heap.ThreadSafeAllocator{ .child_allocator = gpa_allocator };
    const thread_safe_allocator = thread_safe_fba.allocator();

    // 外面包一层 arena 分配器
    var arena = std.heap.ArenaAllocator.init(thread_safe_allocator);
    defer arena.deinit();
    const allocator = arena.allocator();

    const formatted_str = try std.fmt.allocPrint(allocator, "测试 {}", .{42});
    // defer allocator.free(formatted_str);

    std.log.debug("{s}", .{formatted_str});
}
```

### 指针

```zig
const std = @import("std");

pub fn main() !void {
    var value: i32 = 42;
    const ptr: *const i32 = &value;

    std.log.debug("value: {}", .{ptr.*});
}
```

array_list

```zig
const std = @import("std");
const equal = std.mem.eql;
const ArrayList = std.ArrayList;
const allocator = std.heap.page_allocator;

pub fn main() !void {
    var array_list = ArrayList(u8).init(allocator);
    defer array_list.deinit();

    try array_list.append('H');
    try array_list.append('e');
    try array_list.append('l');
    try array_list.append('l');
    try array_list.append('o');
    try array_list.appendSlice(" World!");

    std.log.debug("{s}", .{array_list.items});
}
```

### array

array 固定大小

slice 动态大小

```zig
const std = @import("std");

pub fn abc(list: []u8) void {
    std.log.debug("in abc {any}", .{list});
}

pub fn main() !void {
    var list = [_]u8{ 11, 22, 33, 44 };
    abc(list[0..]);
}
```

例子

```zig
const std = @import("std");

const allocator = std.heap.page_allocator;

pub fn demo(list: []u8, data_list: []u8) []u8 {
    for (list, 0..list.len) |_, index| {
        data_list[index] = @truncate(index);
    }

    return data_list[0..];
}

pub fn main() void {
    var list = [_]u8{ 11, 22, 33, 44 };
    const data_list = allocator.alloc(u8, list.len) catch |err| {
        std.log.debug("err {any}", .{err});
        return;
    };

    defer allocator.free(data_list);
    const aa = demo(list[0..], data_list);
    std.log.debug("result {any}", .{aa});
}
```

### enum

```zig
const std = @import("std");
const expect = std.testing.expect;

const Result = enum(u32) {
    aa,
    bb = 1000,
    cc = 1000000,
    dd,
};

test "set enum ordinal value" {
    try expect(@intFromEnum(Result.aa) == 0);
    try expect(@intFromEnum(Result.bb) == 1000);
    try expect(@intFromEnum(Result.cc) == 1000000);
    try expect(@intFromEnum(Result.dd) == 1000001);
}
```

### hash_map

```zig
const std = @import("std");
const expect = std.testing.expect;

const allocator = std.testing.allocator;

test "hash_map" {
    const Point = struct { x: i32, y: i32 };

    var hash_map = std.AutoHashMap(u32, Point).init(
        allocator,
    );
    defer hash_map.deinit();

    try hash_map.put(1525, .{ .x = 1, .y = -4 });
    try hash_map.put(1550, .{ .x = 2, .y = -3 });
    try hash_map.put(1575, .{ .x = 3, .y = -2 });
    try hash_map.put(1600, .{ .x = 4, .y = -1 });

    try expect(hash_map.count() == 4);

    var sum = Point{ .x = 0, .y = 0 };
    var iterator = hash_map.iterator();

    while (iterator.next()) |item| {
        std.log.debug("key {d}, x {d}, y {d}", .{ item.key_ptr.*, item.value_ptr.x, item.value_ptr.y });
        sum.x += item.value_ptr.x;
        sum.y += item.value_ptr.y;
    }

    try expect(sum.x == 10);
    try expect(sum.y == -10);
}
```

### json

标准库里面, 需要先定义 struct, 比较挫

```zig
const std = @import("std");

const Place = struct { lat: f32, long: f32 };

fn str_to_json(allocator: std.mem.Allocator, json_str: []u8) !Place {
    const parsed = try std.json.parseFromSlice(
        Place,
        allocator,
        json_str,
        .{},
    );
    defer parsed.deinit();

    const place = parsed.value;
    return place;
}

fn json_to_str(allocator: std.mem.Allocator, json_obj: Place) ![]u8 {
    var json_str = std.ArrayList(u8).init(allocator);
    try std.json.stringify(json_obj, .{}, json_str.writer());

    std.log.debug("{s}", .{json_str.items});

    return json_str.items;
}

pub fn main() !void {
    const allocator = std.heap.page_allocator;

    const obj = Place{
        .lat = 51.997664,
        .long = -0.740687,
    };
    const json_str = try json_to_str(allocator, obj);
    const json_obj = try str_to_json(allocator, json_str);
    std.log.debug("{any}", .{json_obj.long});
}
```

### log

```zig
const std = @import("std");

pub fn main() void {
    const info = "hi";
    const data_list = [_]u8{ 11, 22, 33, 44, 55 };
    std.log.debug("info {s} data_list {any}", .{ info, data_list });
}
```

test 不支持 log

```zig
const std = @import("std");

test "debug log" {
    // std.log.debug("log.debug", .{});
    std.debug.print("debug.print\n", .{});
}
```

### optional

用于表示一个值可能存在或者为 null

```zig
const std = @import("std");

pub fn main() !void {
    // 创建 option
    var demo_option: ?u8 = null;
    demo_option = 111;

    // 修改 option
    if (demo_option) |*value| {
        std.log.debug("set data to option", .{});
        value.* += 1;
    }

    if (demo_option == null) {
        std.log.debug("null\n", .{});
    } else {
        const val = demo_option.?;
        std.log.debug("not null, is {d}", .{val});
    }
}
```

```zig
const std = @import("std");

var _gpa: ?std.heap.GeneralPurposeAllocator(.{}) = null;

pub fn get_allocator() std.mem.Allocator {
    if (_gpa == null) {
        _gpa = std.heap.GeneralPurposeAllocator(.{}){};
    }

    return _gpa.?.allocator();
}

pub fn deinit() void {
    if (_gpa != null) {
        _ = _gpa.?.deinit();
        _gpa = null;
    }
}
```

```zig
const std = @import("std");
const gpa = @import("gpa.zig");

pub fn main() !void {
    const allocator = gpa.get_allocator();
    defer gpa.deinit();

    const formatted_str = try std.fmt.allocPrint(allocator, "测试 {}", .{42});
    defer allocator.free(formatted_str);

    std.debug.print("{s}\n", .{formatted_str});
}
```

### string

zig 没有内置的 string 类型

```zig
const std = @import("std");

const String = []const u8;

pub fn demo() String {
    return "aaa";
}

pub fn main() !void {
    const aa = demo();
    const bb = "bbb";
    std.log.debug("result {s} {s}", .{ aa, bb });
}
```

### struct

```zig
const std = @import("std");

const MyStruct = struct {
    x: f32,
    y: f32,
    z: f32 = 222.0,

    fn demo(self: *MyStruct) void {
        const tmp = self.x;
        self.x = self.y;
        self.y = tmp;
    }
};

pub fn main() !void {
    var aa = MyStruct{
        .x = 10,
        .y = 20,
    };
    aa.demo();
    std.log.debug("aa = {}", .{aa});
}
```

### thread

```zig
const std = @import("std");
const expect = std.testing.expect;

fn threadProc(thread_arg: u32) void {
    std.log.debug("{d} in thread", .{thread_arg});
}

pub fn main() !void {
    const thread = try std.Thread.spawn(.{}, threadProc, .{11111});
    _ = thread;
    // thread.join();
    std.time.sleep(1 * std.time.ns_per_s);
}
```

### union

```zig
const std = @import("std");

const Result = union(enum) {
    a: u8,
    b: f32,
    c: bool,
};

pub fn main() !void {
    var value = Result{
        .b = 1.5,
    };
    value.b = 3.156;
    std.log.debug("{d:.2}", .{value.b});
}
```
