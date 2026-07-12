import type { Locale } from "./config";

type LabelHint = { label: string; hint: string };
type LabelSub = { label: string; sub: string };
type SlideText = {
  eyebrow: string;
  headline: string;
  subline: string;
  cta: string;
  link: string;
};
type PromoText = { eyebrow: string; title: string };

export interface Dict {
  gate: {
    title: string;
    subtitle: string;
    placeholder: string;
    label: string;
    submit: string;
    error: string;
    show: string;
    hide: string;
  };
  announcement: {
    delivery: string;
    returns: string;
    promo: string;
    trackOrder: string;
    help: string;
  };
  language: { label: string };
  header: {
    openMenu: string;
    closeMenu: string;
    openSearch: string;
    searchPlaceholder: string;
    account: string;
    wishlist: string;
    cart: string;
    itemsSuffix: string;
  };
  nav: { allCategories: string; shopByCategory: string; menu: string };
  palette: {
    placeholder: string;
    trending: string;
    services: string;
    categories: string;
    quickActions: string;
    navigate: string;
    select: string;
    close: string;
    listening: string;
    searchFor: string;
    seeAll: string;
    dialogLabel: string;
    heard: string;
  };
  departments: { label: string; viewAll: string; shopNow: string };
  deals: {
    title: string;
    endsIn: string;
    viewAll: string;
    addToCart: string;
    bestseller: string;
    prev: string;
    next: string;
    pause: string;
    play: string;
  };
  cart: {
    title: string;
    empty: string;
    emptyHint: string;
    subtotal: string;
    goToCart: string;
    checkout: string;
    added: string;
    remove: string;
    close: string;
    continueShopping: string;
    open: string;
    decrease: string;
    increase: string;
    total: string;
    shipping: string;
    free: string;
    orderSummary: string;
    secure: string;
    bnpl: string;
    bnplNote: string;
    promo: string;
    promoPlaceholder: string;
    apply: string;
    addToWishlist: string;
    saved: string;
    reviews: string;
    inStock: string;
  };
  ai: {
    eyebrow: string;
    heading: string;
    subline: string;
    cta: string;
    heroTitle: string;
    heroDesc: string;
    recommendedTitle: string;
    recommendedNote: string;
    pick: string;
    features: Record<string, { title: string; desc: string }>;
  };
  services: {
    eyebrow: string;
    heading: string;
    subline: string;
    cta: Record<string, string>;
  };
  features: {
    delivery: LabelSub;
    secure: LabelSub;
    returns: LabelSub;
    support: LabelSub;
  };
  /** Keyed by nav/search item `key`. */
  items: Record<string, LabelHint>;
  /** Keyed by carousel slide id. */
  slides: Record<string, SlideText>;
  /** Keyed by promo tile id. */
  promos: Record<string, PromoText>;
}

const en: Dict = {
  gate: {
    title: "Welcome to Buyology",
    subtitle: "Enter the password to continue.",
    placeholder: "Password",
    label: "Site password",
    submit: "Unlock",
    error: "Incorrect password. Please try again.",
    show: "Show password",
    hide: "Hide password",
  },
  announcement: {
    delivery: "Free delivery over 100 AED",
    returns: "14-day returns",
    promo: "Sign up for 10% off with code WELCOME10",
    trackOrder: "Track order",
    help: "Help",
  },
  language: { label: "Language" },
  header: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    openSearch: "Open search",
    searchPlaceholder: "Search 120,000+ future products…",
    account: "Account",
    wishlist: "Wishlist",
    cart: "Cart",
    itemsSuffix: "items",
  },
  nav: {
    allCategories: "All Categories",
    shopByCategory: "Shop by category",
    menu: "Main menu",
  },
  palette: {
    placeholder: "Search orders, pages, or actions…",
    trending: "Trending",
    services: "Services",
    categories: "Categories",
    quickActions: "Quick actions",
    navigate: "navigate",
    select: "select",
    close: "close",
    listening: "Listening…",
    searchFor: "Search for",
    seeAll: "See all matching products",
    dialogLabel: "Search Buyology",
    heard: "Heard",
  },
  departments: {
    label: "Departments",
    viewAll: "View all categories",
    shopNow: "Shop now",
  },
  deals: {
    title: "Flash deals",
    endsIn: "Ends in",
    viewAll: "View all",
    addToCart: "Add to cart",
    bestseller: "Bestseller",
    prev: "Previous products",
    next: "Next products",
    pause: "Pause auto-scroll",
    play: "Resume auto-scroll",
  },
  cart: {
    title: "Your cart",
    empty: "Your cart is empty",
    emptyHint: "Add products to get started.",
    subtotal: "Subtotal",
    goToCart: "Go to cart",
    checkout: "Checkout",
    added: "Added",
    remove: "Remove",
    close: "Close cart",
    continueShopping: "Continue shopping",
    open: "Open cart",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    total: "Total",
    shipping: "Shipping",
    free: "Free",
    orderSummary: "Order summary",
    secure: "Secure, encrypted checkout",
    bnpl: "Or split into 4 interest-free payments",
    bnplNote: "0% interest · no late fees",
    promo: "Promo code",
    promoPlaceholder: "Enter code",
    apply: "Apply",
    addToWishlist: "Save for later",
    saved: "Saved",
    reviews: "reviews",
    inStock: "In stock",
  },
  ai: {
    eyebrow: "Powered by Buyobot",
    heading: "Buyology AI",
    subline:
      "Ten intelligent tools that shop, plan and support — so you always buy smarter.",
    cta: "Chat with Buyobot",
    heroTitle: "Meet Buyobot",
    heroDesc:
      "Your always-on shopping intelligence. Ask a question and get a confident, unbiased answer.",
    recommendedTitle: "Recommended for you",
    recommendedNote: "Buyobot picked these to pair with what's in your cart.",
    pick: "AI pick",
    features: {
      recommender: {
        title: "Cart recommender",
        desc: "Suggests the chargers, cases and add-ons that pair with what's already in your cart.",
      },
      budget: {
        title: "Budget optimizer",
        desc: "Builds the best possible setup within the exact budget you set.",
      },
      consultant: {
        title: "Tech consultant",
        desc: "Ask anything and get an unbiased recommendation in plain language.",
      },
      compatibility: {
        title: "Compatibility checker",
        desc: "Confirms an accessory fits your exact device before you buy.",
      },
      futureproof: {
        title: "Future-Proof Score",
        desc: "Rates how many years a device will stay capable — so it lasts.",
      },
      performance: {
        title: "Performance checker",
        desc: "Tells you whether a model can run the games and apps you care about.",
      },
      setup: {
        title: "Setup builder",
        desc: "Assembles a compatible PC or DIY parts list, part by part.",
      },
      tradein: {
        title: "Trade-in intelligence",
        desc: "Estimates your device's trade-in value and the smartest time to upgrade.",
      },
      review: {
        title: "AI reviews",
        desc: "Summarises thousands of reviews into the pros and cons that matter.",
      },
      helpdesk: {
        title: "AI helpdesk",
        desc: "24/7 answers on orders, returns and how everything works.",
      },
    },
  },
  services: {
    eyebrow: "More than a store",
    heading: "Services & experiences",
    subline:
      "Repair, rent, trade in, recharge and build — Buyology is a whole tech ecosystem.",
    cta: {
      "svc-repair": "Book a repair",
      "svc-rent": "Browse rentals",
      "svc-tradein": "Get a quote",
      "svc-powerbank": "Find a station",
      "svc-diy": "Start a build",
    },
  },
  features: {
    delivery: {
      label: "Complimentary orbital delivery",
      sub: "On orders over 100 AED",
    },
    secure: { label: "Secure payment", sub: "Encrypted checkout" },
    returns: { label: "14-day returns", sub: "Hassle-free refunds" },
    support: { label: "24/7 neural support", sub: "AI help, anytime" },
  },
  items: {
    "nav-all": { label: "All Categories", hint: "Browse the full catalogue" },
    "svc-repair": { label: "Repair", hint: "Book a device repair" },
    "svc-rent": { label: "Rent", hint: "Rent tech by the day" },
    "svc-powerbank": {
      label: "Powerbank Stations",
      hint: "Find a charging station",
    },
    "svc-diy": { label: "DIY", hint: "Kits & build-it-yourself" },
    "svc-buyobot": { label: "Buyobot", hint: "Your AI shopping assistant" },
    "svc-tradein": {
      label: "Trade-in",
      hint: "Trade your old device toward a new one.",
    },
    "cat-electronics": { label: "Electronics", hint: "Gadgets & devices" },
    "cat-audio": { label: "Audio", hint: "Headphones, speakers & more" },
    "cat-gaming": { label: "Gaming", hint: "Consoles & accessories" },
    "cat-computing": { label: "Computing", hint: "Laptops, desktops & parts" },
    "cat-wearables": { label: "Wearables", hint: "Watches & smart rings" },
    "cat-home": { label: "Home", hint: "Smart home & living" },
    "cat-deals": { label: "Deals", hint: "Limited-time offers" },
    "cat-newin": { label: "New In", hint: "Just landed" },
    "trend-earbuds": {
      label: "Wireless earbuds",
      hint: "Audio · most searched",
    },
    "trend-oled": { label: "4K OLED monitor", hint: "Computing · trending" },
    "trend-console": { label: "Handheld console", hint: "Gaming · trending" },
    "trend-ring": { label: "Smart ring", hint: "Wearables · new wave" },
    "quick-track": { label: "Track an order", hint: "Where's my delivery" },
    "quick-cart": { label: "View cart", hint: "Items ready to checkout" },
    "quick-wishlist": { label: "Wishlist", hint: "Saved for later" },
    "quick-account": { label: "Account", hint: "Profile & settings" },
    "quick-help": { label: "Help centre", hint: "Support & FAQs" },
  },
  slides: {
    sale: {
      eyebrow: "Mega Tech Sale",
      headline: "Up to 40% off future tech",
      subline:
        "Thousands of next-gen gadgets, dropped to their lowest prices of the year.",
      cta: "Shop the sale",
      link: "See all offers",
    },
    wearables: {
      eyebrow: "Just landed",
      headline: "The new wearables",
      subline:
        "Smart rings, health bands and titanium watches built for tomorrow.",
      cta: "Explore wearables",
      link: "View New In",
    },
    ai: {
      eyebrow: "Powered by Buyobot",
      headline: "AI-picked drops",
      subline:
        "Personalised product edits, curated for you by our neural assistant.",
      cta: "See your picks",
      link: "How it works",
    },
  },
  promos: {
    "gaming-gear": { eyebrow: "Save up to 40%", title: "Gaming Gear" },
    "new-wearables": { eyebrow: "Just landed", title: "New Wearables" },
  },
};

const az: Dict = {
  gate: {
    title: "Buyology-a xoş gəlmisiniz",
    subtitle: "Davam etmək üçün parolu daxil edin.",
    placeholder: "Parol",
    label: "Sayt parolu",
    submit: "Kiliddən çıxar",
    error: "Parol yanlışdır. Yenidən cəhd edin.",
    show: "Parolu göstər",
    hide: "Parolu gizlət",
  },
  announcement: {
    delivery: "100 AED-dən yuxarı pulsuz çatdırılma",
    returns: "14 günlük qaytarma",
    promo: "WELCOME10 kodu ilə 10% endirim üçün qeydiyyatdan keçin",
    trackOrder: "Sifarişi izlə",
    help: "Kömək",
  },
  language: { label: "Dil" },
  header: {
    openMenu: "Menyunu aç",
    closeMenu: "Menyunu bağla",
    openSearch: "Axtarışı aç",
    searchPlaceholder: "120 000+ gələcək məhsulu axtar…",
    account: "Hesab",
    wishlist: "İstək siyahısı",
    cart: "Səbət",
    itemsSuffix: "məhsul",
  },
  nav: {
    allCategories: "Bütün Kateqoriyalar",
    shopByCategory: "Kateqoriya üzrə al",
    menu: "Əsas menyu",
  },
  palette: {
    placeholder: "Sifariş, səhifə və ya əməliyyat axtar…",
    trending: "Trenddə",
    services: "Xidmətlər",
    categories: "Kateqoriyalar",
    quickActions: "Sürətli əməliyyatlar",
    navigate: "naviqasiya",
    select: "seç",
    close: "bağla",
    listening: "Dinlənilir…",
    searchFor: "Axtar:",
    seeAll: "Bütün uyğun məhsullara bax",
    dialogLabel: "Buyology-də axtar",
    heard: "Eşidildi",
  },
  departments: {
    label: "Şöbələr",
    viewAll: "Bütün kateqoriyalara bax",
    shopNow: "İndi al",
  },
  deals: {
    title: "Fləş endirimlər",
    endsIn: "Bitməyə qalıb",
    viewAll: "Hamısına bax",
    addToCart: "Səbətə əlavə et",
    bestseller: "Ən çox satılan",
    prev: "Əvvəlki məhsullar",
    next: "Növbəti məhsullar",
    pause: "Avtomatik sürüşməni dayandır",
    play: "Avtomatik sürüşməni davam etdir",
  },
  cart: {
    title: "Səbətiniz",
    empty: "Səbətiniz boşdur",
    emptyHint: "Başlamaq üçün məhsul əlavə edin.",
    subtotal: "Ara cəm",
    goToCart: "Səbətə keç",
    checkout: "Ödəniş",
    added: "Əlavə edildi",
    remove: "Sil",
    close: "Səbəti bağla",
    continueShopping: "Alış-verişə davam et",
    open: "Səbəti aç",
    decrease: "Sayı azalt",
    increase: "Sayı artır",
    total: "Cəmi",
    shipping: "Çatdırılma",
    free: "Pulsuz",
    orderSummary: "Sifariş xülasəsi",
    secure: "Təhlükəsiz, şifrələnmiş ödəniş",
    bnpl: "Və ya 4 faizsiz ödənişə bölün",
    bnplNote: "0% faiz · gecikmə haqqı yoxdur",
    promo: "Promo kod",
    promoPlaceholder: "Kodu daxil edin",
    apply: "Tətbiq et",
    addToWishlist: "Sonraya saxla",
    saved: "Saxlanıldı",
    reviews: "rəy",
    inStock: "Stokda var",
  },
  ai: {
    eyebrow: "Buyobot ilə",
    heading: "Buyology AI",
    subline:
      "Alış-veriş edən, planlayan və dəstək verən on ağıllı alət — həmişə daha ağıllı alın.",
    cta: "Buyobot ilə söhbət et",
    heroTitle: "Buyobot ilə tanış ol",
    heroDesc:
      "Daim aktiv alış-veriş intellektin. Sual ver və dəqiq, qərəzsiz cavab al.",
    recommendedTitle: "Sizin üçün tövsiyə",
    recommendedNote: "Buyobot bunları səbətindəkilərə uyğun seçdi.",
    pick: "Sİ seçimi",
    features: {
      recommender: {
        title: "Səbət tövsiyəçisi",
        desc: "Səbətindəkilərə uyğun şarj cihazları, örtüklər və aksesuarlar təklif edir.",
      },
      budget: {
        title: "Büdcə optimizatoru",
        desc: "Təyin etdiyin büdcə daxilində mümkün ən yaxşı dəsti qurur.",
      },
      consultant: {
        title: "Texnologiya məsləhətçisi",
        desc: "İstənilən sualı ver, sadə dildə qərəzsiz tövsiyə al.",
      },
      compatibility: {
        title: "Uyğunluq yoxlayıcısı",
        desc: "Almazdan əvvəl aksesuarın cihazına uyğun olduğunu təsdiqləyir.",
      },
      futureproof: {
        title: "Gələcəyə Davamlılıq Balı",
        desc: "Cihazın neçə il güclü qalacağını qiymətləndirir — uzun ömürlü olsun.",
      },
      performance: {
        title: "Performans yoxlayıcısı",
        desc: "Modelin istədiyin oyun və tətbiqləri işlədə biləcəyini bildirir.",
      },
      setup: {
        title: "Quraşdırma qurucusu",
        desc: "Uyğun kompüter və ya DIY hissə siyahısını addım-addım yığır.",
      },
      tradein: {
        title: "Dəyişdirmə intellekti",
        desc: "Cihazının dəyişdirmə dəyərini və yeniləmə üçün ən uyğun vaxtı hesablayır.",
      },
      review: {
        title: "Sİ rəyləri",
        desc: "Minlərlə rəyi vacib üstünlük və çatışmazlıqlara yığcamlaşdırır.",
      },
      helpdesk: {
        title: "Sİ dəstək masası",
        desc: "Sifariş, qaytarma və işləmə barədə 24/7 cavablar.",
      },
    },
  },
  services: {
    eyebrow: "Sadəcə mağaza deyil",
    heading: "Xidmətlər və təcrübələr",
    subline:
      "Təmir et, icarəyə götür, dəyiş, şarj et və qur — Buyology bütöv texnoloji ekosistemdir.",
    cta: {
      "svc-repair": "Təmir sifariş et",
      "svc-rent": "İcarələrə bax",
      "svc-tradein": "Qiymət al",
      "svc-powerbank": "Stansiya tap",
      "svc-diy": "Qurmağa başla",
    },
  },
  features: {
    delivery: {
      label: "Pulsuz orbital çatdırılma",
      sub: "100 AED-dən yuxarı sifarişlərdə",
    },
    secure: { label: "Təhlükəsiz ödəniş", sub: "Şifrələnmiş ödəniş" },
    returns: { label: "14 günlük qaytarma", sub: "Problemsiz geri ödəniş" },
    support: { label: "24/7 neyron dəstək", sub: "İstənilən vaxt Sİ köməyi" },
  },
  items: {
    "nav-all": {
      label: "Bütün Kateqoriyalar",
      hint: "Bütün kataloqu nəzərdən keçir",
    },
    "svc-repair": { label: "Təmir", hint: "Cihaz təmiri sifariş et" },
    "svc-rent": { label: "İcarə", hint: "Texnikanı günlük icarəyə götür" },
    "svc-powerbank": {
      label: "Powerbank Stansiyaları",
      hint: "Şarj stansiyası tap",
    },
    "svc-diy": { label: "Özün Düzəlt", hint: "Dəstlər və özün-düzəlt" },
    "svc-buyobot": {
      label: "Buyobot",
      hint: "Süni intellekt alış-veriş köməkçin",
    },
    "svc-tradein": {
      label: "Dəyişdirmə",
      hint: "Köhnə cihazını yenisi ilə dəyiş.",
    },
    "cat-electronics": { label: "Elektronika", hint: "Qadcetlər və cihazlar" },
    "cat-audio": { label: "Audio", hint: "Qulaqlıqlar, dinamiklər və s." },
    "cat-gaming": { label: "Oyun", hint: "Konsollar və aksesuarlar" },
    "cat-computing": {
      label: "Kompüter",
      hint: "Noutbuklar, kompüterlər və hissələr",
    },
    "cat-wearables": {
      label: "Geyilə bilənlər",
      hint: "Saatlar və ağıllı üzüklər",
    },
    "cat-home": { label: "Ev", hint: "Ağıllı ev və məişət" },
    "cat-deals": { label: "Endirimlər", hint: "Məhdud müddətli təkliflər" },
    "cat-newin": { label: "Yeni Gələnlər", hint: "Təzə gəldi" },
    "trend-earbuds": {
      label: "Simsiz qulaqlıqlar",
      hint: "Audio · ən çox axtarılan",
    },
    "trend-oled": { label: "4K OLED monitor", hint: "Kompüter · trenddə" },
    "trend-console": { label: "Əl konsolu", hint: "Oyun · trenddə" },
    "trend-ring": { label: "Ağıllı üzük", hint: "Geyilə bilənlər · yeni dalğa" },
    "quick-track": { label: "Sifarişi izlə", hint: "Çatdırılmam haradadır" },
    "quick-cart": { label: "Səbətə bax", hint: "Ödənişə hazır məhsullar" },
    "quick-wishlist": { label: "İstək siyahısı", hint: "Sonraya saxlanıb" },
    "quick-account": { label: "Hesab", hint: "Profil və parametrlər" },
    "quick-help": {
      label: "Kömək mərkəzi",
      hint: "Dəstək və tez-tez verilən suallar",
    },
  },
  slides: {
    sale: {
      eyebrow: "Nəhəng Texnika Endirimi",
      headline: "Gələcək texnikaya 40%-dək endirim",
      subline:
        "Minlərlə yeni nəsil qadcet ilin ən aşağı qiymətlərinə endirildi.",
      cta: "Endirimlə al",
      link: "Bütün təkliflərə bax",
    },
    wearables: {
      eyebrow: "Təzə gəldi",
      headline: "Yeni geyilə bilənlər",
      subline:
        "Sabah üçün hazırlanmış ağıllı üzüklər, sağlamlıq qolbaqları və titan saatlar.",
      cta: "Geyilə bilənləri kəşf et",
      link: "Yeni Gələnlərə bax",
    },
    ai: {
      eyebrow: "Buyobot ilə",
      headline: "Sİ-nin seçdiyi məhsullar",
      subline:
        "Neyron köməkçimizin sizin üçün hazırladığı fərdi məhsul seçimləri.",
      cta: "Seçimlərinə bax",
      link: "Necə işləyir",
    },
  },
  promos: {
    "gaming-gear": { eyebrow: "40%-dək qənaət", title: "Oyun Avadanlığı" },
    "new-wearables": { eyebrow: "Təzə gəldi", title: "Yeni Geyilə bilənlər" },
  },
};

const ar: Dict = {
  gate: {
    title: "مرحبًا بك في Buyology",
    subtitle: "أدخل كلمة المرور للمتابعة.",
    placeholder: "كلمة المرور",
    label: "كلمة مرور الموقع",
    submit: "فتح",
    error: "كلمة المرور غير صحيحة. حاول مرّة أخرى.",
    show: "إظهار كلمة المرور",
    hide: "إخفاء كلمة المرور",
  },
  announcement: {
    delivery: "توصيل مجاني للطلبات فوق 100 درهم",
    returns: "إرجاع خلال 14 يومًا",
    promo: "سجّل واحصل على خصم 10% برمز WELCOME10",
    trackOrder: "تتبّع الطلب",
    help: "المساعدة",
  },
  language: { label: "اللغة" },
  header: {
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    openSearch: "فتح البحث",
    searchPlaceholder: "ابحث في أكثر من 120,000 منتج مستقبلي…",
    account: "الحساب",
    wishlist: "قائمة الرغبات",
    cart: "السلة",
    itemsSuffix: "عناصر",
  },
  nav: {
    allCategories: "كل الفئات",
    shopByCategory: "تسوّق حسب الفئة",
    menu: "القائمة الرئيسية",
  },
  palette: {
    placeholder: "ابحث عن الطلبات أو الصفحات أو الإجراءات…",
    trending: "الأكثر رواجًا",
    services: "الخدمات",
    categories: "الفئات",
    quickActions: "إجراءات سريعة",
    navigate: "التنقّل",
    select: "اختيار",
    close: "إغلاق",
    listening: "جارٍ الاستماع…",
    searchFor: "ابحث عن",
    seeAll: "عرض كل المنتجات المطابقة",
    dialogLabel: "ابحث في Buyology",
    heard: "تم السماع",
  },
  departments: {
    label: "الأقسام",
    viewAll: "عرض كل الفئات",
    shopNow: "تسوّق الآن",
  },
  deals: {
    title: "عروض خاطفة",
    endsIn: "ينتهي خلال",
    viewAll: "عرض الكل",
    addToCart: "أضف إلى السلة",
    bestseller: "الأكثر مبيعًا",
    prev: "المنتجات السابقة",
    next: "المنتجات التالية",
    pause: "إيقاف التمرير التلقائي",
    play: "استئناف التمرير التلقائي",
  },
  cart: {
    title: "سلتك",
    empty: "سلتك فارغة",
    emptyHint: "أضف منتجات للبدء.",
    subtotal: "المجموع الفرعي",
    goToCart: "اذهب إلى السلة",
    checkout: "الدفع",
    added: "أُضيف",
    remove: "إزالة",
    close: "إغلاق السلة",
    continueShopping: "مواصلة التسوّق",
    open: "فتح السلة",
    decrease: "إنقاص الكمية",
    increase: "زيادة الكمية",
    total: "الإجمالي",
    shipping: "الشحن",
    free: "مجاني",
    orderSummary: "ملخّص الطلب",
    secure: "دفع آمن ومشفّر",
    bnpl: "أو قسّمها على 4 دفعات دون فوائد",
    bnplNote: "0% فائدة · بلا رسوم تأخير",
    promo: "رمز ترويجي",
    promoPlaceholder: "أدخل الرمز",
    apply: "تطبيق",
    addToWishlist: "احفظ لوقت لاحق",
    saved: "محفوظ",
    reviews: "تقييم",
    inStock: "متوفّر",
  },
  ai: {
    eyebrow: "مدعوم من Buyobot",
    heading: "Buyology AI",
    subline: "عشر أدوات ذكية تتسوّق وتخطّط وتدعم — لتشتري بذكاء دائمًا.",
    cta: "تحدّث مع Buyobot",
    heroTitle: "تعرّف على Buyobot",
    heroDesc:
      "ذكاء التسوّق الدائم لديك. اطرح سؤالًا واحصل على إجابة واثقة ومحايدة.",
    recommendedTitle: "موصى به لك",
    recommendedNote: "اختار Buyobot هذه لتناسب ما في سلتك.",
    pick: "اختيار الذكاء الاصطناعي",
    features: {
      recommender: {
        title: "موصّي السلة",
        desc: "يقترح الشواحن والأغطية والإضافات المناسبة لما في سلتك.",
      },
      budget: {
        title: "مُحسّن الميزانية",
        desc: "يبني أفضل تجهيزة ممكنة ضمن الميزانية التي تحدّدها.",
      },
      consultant: {
        title: "مستشار التقنية",
        desc: "اسأل أي شيء واحصل على توصية محايدة بلغة بسيطة.",
      },
      compatibility: {
        title: "فاحص التوافق",
        desc: "يؤكّد أن الملحق يناسب جهازك تحديدًا قبل الشراء.",
      },
      futureproof: {
        title: "درجة مقاومة التقادم",
        desc: "يقدّر كم سنة سيبقى الجهاز قادرًا — ليدوم طويلًا.",
      },
      performance: {
        title: "فاحص الأداء",
        desc: "يخبرك إن كان الطراز يشغّل الألعاب والتطبيقات التي تهمّك.",
      },
      setup: {
        title: "باني التجهيزة",
        desc: "يجمع قائمة قطع حاسوب أو مشروع DIY متوافقة، قطعة بقطعة.",
      },
      tradein: {
        title: "ذكاء الاستبدال",
        desc: "يقدّر قيمة استبدال جهازك وأنسب وقت للترقية.",
      },
      review: {
        title: "مراجعات الذكاء الاصطناعي",
        desc: "يلخّص آلاف المراجعات إلى المزايا والعيوب المهمة.",
      },
      helpdesk: {
        title: "مكتب مساعدة ذكي",
        desc: "إجابات على مدار الساعة حول الطلبات والإرجاع وكيفية العمل.",
      },
    },
  },
  services: {
    eyebrow: "أكثر من متجر",
    heading: "الخدمات والتجارب",
    subline:
      "أصلح، استأجر، استبدل، اشحن، وابنِ — Buyology منظومة تقنية متكاملة.",
    cta: {
      "svc-repair": "احجز إصلاحًا",
      "svc-rent": "تصفّح التأجير",
      "svc-tradein": "احصل على عرض",
      "svc-powerbank": "اعثر على محطة",
      "svc-diy": "ابدأ التجميع",
    },
  },
  features: {
    delivery: {
      label: "توصيل مداري مجاني",
      sub: "للطلبات فوق 100 درهم",
    },
    secure: { label: "دفع آمن", sub: "دفع مشفّر" },
    returns: { label: "إرجاع خلال 14 يومًا", sub: "استرداد بلا متاعب" },
    support: { label: "دعم عصبي على مدار الساعة", sub: "مساعدة ذكية في أي وقت" },
  },
  items: {
    "nav-all": { label: "كل الفئات", hint: "تصفّح الكتالوج بالكامل" },
    "svc-repair": { label: "إصلاح", hint: "احجز إصلاح جهاز" },
    "svc-rent": { label: "تأجير", hint: "استأجر الأجهزة يوميًا" },
    "svc-powerbank": { label: "محطات الشحن", hint: "اعثر على محطة شحن" },
    "svc-diy": { label: "اصنعها بنفسك", hint: "أطقم وتجميع ذاتي" },
    "svc-buyobot": {
      label: "Buyobot",
      hint: "مساعد التسوّق بالذكاء الاصطناعي",
    },
    "svc-tradein": {
      label: "الاستبدال",
      hint: "استبدل جهازك القديم بآخر جديد.",
    },
    "cat-electronics": { label: "إلكترونيات", hint: "أجهزة وإلكترونيات" },
    "cat-audio": { label: "الصوتيات", hint: "سماعات ومكبّرات والمزيد" },
    "cat-gaming": { label: "الألعاب", hint: "أجهزة وملحقات" },
    "cat-computing": { label: "الحوسبة", hint: "حواسيب محمولة ومكتبية وقطع" },
    "cat-wearables": {
      label: "الأجهزة القابلة للارتداء",
      hint: "ساعات وخواتم ذكية",
    },
    "cat-home": { label: "المنزل", hint: "المنزل الذكي والمعيشة" },
    "cat-deals": { label: "العروض", hint: "عروض لفترة محدودة" },
    "cat-newin": { label: "وصل حديثًا", hint: "وصل للتو" },
    "trend-earbuds": { label: "سماعات لاسلكية", hint: "الصوتيات · الأكثر بحثًا" },
    "trend-oled": { label: "شاشة 4K OLED", hint: "الحوسبة · رائج" },
    "trend-console": { label: "منصة ألعاب محمولة", hint: "الألعاب · رائج" },
    "trend-ring": {
      label: "خاتم ذكي",
      hint: "الأجهزة القابلة للارتداء · موجة جديدة",
    },
    "quick-track": { label: "تتبّع طلبًا", hint: "أين طلبي" },
    "quick-cart": { label: "عرض السلة", hint: "منتجات جاهزة للدفع" },
    "quick-wishlist": { label: "قائمة الرغبات", hint: "محفوظ لاحقًا" },
    "quick-account": { label: "الحساب", hint: "الملف والإعدادات" },
    "quick-help": { label: "مركز المساعدة", hint: "الدعم والأسئلة الشائعة" },
  },
  slides: {
    sale: {
      eyebrow: "تخفيضات التقنية الكبرى",
      headline: "خصم حتى 40% على تقنية المستقبل",
      subline: "آلاف الأجهزة من الجيل التالي بأدنى أسعارها هذا العام.",
      cta: "تسوّق العرض",
      link: "شاهد كل العروض",
    },
    wearables: {
      eyebrow: "وصل للتو",
      headline: "الأجهزة القابلة للارتداء الجديدة",
      subline: "خواتم ذكية وأساور صحية وساعات تيتانيوم صُنعت للغد.",
      cta: "استكشف الأجهزة",
      link: "عرض الوصل حديثًا",
    },
    ai: {
      eyebrow: "مدعوم من Buyobot",
      headline: "مختارات الذكاء الاصطناعي",
      subline: "تشكيلات منتجات مخصّصة ينسّقها لك مساعدنا العصبي.",
      cta: "شاهد اختياراتك",
      link: "كيف يعمل",
    },
  },
  promos: {
    "gaming-gear": { eyebrow: "وفّر حتى 40%", title: "معدّات الألعاب" },
    "new-wearables": { eyebrow: "وصل للتو", title: "أجهزة جديدة" },
  },
};

export const dictionaries: Record<Locale, Dict> = { en, az, ar };
