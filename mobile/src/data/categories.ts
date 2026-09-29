/**
 * Canonical category tree — GENERATED, do not edit by hand.
 * Source of truth: TODO.md; regenerate with `python infra/scripts/build_categories.py --write`.
 */

export type CategoryNode = {
  id: string;
  zh: string;
  en: string;
  children: CategoryNode[];
};

export const CATEGORY_TREE: CategoryNode[] = [
  {
    "id": "clothing",
    "zh": "服装",
    "en": "Clothing",
    "children": [
      {
        "id": "clothing.tops",
        "zh": "上装",
        "en": "Tops",
        "children": [
          {
            "id": "clothing.tops.t-shirts",
            "zh": "T恤",
            "en": "T-Shirts",
            "children": []
          },
          {
            "id": "clothing.tops.shirts",
            "zh": "衬衫",
            "en": "Shirts",
            "children": []
          },
          {
            "id": "clothing.tops.blouses",
            "zh": "女式衬衫",
            "en": "Blouses",
            "children": []
          },
          {
            "id": "clothing.tops.sweaters",
            "zh": "毛衣",
            "en": "Sweaters",
            "children": []
          },
          {
            "id": "clothing.tops.hoodies-and-sweatshirts",
            "zh": "连帽衫与卫衣",
            "en": "Hoodies & Sweatshirts",
            "children": []
          },
          {
            "id": "clothing.tops.cardigans",
            "zh": "开衫",
            "en": "Cardigans",
            "children": []
          },
          {
            "id": "clothing.tops.vests",
            "zh": "背心",
            "en": "Vests",
            "children": []
          },
          {
            "id": "clothing.tops.bodysuits",
            "zh": "连体衣",
            "en": "Bodysuits",
            "children": []
          }
        ]
      },
      {
        "id": "clothing.bottoms",
        "zh": "下装",
        "en": "Bottoms",
        "children": [
          {
            "id": "clothing.bottoms.jeans",
            "zh": "牛仔裤",
            "en": "Jeans",
            "children": []
          },
          {
            "id": "clothing.bottoms.trousers",
            "zh": "西裤",
            "en": "Trousers",
            "children": []
          },
          {
            "id": "clothing.bottoms.casual-pants",
            "zh": "休闲裤",
            "en": "Casual Pants",
            "children": []
          },
          {
            "id": "clothing.bottoms.shorts",
            "zh": "短裤",
            "en": "Shorts",
            "children": []
          },
          {
            "id": "clothing.bottoms.skirts",
            "zh": "半身裙",
            "en": "Skirts",
            "children": []
          },
          {
            "id": "clothing.bottoms.leggings",
            "zh": "紧身裤",
            "en": "Leggings",
            "children": []
          }
        ]
      },
      {
        "id": "clothing.dresses-and-jumpsuits",
        "zh": "连衣裙与连体服",
        "en": "Dresses & Jumpsuits",
        "children": [
          {
            "id": "clothing.dresses-and-jumpsuits.dresses",
            "zh": "连衣裙",
            "en": "Dresses",
            "children": []
          },
          {
            "id": "clothing.dresses-and-jumpsuits.jumpsuits",
            "zh": "连体裤",
            "en": "Jumpsuits",
            "children": []
          },
          {
            "id": "clothing.dresses-and-jumpsuits.playsuits",
            "zh": "短款连体服",
            "en": "Playsuits",
            "children": []
          }
        ]
      },
      {
        "id": "clothing.outerwear",
        "zh": "外套",
        "en": "Outerwear",
        "children": [
          {
            "id": "clothing.outerwear.coats",
            "zh": "大衣",
            "en": "Coats",
            "children": []
          },
          {
            "id": "clothing.outerwear.jackets",
            "zh": "夹克",
            "en": "Jackets",
            "children": []
          },
          {
            "id": "clothing.outerwear.blazers",
            "zh": "西装外套",
            "en": "Blazers",
            "children": []
          },
          {
            "id": "clothing.outerwear.trench-coats",
            "zh": "风衣",
            "en": "Trench Coats",
            "children": []
          },
          {
            "id": "clothing.outerwear.parkas",
            "zh": "派克大衣",
            "en": "Parkas",
            "children": []
          },
          {
            "id": "clothing.outerwear.puffer-jackets",
            "zh": "羽绒服",
            "en": "Puffer Jackets",
            "children": []
          },
          {
            "id": "clothing.outerwear.leather-jackets",
            "zh": "皮夹克",
            "en": "Leather Jackets",
            "children": []
          },
          {
            "id": "clothing.outerwear.rainwear",
            "zh": "雨衣",
            "en": "Rainwear",
            "children": []
          }
        ]
      },
      {
        "id": "clothing.suits-and-tailoring",
        "zh": "西装与定制服装",
        "en": "Suits & Tailoring",
        "children": [
          {
            "id": "clothing.suits-and-tailoring.suits",
            "zh": "西装套装",
            "en": "Suits",
            "children": []
          },
          {
            "id": "clothing.suits-and-tailoring.suit-jackets",
            "zh": "西装外套",
            "en": "Suit Jackets",
            "children": []
          },
          {
            "id": "clothing.suits-and-tailoring.suit-trousers",
            "zh": "西装裤",
            "en": "Suit Trousers",
            "children": []
          },
          {
            "id": "clothing.suits-and-tailoring.tuxedos",
            "zh": "礼服西装",
            "en": "Tuxedos",
            "children": []
          }
        ]
      },
      {
        "id": "clothing.activewear",
        "zh": "运动服",
        "en": "Activewear",
        "children": [
          {
            "id": "clothing.activewear.sports-tops",
            "zh": "运动上衣",
            "en": "Sports Tops",
            "children": []
          },
          {
            "id": "clothing.activewear.sports-bras",
            "zh": "运动内衣",
            "en": "Sports Bras",
            "children": []
          },
          {
            "id": "clothing.activewear.track-pants",
            "zh": "运动长裤",
            "en": "Track Pants",
            "children": []
          },
          {
            "id": "clothing.activewear.active-leggings",
            "zh": "运动紧身裤",
            "en": "Active Leggings",
            "children": []
          },
          {
            "id": "clothing.activewear.active-shorts",
            "zh": "运动短裤",
            "en": "Active Shorts",
            "children": []
          },
          {
            "id": "clothing.activewear.performance-jackets",
            "zh": "功能外套",
            "en": "Performance Jackets",
            "children": []
          }
        ]
      },
      {
        "id": "clothing.loungewear-and-sleepwear",
        "zh": "家居服与睡衣",
        "en": "Loungewear & Sleepwear",
        "children": [
          {
            "id": "clothing.loungewear-and-sleepwear.loungewear",
            "zh": "家居服",
            "en": "Loungewear",
            "children": []
          },
          {
            "id": "clothing.loungewear-and-sleepwear.pajamas",
            "zh": "睡衣",
            "en": "Pajamas",
            "children": []
          },
          {
            "id": "clothing.loungewear-and-sleepwear.robes",
            "zh": "睡袍",
            "en": "Robes",
            "children": []
          },
          {
            "id": "clothing.loungewear-and-sleepwear.slippers",
            "zh": "室内拖鞋",
            "en": "Slippers",
            "children": []
          }
        ]
      },
      {
        "id": "clothing.underwear-and-hosiery",
        "zh": "内衣与袜类",
        "en": "Underwear & Hosiery",
        "children": [
          {
            "id": "clothing.underwear-and-hosiery.underwear",
            "zh": "内裤",
            "en": "Underwear",
            "children": []
          },
          {
            "id": "clothing.underwear-and-hosiery.bras",
            "zh": "文胸",
            "en": "Bras",
            "children": []
          },
          {
            "id": "clothing.underwear-and-hosiery.socks",
            "zh": "袜子",
            "en": "Socks",
            "children": []
          },
          {
            "id": "clothing.underwear-and-hosiery.tights",
            "zh": "连裤袜",
            "en": "Tights",
            "children": []
          },
          {
            "id": "clothing.underwear-and-hosiery.stockings",
            "zh": "长筒袜",
            "en": "Stockings",
            "children": []
          }
        ]
      },
      {
        "id": "clothing.swimwear",
        "zh": "泳装",
        "en": "Swimwear",
        "children": [
          {
            "id": "clothing.swimwear.one-piece-swimsuits",
            "zh": "连体泳衣",
            "en": "One-Piece Swimsuits",
            "children": []
          },
          {
            "id": "clothing.swimwear.bikinis",
            "zh": "比基尼",
            "en": "Bikinis",
            "children": []
          },
          {
            "id": "clothing.swimwear.swim-trunks",
            "zh": "泳裤",
            "en": "Swim Trunks",
            "children": []
          },
          {
            "id": "clothing.swimwear.cover-ups",
            "zh": "泳装外搭",
            "en": "Cover-Ups",
            "children": []
          },
          {
            "id": "clothing.swimwear.rash-guards",
            "zh": "防晒泳衣",
            "en": "Rash Guards",
            "children": []
          }
        ]
      }
    ]
  },
  {
    "id": "shoes",
    "zh": "鞋履",
    "en": "Shoes",
    "children": [
      {
        "id": "shoes.sneakers",
        "zh": "运动鞋",
        "en": "Sneakers",
        "children": [
          {
            "id": "shoes.sneakers.lifestyle-sneakers",
            "zh": "休闲运动鞋",
            "en": "Lifestyle Sneakers",
            "children": []
          },
          {
            "id": "shoes.sneakers.running-shoes",
            "zh": "跑鞋",
            "en": "Running Shoes",
            "children": []
          },
          {
            "id": "shoes.sneakers.training-shoes",
            "zh": "训练鞋",
            "en": "Training Shoes",
            "children": []
          },
          {
            "id": "shoes.sneakers.basketball-shoes",
            "zh": "篮球鞋",
            "en": "Basketball Shoes",
            "children": []
          },
          {
            "id": "shoes.sneakers.designer-sneakers",
            "zh": "设计师运动鞋",
            "en": "Designer Sneakers",
            "children": []
          }
        ]
      },
      {
        "id": "shoes.boots",
        "zh": "靴子",
        "en": "Boots",
        "children": [
          {
            "id": "shoes.boots.ankle-boots",
            "zh": "短靴",
            "en": "Ankle Boots",
            "children": []
          },
          {
            "id": "shoes.boots.chelsea-boots",
            "zh": "切尔西靴",
            "en": "Chelsea Boots",
            "children": []
          },
          {
            "id": "shoes.boots.knee-high-boots",
            "zh": "长筒靴",
            "en": "Knee-High Boots",
            "children": []
          },
          {
            "id": "shoes.boots.riding-boots",
            "zh": "骑马靴",
            "en": "Riding Boots",
            "children": []
          },
          {
            "id": "shoes.boots.combat-boots",
            "zh": "工装靴",
            "en": "Combat Boots",
            "children": []
          },
          {
            "id": "shoes.boots.hiking-boots",
            "zh": "徒步靴",
            "en": "Hiking Boots",
            "children": []
          },
          {
            "id": "shoes.boots.winter-boots",
            "zh": "冬靴",
            "en": "Winter Boots",
            "children": []
          }
        ]
      },
      {
        "id": "shoes.flats",
        "zh": "平底鞋",
        "en": "Flats",
        "children": [
          {
            "id": "shoes.flats.ballet-flats",
            "zh": "芭蕾平底鞋",
            "en": "Ballet Flats",
            "children": []
          },
          {
            "id": "shoes.flats.loafers",
            "zh": "乐福鞋",
            "en": "Loafers",
            "children": []
          },
          {
            "id": "shoes.flats.moccasins",
            "zh": "豆豆鞋",
            "en": "Moccasins",
            "children": []
          },
          {
            "id": "shoes.flats.slippers",
            "zh": "室内拖鞋",
            "en": "Slippers",
            "children": []
          }
        ]
      },
      {
        "id": "shoes.heels",
        "zh": "高跟鞋",
        "en": "Heels",
        "children": [
          {
            "id": "shoes.heels.pumps",
            "zh": "浅口高跟鞋",
            "en": "Pumps",
            "children": []
          },
          {
            "id": "shoes.heels.stiletto-heels",
            "zh": "细跟鞋",
            "en": "Stiletto Heels",
            "children": []
          },
          {
            "id": "shoes.heels.block-heels",
            "zh": "粗跟鞋",
            "en": "Block Heels",
            "children": []
          },
          {
            "id": "shoes.heels.kitten-heels",
            "zh": "猫跟鞋",
            "en": "Kitten Heels",
            "children": []
          },
          {
            "id": "shoes.heels.platform-heels",
            "zh": "厚底高跟鞋",
            "en": "Platform Heels",
            "children": []
          }
        ]
      },
      {
        "id": "shoes.sandals",
        "zh": "凉鞋",
        "en": "Sandals",
        "children": [
          {
            "id": "shoes.sandals.flat-sandals",
            "zh": "平底凉鞋",
            "en": "Flat Sandals",
            "children": []
          },
          {
            "id": "shoes.sandals.heeled-sandals",
            "zh": "高跟凉鞋",
            "en": "Heeled Sandals",
            "children": []
          },
          {
            "id": "shoes.sandals.platform-sandals",
            "zh": "厚底凉鞋",
            "en": "Platform Sandals",
            "children": []
          },
          {
            "id": "shoes.sandals.sport-sandals",
            "zh": "户外凉鞋",
            "en": "Sport Sandals",
            "children": []
          }
        ]
      },
      {
        "id": "shoes.formal-shoes",
        "zh": "正装鞋",
        "en": "Formal Shoes",
        "children": [
          {
            "id": "shoes.formal-shoes.oxfords",
            "zh": "牛津鞋",
            "en": "Oxfords",
            "children": []
          },
          {
            "id": "shoes.formal-shoes.derbies",
            "zh": "德比鞋",
            "en": "Derbies",
            "children": []
          },
          {
            "id": "shoes.formal-shoes.monk-straps",
            "zh": "僧侣鞋",
            "en": "Monk Straps",
            "children": []
          },
          {
            "id": "shoes.formal-shoes.dress-loafers",
            "zh": "正装乐福鞋",
            "en": "Dress Loafers",
            "children": []
          }
        ]
      },
      {
        "id": "shoes.specialty-footwear",
        "zh": "特殊鞋类",
        "en": "Specialty Footwear",
        "children": [
          {
            "id": "shoes.specialty-footwear.beach-shoes",
            "zh": "沙滩鞋",
            "en": "Beach Shoes",
            "children": []
          },
          {
            "id": "shoes.specialty-footwear.indoor-shoes",
            "zh": "室内鞋",
            "en": "Indoor Shoes",
            "children": []
          },
          {
            "id": "shoes.specialty-footwear.slippers",
            "zh": "拖鞋",
            "en": "Slippers",
            "children": []
          },
          {
            "id": "shoes.specialty-footwear.shoe-care",
            "zh": "鞋类护理用品",
            "en": "Shoe Care",
            "children": []
          }
        ]
      }
    ]
  },
  {
    "id": "bags",
    "zh": "包袋",
    "en": "Bags",
    "children": [
      {
        "id": "bags.handbags",
        "zh": "手提包",
        "en": "Handbags",
        "children": [
          {
            "id": "bags.handbags.shoulder-bags",
            "zh": "肩背包",
            "en": "Shoulder Bags",
            "children": []
          },
          {
            "id": "bags.handbags.crossbody-bags",
            "zh": "斜挎包",
            "en": "Crossbody Bags",
            "children": []
          },
          {
            "id": "bags.handbags.top-handle-bags",
            "zh": "手提包",
            "en": "Top-Handle Bags",
            "children": []
          },
          {
            "id": "bags.handbags.tote-bags",
            "zh": "托特包",
            "en": "Tote Bags",
            "children": []
          },
          {
            "id": "bags.handbags.hobo-bags",
            "zh": "流浪包",
            "en": "Hobo Bags",
            "children": []
          },
          {
            "id": "bags.handbags.bucket-bags",
            "zh": "水桶包",
            "en": "Bucket Bags",
            "children": []
          },
          {
            "id": "bags.handbags.satchels",
            "zh": "公文包",
            "en": "Satchels",
            "children": []
          }
        ]
      },
      {
        "id": "bags.mini-and-evening-bags",
        "zh": "迷你包与晚宴包",
        "en": "Mini & Evening Bags",
        "children": [
          {
            "id": "bags.mini-and-evening-bags.mini-bags",
            "zh": "迷你包",
            "en": "Mini Bags",
            "children": []
          },
          {
            "id": "bags.mini-and-evening-bags.clutches",
            "zh": "手拿包",
            "en": "Clutches",
            "children": []
          },
          {
            "id": "bags.mini-and-evening-bags.evening-bags",
            "zh": "晚宴包",
            "en": "Evening Bags",
            "children": []
          },
          {
            "id": "bags.mini-and-evening-bags.wristlets",
            "zh": "腕带包",
            "en": "Wristlets",
            "children": []
          }
        ]
      },
      {
        "id": "bags.backpacks",
        "zh": "双肩包",
        "en": "Backpacks",
        "children": [
          {
            "id": "bags.backpacks.everyday-backpacks",
            "zh": "日常双肩包",
            "en": "Everyday Backpacks",
            "children": []
          },
          {
            "id": "bags.backpacks.work-backpacks",
            "zh": "通勤双肩包",
            "en": "Work Backpacks",
            "children": []
          },
          {
            "id": "bags.backpacks.travel-backpacks",
            "zh": "旅行双肩包",
            "en": "Travel Backpacks",
            "children": []
          },
          {
            "id": "bags.backpacks.technical-backpacks",
            "zh": "功能型双肩包",
            "en": "Technical Backpacks",
            "children": []
          }
        ]
      },
      {
        "id": "bags.work-and-business-bags",
        "zh": "工作与商务包",
        "en": "Work & Business Bags",
        "children": [
          {
            "id": "bags.work-and-business-bags.briefcases",
            "zh": "公文包",
            "en": "Briefcases",
            "children": []
          },
          {
            "id": "bags.work-and-business-bags.laptop-bags",
            "zh": "电脑包",
            "en": "Laptop Bags",
            "children": []
          },
          {
            "id": "bags.work-and-business-bags.document-holders",
            "zh": "文件袋",
            "en": "Document Holders",
            "children": []
          },
          {
            "id": "bags.work-and-business-bags.portfolio-bags",
            "zh": "资料包",
            "en": "Portfolio Bags",
            "children": []
          }
        ]
      },
      {
        "id": "bags.travel-bags",
        "zh": "旅行包",
        "en": "Travel Bags",
        "children": [
          {
            "id": "bags.travel-bags.duffel-bags",
            "zh": "行李袋",
            "en": "Duffel Bags",
            "children": []
          },
          {
            "id": "bags.travel-bags.weekender-bags",
            "zh": "周末旅行包",
            "en": "Weekender Bags",
            "children": []
          },
          {
            "id": "bags.travel-bags.suitcases",
            "zh": "行李箱",
            "en": "Suitcases",
            "children": []
          },
          {
            "id": "bags.travel-bags.garment-bags",
            "zh": "西装袋",
            "en": "Garment Bags",
            "children": []
          },
          {
            "id": "bags.travel-bags.travel-organizers",
            "zh": "旅行收纳包",
            "en": "Travel Organizers",
            "children": []
          }
        ]
      },
      {
        "id": "bags.small-leather-goods",
        "zh": "小型皮具",
        "en": "Small Leather Goods",
        "children": [
          {
            "id": "bags.small-leather-goods.wallets",
            "zh": "钱包",
            "en": "Wallets",
            "children": []
          },
          {
            "id": "bags.small-leather-goods.card-holders",
            "zh": "卡包",
            "en": "Card Holders",
            "children": []
          },
          {
            "id": "bags.small-leather-goods.coin-purses",
            "zh": "零钱包",
            "en": "Coin Purses",
            "children": []
          },
          {
            "id": "bags.small-leather-goods.key-cases",
            "zh": "钥匙包",
            "en": "Key Cases",
            "children": []
          },
          {
            "id": "bags.small-leather-goods.passport-holders",
            "zh": "护照夹",
            "en": "Passport Holders",
            "children": []
          }
        ]
      },
      {
        "id": "bags.specialty-bags",
        "zh": "特殊包袋",
        "en": "Specialty Bags",
        "children": [
          {
            "id": "bags.specialty-bags.belt-bags",
            "zh": "腰包",
            "en": "Belt Bags",
            "children": []
          },
          {
            "id": "bags.specialty-bags.pouches",
            "zh": "收纳袋",
            "en": "Pouches",
            "children": []
          },
          {
            "id": "bags.specialty-bags.camera-bags",
            "zh": "相机包",
            "en": "Camera Bags",
            "children": []
          },
          {
            "id": "bags.specialty-bags.beach-bags",
            "zh": "沙滩包",
            "en": "Beach Bags",
            "children": []
          },
          {
            "id": "bags.specialty-bags.shopping-bags",
            "zh": "购物袋",
            "en": "Shopping Bags",
            "children": []
          }
        ]
      }
    ]
  },
  {
    "id": "accessories",
    "zh": "配饰",
    "en": "Accessories",
    "children": [
      {
        "id": "accessories.jewellery",
        "zh": "珠宝首饰",
        "en": "Jewellery",
        "children": [
          {
            "id": "accessories.jewellery.necklaces",
            "zh": "项链",
            "en": "Necklaces",
            "children": []
          },
          {
            "id": "accessories.jewellery.earrings",
            "zh": "耳环",
            "en": "Earrings",
            "children": []
          },
          {
            "id": "accessories.jewellery.bracelets",
            "zh": "手链",
            "en": "Bracelets",
            "children": []
          },
          {
            "id": "accessories.jewellery.rings",
            "zh": "戒指",
            "en": "Rings",
            "children": []
          },
          {
            "id": "accessories.jewellery.brooches",
            "zh": "胸针",
            "en": "Brooches",
            "children": []
          },
          {
            "id": "accessories.jewellery.body-jewellery",
            "zh": "身体首饰",
            "en": "Body Jewellery",
            "children": []
          }
        ]
      },
      {
        "id": "accessories.watches",
        "zh": "腕表",
        "en": "Watches",
        "children": [
          {
            "id": "accessories.watches.mechanical-watches",
            "zh": "机械表",
            "en": "Mechanical Watches",
            "children": []
          },
          {
            "id": "accessories.watches.quartz-watches",
            "zh": "石英表",
            "en": "Quartz Watches",
            "children": []
          },
          {
            "id": "accessories.watches.smartwatches",
            "zh": "智能手表",
            "en": "Smartwatches",
            "children": []
          },
          {
            "id": "accessories.watches.watch-straps",
            "zh": "表带",
            "en": "Watch Straps",
            "children": []
          }
        ]
      },
      {
        "id": "accessories.belts",
        "zh": "腰带",
        "en": "Belts",
        "children": [
          {
            "id": "accessories.belts.leather-belts",
            "zh": "皮带",
            "en": "Leather Belts",
            "children": []
          },
          {
            "id": "accessories.belts.chain-belts",
            "zh": "链条腰带",
            "en": "Chain Belts",
            "children": []
          },
          {
            "id": "accessories.belts.waist-belts",
            "zh": "腰封",
            "en": "Waist Belts",
            "children": []
          },
          {
            "id": "accessories.belts.dress-belts",
            "zh": "正装腰带",
            "en": "Dress Belts",
            "children": []
          }
        ]
      },
      {
        "id": "accessories.hats-and-headwear",
        "zh": "帽子与头饰",
        "en": "Hats & Headwear",
        "children": [
          {
            "id": "accessories.hats-and-headwear.baseball-caps",
            "zh": "棒球帽",
            "en": "Baseball Caps",
            "children": []
          },
          {
            "id": "accessories.hats-and-headwear.beanies",
            "zh": "针织帽",
            "en": "Beanies",
            "children": []
          },
          {
            "id": "accessories.hats-and-headwear.fedoras",
            "zh": "费多拉帽",
            "en": "Fedoras",
            "children": []
          },
          {
            "id": "accessories.hats-and-headwear.bucket-hats",
            "zh": "渔夫帽",
            "en": "Bucket Hats",
            "children": []
          },
          {
            "id": "accessories.hats-and-headwear.sun-hats",
            "zh": "遮阳帽",
            "en": "Sun Hats",
            "children": []
          }
        ]
      },
      {
        "id": "accessories.scarves-and-wraps",
        "zh": "围巾与披肩",
        "en": "Scarves & Wraps",
        "children": [
          {
            "id": "accessories.scarves-and-wraps.silk-scarves",
            "zh": "真丝围巾",
            "en": "Silk Scarves",
            "children": []
          },
          {
            "id": "accessories.scarves-and-wraps.wool-scarves",
            "zh": "羊毛围巾",
            "en": "Wool Scarves",
            "children": []
          },
          {
            "id": "accessories.scarves-and-wraps.shawls",
            "zh": "披肩",
            "en": "Shawls",
            "children": []
          },
          {
            "id": "accessories.scarves-and-wraps.wraps",
            "zh": "围裹式披巾",
            "en": "Wraps",
            "children": []
          }
        ]
      },
      {
        "id": "accessories.gloves",
        "zh": "手套",
        "en": "Gloves",
        "children": [
          {
            "id": "accessories.gloves.leather-gloves",
            "zh": "皮手套",
            "en": "Leather Gloves",
            "children": []
          },
          {
            "id": "accessories.gloves.wool-gloves",
            "zh": "羊毛手套",
            "en": "Wool Gloves",
            "children": []
          },
          {
            "id": "accessories.gloves.touchscreen-gloves",
            "zh": "触屏手套",
            "en": "Touchscreen Gloves",
            "children": []
          },
          {
            "id": "accessories.gloves.winter-gloves",
            "zh": "冬季手套",
            "en": "Winter Gloves",
            "children": []
          }
        ]
      },
      {
        "id": "accessories.eyewear",
        "zh": "眼镜",
        "en": "Eyewear",
        "children": [
          {
            "id": "accessories.eyewear.sunglasses",
            "zh": "太阳镜",
            "en": "Sunglasses",
            "children": []
          },
          {
            "id": "accessories.eyewear.optical-frames",
            "zh": "光学镜框",
            "en": "Optical Frames",
            "children": []
          },
          {
            "id": "accessories.eyewear.blue-light-glasses",
            "zh": "防蓝光眼镜",
            "en": "Blue-Light Glasses",
            "children": []
          }
        ]
      },
      {
        "id": "accessories.hair-accessories",
        "zh": "发饰",
        "en": "Hair Accessories",
        "children": [
          {
            "id": "accessories.hair-accessories.hair-clips",
            "zh": "发夹",
            "en": "Hair Clips",
            "children": []
          },
          {
            "id": "accessories.hair-accessories.headbands",
            "zh": "发带",
            "en": "Headbands",
            "children": []
          },
          {
            "id": "accessories.hair-accessories.scrunchies",
            "zh": "发圈",
            "en": "Scrunchies",
            "children": []
          },
          {
            "id": "accessories.hair-accessories.hair-pins",
            "zh": "发簪",
            "en": "Hair Pins",
            "children": []
          }
        ]
      },
      {
        "id": "accessories.ties-and-formal-accessories",
        "zh": "领带与正装配饰",
        "en": "Ties & Formal Accessories",
        "children": [
          {
            "id": "accessories.ties-and-formal-accessories.neckties",
            "zh": "领带",
            "en": "Neckties",
            "children": []
          },
          {
            "id": "accessories.ties-and-formal-accessories.bow-ties",
            "zh": "领结",
            "en": "Bow Ties",
            "children": []
          },
          {
            "id": "accessories.ties-and-formal-accessories.pocket-squares",
            "zh": "方巾",
            "en": "Pocket Squares",
            "children": []
          },
          {
            "id": "accessories.ties-and-formal-accessories.cufflinks",
            "zh": "袖扣",
            "en": "Cufflinks",
            "children": []
          }
        ]
      },
      {
        "id": "accessories.tech-accessories",
        "zh": "数码配件",
        "en": "Tech Accessories",
        "children": [
          {
            "id": "accessories.tech-accessories.phone-cases",
            "zh": "手机壳",
            "en": "Phone Cases",
            "children": []
          },
          {
            "id": "accessories.tech-accessories.airpods-cases",
            "zh": "AirPods保护壳",
            "en": "AirPods Cases",
            "children": []
          },
          {
            "id": "accessories.tech-accessories.laptop-sleeves",
            "zh": "电脑内胆包",
            "en": "Laptop Sleeves",
            "children": []
          },
          {
            "id": "accessories.tech-accessories.smartwatch-accessories",
            "zh": "智能手表配件",
            "en": "Smartwatch Accessories",
            "children": []
          }
        ]
      },
      {
        "id": "accessories.seasonal-accessories",
        "zh": "季节性配饰",
        "en": "Seasonal Accessories",
        "children": [
          {
            "id": "accessories.seasonal-accessories.umbrellas",
            "zh": "雨伞",
            "en": "Umbrellas",
            "children": []
          },
          {
            "id": "accessories.seasonal-accessories.face-coverings",
            "zh": "面部遮挡用品",
            "en": "Face Coverings",
            "children": []
          },
          {
            "id": "accessories.seasonal-accessories.beach-accessories",
            "zh": "沙滩配饰",
            "en": "Beach Accessories",
            "children": []
          },
          {
            "id": "accessories.seasonal-accessories.winter-accessories",
            "zh": "冬季配饰",
            "en": "Winter Accessories",
            "children": []
          }
        ]
      }
    ]
  }
];

export type FlatCategory = {
  id: string;
  zh: string;
  en: string;
  depth: number;
  parentId: string | null;
  isLeaf: boolean;
};

function flatten(nodes: CategoryNode[], depth = 0, parentId: string | null = null): FlatCategory[] {
  return nodes.flatMap((node) => [
    { id: node.id, zh: node.zh, en: node.en, depth, parentId, isLeaf: node.children.length === 0 },
    ...flatten(node.children, depth + 1, node.id),
  ]);
}

export const CATEGORY_LIST: FlatCategory[] = flatten(CATEGORY_TREE);

function indexNodes(nodes: CategoryNode[]): Record<string, CategoryNode> {
  return nodes.reduce<Record<string, CategoryNode>>(
    (acc, node) => Object.assign(acc, { [node.id]: node }, indexNodes(node.children)),
    {},
  );
}

/** The tree node (with its children) for any id. */
export const CATEGORY_NODE_BY_ID: Record<string, CategoryNode> = indexNodes(CATEGORY_TREE);

/** Direct children of a category, or the roots when given `null`. */
export function categoryChildren(parentId: string | null): CategoryNode[] {
  return parentId === null ? CATEGORY_TREE : (CATEGORY_NODE_BY_ID[parentId]?.children ?? []);
}

export const CATEGORY_BY_ID: Record<string, FlatCategory> = Object.fromEntries(
  CATEGORY_LIST.map((c) => [c.id, c]),
);

/** Ancestor chain for a category id, root first, including the node itself. */
export function categoryChain(id: string | null | undefined): FlatCategory[] {
  if (!id) return [];
  const parts = id.split('.');
  return parts
    .map((_, i) => CATEGORY_BY_ID[parts.slice(0, i + 1).join('.')])
    .filter((node): node is FlatCategory => node !== undefined);
}
