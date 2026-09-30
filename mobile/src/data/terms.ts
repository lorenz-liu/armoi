/**
 * Terms of Use — bilingual body for the in-app reader.
 * This is a conventional consumer-app template, not legal advice.
 */

export type TermsSection = { heading: string; body: string };

export type TermsDocument = {
  title: string;
  updated: string;
  intro: string;
  sections: TermsSection[];
};

export const TERMS: Record<'en' | 'zh', TermsDocument> = {
  en: {
    title: 'Terms of Use',
    updated: 'Last updated: 30 September 2026',
    intro:
      'These Terms of Use (“Terms”) govern your access to and use of Armoi, including the mobile application and related API services (together, the “Service”). By signing in or otherwise using Armoi, you agree to these Terms. If you do not agree, do not use the Service.',
    sections: [
      {
        heading: '1. The Service',
        body: 'Armoi is a personal wardrobe library. It lets you photograph clothing, shoes, bags and jewellery, organise them by brand, storage place and category, track wear, and note pairings. Armoi is provided for personal, non-commercial use unless we agree otherwise in writing.',
      },
      {
        heading: '2. Eligibility and accounts',
        body: 'You must be able to form a binding contract in your jurisdiction to use Armoi. You sign in with Google or Apple; we do not issue separate Armoi passwords. You are responsible for keeping access to your Google or Apple account secure and for activity that occurs under your Armoi account. You must provide accurate information and promptly update it if it changes.',
      },
      {
        heading: '3. Your library content',
        body: 'You retain ownership of the photos, names, notes and other material you upload or create in Armoi (“Your Content”). By using the Service you grant us a limited licence to host, store, process, display and transmit Your Content solely as needed to operate and improve the Service for you (for example storing images and serving them back to your devices). We do not claim ownership of Your Content and we do not use it to advertise products to others.',
      },
      {
        heading: '4. Privacy',
        body: 'Your wardrobe is private to your account. We do not sell Your Content. Sign-in is handled by Google or Apple; we receive identity tokens and basic profile fields needed to create and recognise your account (such as a stable subject identifier and, when provided, email or display name). We store library data and photos on our servers and object storage to provide the Service. Do not upload content you are not allowed to share with us for that purpose.',
      },
      {
        heading: '5. Acceptable use',
        body: 'You agree not to: misuse the Service or interfere with its operation; attempt unauthorised access to other users’ data or our systems; upload unlawful, infringing or harmful content; reverse engineer the Service except where permitted by law; or use Armoi to spam, harass or violate others’ rights. We may suspend or terminate access if we reasonably believe you have breached these Terms.',
      },
      {
        heading: '6. Intellectual property',
        body: 'Armoi, including its name, branding, design, software and the fixed category vocabulary we ship, is owned by us or our licensors. These Terms do not grant you any right to copy, modify or redistribute our software or branding except as needed to use the Service in the ordinary way.',
      },
      {
        heading: '7. Third-party services',
        body: 'Sign-in and related features depend on Google and/or Apple. Their terms and privacy policies also apply to your use of those providers. We are not responsible for those services. If a provider changes or withdraws access, parts of Armoi may stop working until we adapt.',
      },
      {
        heading: '8. Availability and changes',
        body: 'We aim to keep Armoi available but do not guarantee uninterrupted or error-free operation. We may change, suspend or discontinue features, including storage limits or supported platforms, with reasonable notice when practicable. We may update these Terms from time to time; continued use after an update constitutes acceptance of the revised Terms. The “Last updated” date above will change when we revise them.',
      },
      {
        heading: '9. Disclaimers',
        body: 'THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE”, WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW. Armoi is a catalogue tool; it does not provide valuation, insurance, authenticity or professional advice about your possessions.',
      },
      {
        heading: '10. Limitation of liability',
        body: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR SUPPLIERS ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR FOR LOSS OF DATA, PROFITS OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE IS LIMITED TO THE GREATER OF (A) THE AMOUNTS YOU PAID US FOR THE SERVICE IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) FIFTY US DOLLARS (US$50). Some jurisdictions do not allow certain limitations; in those places our liability is limited to the fullest extent allowed.',
      },
      {
        heading: '11. Termination',
        body: 'You may stop using Armoi at any time and sign out. You may request deletion of your account and associated library data by contacting us through the contact method we publish in the app or on our website. We may terminate or suspend the Service or your access if you breach these Terms or if we discontinue Armoi. Provisions that by their nature should survive (including ownership, disclaimers and liability limits) will survive termination.',
      },
      {
        heading: '12. General',
        body: 'These Terms are the entire agreement between you and us regarding Armoi and supersede prior agreements on that subject. If a provision is unenforceable, the rest remains in effect. Failure to enforce a provision is not a waiver. You may not assign these Terms without our consent; we may assign them in connection with a merger, sale or reorganisation. Governing law and venue will be those of the jurisdiction in which the operator of Armoi is established, except where mandatory consumer protection laws of your country require otherwise.',
      },
      {
        heading: '13. Contact',
        body: 'Questions about these Terms may be sent to the support or contact address listed in the Armoi app settings or project documentation for your build.',
      },
    ],
  },

  zh: {
    title: '用户条款',
    updated: '最近更新：2026 年 9 月 30 日',
    intro:
      '本《用户条款》（下称“本条款”）约束你对 Armoi 的访问与使用，包括移动应用及相关 API 服务（合称“本服务”）。登录或以其他方式使用 Armoi，即表示你同意本条款。如不同意，请勿使用本服务。',
    sections: [
      {
        heading: '1. 服务内容',
        body: 'Armoi 是个人服饰与首饰资料库，供你为服装、鞋履、箱包与珠宝拍照，按品牌、收纳位置与类别整理，记录穿着，并标注搭配。除非另有书面约定，Armoi 仅供个人、非商业用途。',
      },
      {
        heading: '2. 资格与账户',
        body: '你须具备所在地法律认可的缔约能力方可使用 Armoi。你通过 Google 或 Apple 登录；我们不另行发放 Armoi 密码。你应妥善保管对 Google / Apple 账户的访问，并对以你的 Armoi 账户进行的活动负责。你应提供准确信息，并在变更时及时更新。',
      },
      {
        heading: '3. 你的衣橱内容',
        body: '你上传或创建的照片、名称、备注及其他材料（“你的内容”）仍归你所有。使用本服务即表示你授予我们一项有限许可，仅为向你运营与改进本服务之所需，托管、存储、处理、展示与传输你的内容（例如存储图片并回传至你的设备）。我们不主张你的内容的所有权，也不会将其用于向他人推销商品。',
      },
      {
        heading: '4. 隐私',
        body: '你的衣橱仅对你的账户可见。我们不出售你的内容。登录由 Google 或 Apple 处理；我们接收创建与识别账户所需的身份令牌及基本资料字段（例如稳定的主体标识，以及在提供时的邮箱或显示名称）。衣橱数据与照片存储于我们的服务器与对象存储，以便提供本服务。请勿上传你无权为此目的与我们共享的内容。',
      },
      {
        heading: '5. 合理使用',
        body: '你同意不得：滥用本服务或干扰其运行；试图未经授权访问其他用户数据或我们的系统；上传违法、侵权或有害内容；在法律禁止的范围内对本服务进行反向工程；或利用 Armoi 进行骚扰、滥发信息或侵害他人权利。若我们合理认为你违反本条款，可暂停或终止访问。',
      },
      {
        heading: '6. 知识产权',
        body: 'Armoi 及其名称、品牌、设计、软件以及我们提供的固定类别词表，归我们或许可方所有。本条款不授予你复制、修改或再分发我们软件或品牌的权利，日常使用本服务所必需者除外。',
      },
      {
        heading: '7. 第三方服务',
        body: '登录及相关功能依赖 Google 和/或 Apple。你使用这些服务时亦受其条款与隐私政策约束。我们不对第三方服务负责。若提供方变更或撤回接入，Armoi 的部分功能可能暂停，直至我们作出调整。',
      },
      {
        heading: '8. 可用性与变更',
        body: '我们力求保持 Armoi 可用，但不保证不中断或无错误。我们可能变更、暂停或下线功能（包括存储额度或支持的平台），并在可行时给予合理通知。我们可能不时更新本条款；更新后继续使用即视为接受修订后的条款。修订时将更新上方的“最近更新”日期。',
      },
      {
        heading: '9. 免责声明',
        body: '在法律允许的最大范围内，本服务按“现状”和“可用”提供，不作任何明示或默示保证，包括适销性、特定用途适用性及不侵权。Armoi 是整理工具，不提供估价、保险、真伪鉴定，也不就你的物品提供专业意见。',
      },
      {
        heading: '10. 责任限制',
        body: '在法律允许的最大范围内，我们及供应商不对因使用本服务引起的间接、附带、特殊、后果性或惩罚性损害，或数据、利润、商誉损失承担责任。就与本服务有关的任何索赔，我们的累计责任以以下较高者为限：（a）索赔前十二个月内你就本服务向我们支付的费用；或（b）五十美元（US$50）。部分法域不允许某些限制，则我们的责任以该法域允许的最大范围为限。',
      },
      {
        heading: '11. 终止',
        body: '你可随时停止使用 Armoi 并退出登录。你可通过应用内或项目文档中公布的联系方式请求删除账户及相关衣橱数据。若你违反本条款，或我们停止运营 Armoi，我们可终止或暂停服务或你的访问。依其性质应继续有效的条款（包括权属、免责与责任限制）在终止后仍然有效。',
      },
      {
        heading: '12. 一般条款',
        body: '本条款构成你与我们之间关于 Armoi 的完整协议，并取代此前就同一事项的约定。某一条款无效不影响其余条款。未行使权利不构成弃权。未经我们同意你不得转让本条款；我们可在合并、出售或重组时转让。除你所在地强制性消费者保护法另有规定外，适用法律与管辖以 Armoi 运营主体所在地为准。',
      },
      {
        heading: '13. 联系方式',
        body: '有关本条款的问题，请通过 Armoi 应用设置或你所使用构建版本项目文档中列出的支持/联系方式与我们联系。',
      },
    ],
  },
};
