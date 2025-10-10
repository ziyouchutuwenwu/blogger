---
title: python 实现图片转换为 pdf
date: 2025-10-10 08:03:36
tags:
---

直接贴代码

```python
import os
import re
from PIL import Image
from PyPDF2 import PdfWriter, PdfReader

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

img_folder = './xx图/'
pdf_path = 'output.pdf'

imgs = [f for f in os.listdir(img_folder) if f.lower().endswith('.jpg')]
imgs.sort(key=natural_sort_key)

image_list = []
for img_name in imgs:
    img_path = os.path.join(img_folder, img_name)
    img = Image.open(img_path).convert('RGB')
    image_list.append(img)

temp_pdf = os.path.join(img_folder, 'temp.pdf')
image_list[0].save(temp_pdf, save_all=True, append_images=image_list[1:])

reader = PdfReader(temp_pdf)
writer = PdfWriter()

for i, page in enumerate(reader.pages):
    writer.add_page(page)
    title = os.path.splitext(imgs[i])[0]
    writer.add_outline_item(title=title, page_number=i)

with open(pdf_path, 'wb') as f:
    writer.write(f)

print("PDF 已生成:", pdf_path)
```
