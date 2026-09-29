我希望做一个个人服饰首饰 library app 叫做 armoi。

用户自己有一个 item library，其中可以给一个 item 添加：

1. 至多 10 张图片
2. 名称
3. 品牌（创建后则记住这个品牌到 brand library，之后用户还想添加这个品牌的东西则提供根据 prefix 自动补全选项）
4. 季节（春夏秋冬，可多选）
5. 性别（男/女/Unisex）
6. 收纳位置（同样，创建后则记住这个收纳位置到 storage library）
7. 类别（按照下面的树状结构递进式选择）
8. 价格（可选，货币单位用 dropdown 提供常见选项）
9. 配套（用户可以从自己的 item library 选择配套的 item，不限个数；配套的两个 item 是相互的；A 选择 B 配套后，B的页面也会显示配套 A）

类别按照如下：

```
├── 服装 Clothing
│   ├── 上装
│   │   ├── T恤
│   │   ├── 衬衫
│   │   ├── 女式衬衫
│   │   ├── 毛衣
│   │   ├── 连帽衫与卫衣
│   │   ├── 开衫
│   │   ├── 背心
│   │   └── 连体衣
│   ├── 下装
│   │   ├── 牛仔裤
│   │   ├── 西裤
│   │   ├── 休闲裤
│   │   ├── 短裤
│   │   ├── 半身裙
│   │   └── 紧身裤
│   ├── 连衣裙与连体服
│   │   ├── 连衣裙
│   │   ├── 连体裤
│   │   └── 短款连体服
│   ├── 外套
│   │   ├── 大衣
│   │   ├── 夹克
│   │   ├── 西装外套
│   │   ├── 风衣
│   │   ├── 派克大衣
│   │   ├── 羽绒服
│   │   ├── 皮夹克
│   │   └── 雨衣
│   ├── 西装与定制服装
│   │   ├── 西装套装
│   │   ├── 西装外套
│   │   ├── 西装裤
│   │   └── 礼服西装
│   ├── 运动服
│   │   ├── 运动上衣
│   │   ├── 运动内衣
│   │   ├── 运动长裤
│   │   ├── 运动紧身裤
│   │   ├── 运动短裤
│   │   └── 功能外套
│   ├── 家居服与睡衣
│   │   ├── 家居服
│   │   ├── 睡衣
│   │   ├── 睡袍
│   │   └── 室内拖鞋
│   ├── 内衣与袜类
│   │   ├── 内裤
│   │   ├── 文胸
│   │   ├── 袜子
│   │   ├── 连裤袜
│   │   └── 长筒袜
│   └── 泳装
│       ├── 连体泳衣
│       ├── 比基尼
│       ├── 泳裤
│       ├── 泳装外搭
│       └── 防晒泳衣
│
├── 鞋履 Shoes
│   ├── 运动鞋
│   │   ├── 休闲运动鞋
│   │   ├── 跑鞋
│   │   ├── 训练鞋
│   │   ├── 篮球鞋
│   │   └── 设计师运动鞋
│   ├── 靴子
│   │   ├── 短靴
│   │   ├── 切尔西靴
│   │   ├── 长筒靴
│   │   ├── 骑马靴
│   │   ├── 工装靴
│   │   ├── 徒步靴
│   │   └── 冬靴
│   ├── 平底鞋
│   │   ├── 芭蕾平底鞋
│   │   ├── 乐福鞋
│   │   ├── 豆豆鞋
│   │   └── 室内拖鞋
│   ├── 高跟鞋
│   │   ├── 浅口高跟鞋
│   │   ├── 细跟鞋
│   │   ├── 粗跟鞋
│   │   ├── 猫跟鞋
│   │   └── 厚底高跟鞋
│   ├── 凉鞋
│   │   ├── 平底凉鞋
│   │   ├── 高跟凉鞋
│   │   ├── 厚底凉鞋
│   │   └── 户外凉鞋
│   ├── 正装鞋
│   │   ├── 牛津鞋
│   │   ├── 德比鞋
│   │   ├── 僧侣鞋
│   │   └── 正装乐福鞋
│   └── 特殊鞋类
│       ├── 沙滩鞋
│       ├── 室内鞋
│       ├── 拖鞋
│       └── 鞋类护理用品
│
├── 包袋 Bags
│   ├── 手提包
│   │   ├── 肩背包
│   │   ├── 斜挎包
│   │   ├── 手提包
│   │   ├── 托特包
│   │   ├── 流浪包
│   │   ├── 水桶包
│   │   └── 公文包
│   ├── 迷你包与晚宴包
│   │   ├── 迷你包
│   │   ├── 手拿包
│   │   ├── 晚宴包
│   │   └── 腕带包
│   ├── 双肩包
│   │   ├── 日常双肩包
│   │   ├── 通勤双肩包
│   │   ├── 旅行双肩包
│   │   └── 功能型双肩包
│   ├── 工作与商务包
│   │   ├── 公文包
│   │   ├── 电脑包
│   │   ├── 文件袋
│   │   └── 资料包
│   ├── 旅行包
│   │   ├── 行李袋
│   │   ├── 周末旅行包
│   │   ├── 行李箱
│   │   ├── 西装袋
│   │   └── 旅行收纳包
│   ├── 小型皮具
│   │   ├── 钱包
│   │   ├── 卡包
│   │   ├── 零钱包
│   │   ├── 钥匙包
│   │   └── 护照夹
│   └── 特殊包袋
│       ├── 腰包
│       ├── 收纳袋
│       ├── 相机包
│       ├── 沙滩包
│       └── 购物袋
│
└── 配饰 Accessories
    ├── 珠宝首饰
    │   ├── 项链
    │   ├── 耳环
    │   ├── 手链
    │   ├── 戒指
    │   ├── 胸针
    │   └── 身体首饰
    ├── 腕表
    │   ├── 机械表
    │   ├── 石英表
    │   ├── 智能手表
    │   └── 表带
    ├── 腰带
    │   ├── 皮带
    │   ├── 链条腰带
    │   ├── 腰封
    │   └── 正装腰带
    ├── 帽子与头饰
    │   ├── 棒球帽
    │   ├── 针织帽
    │   ├── 费多拉帽
    │   ├── 渔夫帽
    │   └── 遮阳帽
    ├── 围巾与披肩
    │   ├── 真丝围巾
    │   ├── 羊毛围巾
    │   ├── 披肩
    │   └── 围裹式披巾
    ├── 手套
    │   ├── 皮手套
    │   ├── 羊毛手套
    │   ├── 触屏手套
    │   └── 冬季手套
    ├── 眼镜
    │   ├── 太阳镜
    │   ├── 光学镜框
    │   └── 防蓝光眼镜
    ├── 发饰
    │   ├── 发夹
    │   ├── 发带
    │   ├── 发圈
    │   └── 发簪
    ├── 领带与正装配饰
    │   ├── 领带
    │   ├── 领结
    │   ├── 方巾
    │   └── 袖扣
    ├── 数码配件
    │   ├── 手机壳
    │   ├── AirPods保护壳
    │   ├── 电脑内胆包
    │   └── 智能手表配件
    └── 季节性配饰
        ├── 雨伞
        ├── 面部遮挡用品
        ├── 沙滩配饰
        └── 冬季配饰
```

```
├── Clothing
│   ├── Tops
│   │   ├── T-Shirts
│   │   ├── Shirts
│   │   ├── Blouses
│   │   ├── Sweaters
│   │   ├── Hoodies & Sweatshirts
│   │   ├── Cardigans
│   │   ├── Vests
│   │   └── Bodysuits
│   ├── Bottoms
│   │   ├── Jeans
│   │   ├── Trousers
│   │   ├── Casual Pants
│   │   ├── Shorts
│   │   ├── Skirts
│   │   └── Leggings
│   ├── Dresses & Jumpsuits
│   │   ├── Dresses
│   │   ├── Jumpsuits
│   │   └── Playsuits
│   ├── Outerwear
│   │   ├── Coats
│   │   ├── Jackets
│   │   ├── Blazers
│   │   ├── Trench Coats
│   │   ├── Parkas
│   │   ├── Puffer Jackets
│   │   ├── Leather Jackets
│   │   └── Rainwear
│   ├── Suits & Tailoring
│   │   ├── Suits
│   │   ├── Suit Jackets
│   │   ├── Suit Trousers
│   │   └── Tuxedos
│   ├── Activewear
│   │   ├── Sports Tops
│   │   ├── Sports Bras
│   │   ├── Track Pants
│   │   ├── Active Leggings
│   │   ├── Active Shorts
│   │   └── Performance Jackets
│   ├── Loungewear & Sleepwear
│   │   ├── Loungewear
│   │   ├── Pajamas
│   │   ├── Robes
│   │   └── Slippers
│   ├── Underwear & Hosiery
│   │   ├── Underwear
│   │   ├── Bras
│   │   ├── Socks
│   │   ├── Tights
│   │   └── Stockings
│   └── Swimwear
│       ├── One-Piece Swimsuits
│       ├── Bikinis
│       ├── Swim Trunks
│       ├── Cover-Ups
│       └── Rash Guards
│
├── Shoes
│   ├── Sneakers
│   │   ├── Lifestyle Sneakers
│   │   ├── Running Shoes
│   │   ├── Training Shoes
│   │   ├── Basketball Shoes
│   │   └── Designer Sneakers
│   ├── Boots
│   │   ├── Ankle Boots
│   │   ├── Chelsea Boots
│   │   ├── Knee-High Boots
│   │   ├── Riding Boots
│   │   ├── Combat Boots
│   │   ├── Hiking Boots
│   │   └── Winter Boots
│   ├── Flats
│   │   ├── Ballet Flats
│   │   ├── Loafers
│   │   ├── Moccasins
│   │   └── Slippers
│   ├── Heels
│   │   ├── Pumps
│   │   ├── Stiletto Heels
│   │   ├── Block Heels
│   │   ├── Kitten Heels
│   │   └── Platform Heels
│   ├── Sandals
│   │   ├── Flat Sandals
│   │   ├── Heeled Sandals
│   │   ├── Platform Sandals
│   │   └── Sport Sandals
│   ├── Formal Shoes
│   │   ├── Oxfords
│   │   ├── Derbies
│   │   ├── Monk Straps
│   │   └── Dress Loafers
│   └── Specialty Footwear
│       ├── Beach Shoes
│       ├── Indoor Shoes
│       ├── Slippers
│       └── Shoe Care
│
├── Bags
│   ├── Handbags
│   │   ├── Shoulder Bags
│   │   ├── Crossbody Bags
│   │   ├── Top-Handle Bags
│   │   ├── Tote Bags
│   │   ├── Hobo Bags
│   │   ├── Bucket Bags
│   │   └── Satchels
│   ├── Mini & Evening Bags
│   │   ├── Mini Bags
│   │   ├── Clutches
│   │   ├── Evening Bags
│   │   └── Wristlets
│   ├── Backpacks
│   │   ├── Everyday Backpacks
│   │   ├── Work Backpacks
│   │   ├── Travel Backpacks
│   │   └── Technical Backpacks
│   ├── Work & Business Bags
│   │   ├── Briefcases
│   │   ├── Laptop Bags
│   │   ├── Document Holders
│   │   └── Portfolio Bags
│   ├── Travel Bags
│   │   ├── Duffel Bags
│   │   ├── Weekender Bags
│   │   ├── Suitcases
│   │   ├── Garment Bags
│   │   └── Travel Organizers
│   ├── Small Leather Goods
│   │   ├── Wallets
│   │   ├── Card Holders
│   │   ├── Coin Purses
│   │   ├── Key Cases
│   │   └── Passport Holders
│   └── Specialty Bags
│       ├── Belt Bags
│       ├── Pouches
│       ├── Camera Bags
│       ├── Beach Bags
│       └── Shopping Bags
│
└── Accessories
    ├── Jewellery
    │   ├── Necklaces
    │   ├── Earrings
    │   ├── Bracelets
    │   ├── Rings
    │   ├── Brooches
    │   └── Body Jewellery
    ├── Watches
    │   ├── Mechanical Watches
    │   ├── Quartz Watches
    │   ├── Smartwatches
    │   └── Watch Straps
    ├── Belts
    │   ├── Leather Belts
    │   ├── Chain Belts
    │   ├── Waist Belts
    │   └── Dress Belts
    ├── Hats & Headwear
    │   ├── Baseball Caps
    │   ├── Beanies
    │   ├── Fedoras
    │   ├── Bucket Hats
    │   └── Sun Hats
    ├── Scarves & Wraps
    │   ├── Silk Scarves
    │   ├── Wool Scarves
    │   ├── Shawls
    │   └── Wraps
    ├── Gloves
    │   ├── Leather Gloves
    │   ├── Wool Gloves
    │   ├── Touchscreen Gloves
    │   └── Winter Gloves
    ├── Eyewear
    │   ├── Sunglasses
    │   ├── Optical Frames
    │   └── Blue-Light Glasses
    ├── Hair Accessories
    │   ├── Hair Clips
    │   ├── Headbands
    │   ├── Scrunchies
    │   └── Hair Pins
    ├── Ties & Formal Accessories
    │   ├── Neckties
    │   ├── Bow Ties
    │   ├── Pocket Squares
    │   └── Cufflinks
    ├── Tech Accessories
    │   ├── Phone Cases
    │   ├── AirPods Cases
    │   ├── Laptop Sleeves
    │   └── Smartwatch Accessories
    └── Seasonal Accessories
        ├── Umbrellas
        ├── Face Coverings
        ├── Beach Accessories
        └── Winter Accessories
```

app 的页面应该就是一个 library，包含你所有的东西。

在屏幕右边缘居中位置有一个凸起来的 bar，bar 上面有 storage，brand两个 tab。点击 stoarge 则出现自己的所有 storage，点进去一个 storage 则显示这个 storage 里面的所有东西；点击 brand 则出现自己所有的 brand，点击去一个 brand 则显示这个 brand 里面所有的东西。

在主页、storage 和 brand 页面顶部应该都有一个搜索框和过滤框和视图选择（big grads 一个一排，medium grads 两个一排，small grads 三个一排， or list）。搜索可以 match 所有物品相关的 textual 信息。

UI 设计风格应该：

````
## 整体风格

主色调采用#F6EEE1和#0B0B0B。

这是一个**高端时尚电商与品牌画册结合的 UI 设计风格**。它没有采用传统电商网站密集排列商品的方式，而是把商品、模特照片、系列介绍和购买信息设计成一组漂浮在浅灰背景上的视觉卡片，整体更像数字化的时尚杂志或品牌 Lookbook。

## 视觉特征

### 1. 极简、留白丰富

画面以白色和非常浅的灰色为主：

- 大面积留白。
- 卡片之间保持明显间距。
- 页面没有复杂边框或强烈阴影。
- 内容看起来轻盈、干净、精致。
- 视觉重点集中在服装图片和少量文字上。

这种布局营造出高级百货、设计师品牌和精品画廊的感觉，而不是普通的折扣电商平台。

### 2. 卡片式内容布局

页面由多个独立的内容卡片组成，每张卡片承担不同功能：

- 商品卡片：展示模特、商品名称、价格和颜色选项。
- 系列卡片：介绍某个服装系列，例如 “Collection 2018” 和 “Spring · Summer”。
- 图片卡片：使用大幅模特照片展示服装细节。
- 结账卡片：显示商品数量、运费、总价和确认按钮。
- 品牌推广卡片：展示品牌名称和宣传语。

这些卡片大小不完全一致，像一组错落排列的杂志版面。

### 3. 不对称的杂志式构图

截图不是传统的整齐网格，而是采用**非对称拼贴布局**：

- 大卡片和小卡片交错排列。
- 商品图片与文字卡片相互穿插。
- 部分卡片只显示图片，部分卡片包含完整商品信息。
- 页面中的内容似乎向不同方向延伸，形成一种动态感。
- 截图整体带有轻微倾斜或透视效果，像从一个三维空间中观察多个页面。

这种构图让界面显得更有艺术性和编辑感，适合突出品牌氛围，而不是快速比较大量商品。

### 4. 大尺寸时尚摄影

图片是界面的核心内容：

- 采用全身或半身模特摄影。
- 背景通常为米白、浅灰或低饱和色。
- 模特姿态自然，画面克制。
- 服装颜色以黑、白、米色、灰色等中性色为主。
- 图片比例较高，接近时尚杂志或品牌 Lookbook 的图片比例。

图片通常比文字更大，因此用户首先感受到的是服装的轮廓、材质、色彩和整体造型。

## 色彩系统

整体使用的是低饱和度、中性色配色：

- 背景：白色、浅灰色。
- 卡片：白色或暖白色。
- 文字：黑色、深灰色。
- 辅助色：米色、浅粉、淡紫、浅蓝。
- 按钮：深灰色或中灰色。
- 图片背景：奶油色、灰米色、浅卡其色。

这种配色不会与服装图片竞争，同时强化了高级、柔和、现代的品牌形象。

## 字体与文字排版

文字排版非常克制，通常具有以下特征：

- 使用简洁的无衬线字体。
- 标题字号较大，但不会占据太多空间。
- 商品名称、价格和分类文字字号较小。
- 文字颜色多为黑色或深灰色。
- 信息层级依靠字号、字重和留白区分，而不是依靠大量颜色。
- 文案较短，例如品牌名、系列名、价格和季节信息。

文字不是界面的主角，而是为图片提供背景信息和购买依据。

## 商品卡片结构

商品卡片一般包含以下内容：

```text
商品图片
商品名称或品牌
价格
颜色选择器
收藏或购物袋图标
```

例如，一张商品卡片可能先展示模特穿着的服装，再在图片下方显示：

```text
Totême
699$
○ ○ ○
```

颜色选择器使用小圆点表示不同颜色，而不是复杂的下拉菜单。购物袋或收藏图标通常放在卡片角落，以小尺寸悬浮方式出现，避免破坏图片的完整性。

## 交互控件风格

交互元素采用低调、圆润和悬浮式设计：

- 按钮使用胶囊形或大圆角矩形。
- 按钮颜色为灰色、黑色或低饱和色。
- 图标尺寸较小，通常是购物袋、收藏、菜单或更多操作。
- 颜色选择器使用圆形色点。
- 控件尽量融入卡片，而不是使用明显的边框。
- 阴影柔和且范围较大，产生纸张或悬浮面板的感觉。

例如结账区域中的 “CONFIRM” 按钮是灰色圆角按钮，文字为白色，整体显得克制而高级。

## 空间与层次

这个 UI 具有明显的**浮动纸片和三维画廊感**：

- 每个卡片像一张独立的纸张或展示板。
- 卡片之间有浅色阴影。
- 不同卡片处于略微不同的空间层级。
- 画面边缘的内容可能被裁切，暗示页面还可以继续浏览。
- 卡片的角度和大小略有变化，增强了动态布局感。

因此，它不像一个普通的二维商品列表，更像一个由多个数字展板组成的时尚展览空间。

## 用户体验定位

这种设计重点不是让用户一次浏览最多商品，而是让用户：

1. 先感受品牌氛围。
2. 通过大图了解服装风格。
3. 阅读系列和设计师信息。
4. 在感兴趣后查看价格与颜色。
5. 最后进入购买或结账流程。

它适合以下类型的产品：

- 高端时装电商。
- 设计师品牌官网。
- 数字化时尚 Lookbook。
- 精品百货展示页面。
- 时尚品牌作品集。
- 以视觉内容为中心的购物 App。

## 一句话概括

这是一个**极简中性色、留白丰富、以大幅时尚摄影为核心、采用不对称杂志式卡片布局和柔和悬浮控件的高端时尚电商 UI**。它强调品牌氛围、视觉叙事和精品感，而不是传统电商的高密度商品浏览。
````

技术要求：

1. 设计合理的数据库结构
2. 前端开发使用React Native + Expo + TypeScript 最新的技术
3. 后端使用 Python + FastAPI + SQLite
4. 前端代码储存在 ./mobile
5. 后端代码储存在 ./infra
6. 代码要求组织结构清晰，易维护，尽可能强调可复用性
7. 需要有完善的功能测试
8. 永远分离 config 以及其他设置性常量到config.ts or config.py，不要在代码文件内部设置设置性常量，只能 import
9. UI界面所有元素的位置以及形状参数（如 border radius等）都需要有严格的数学以及视觉逻辑支撑。
10. APP UI文字支持中英双语，可以在设置切换语言。
11. 设置合理的gitignore
12. 如果需要用 .env ，设置.env.example 和 .env

icon在./icon.jpg
