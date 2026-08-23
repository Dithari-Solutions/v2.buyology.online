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
  stories: {
    /** aria-label of the bubble row. */
    ariaRow: string;
    close: string;
    previous: string;
    next: string;
    mute: string;
    unmute: string;
    /** aria-label of the like button (count is appended visually). */
    likes: string;
    /** Shown when a guest taps like — the backend requires a signed-in account. */
    signInToLike: string;
  };
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
    whoWeAre: string;
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
    savedForLater: string;
    moveToCart: string;
    selectAll: string;
    selectedSuffix: string;
    noneSelected: string;
    selectItem: string;
    shippingAtCheckout: string;
    syncErrorNote: string;
    reviews: string;
    inStock: string;
  };
  checkout: {
    title: string;
    fulfilment: string;
    delivery: string;
    pickup: string;
    manageAddresses: string;
    noAddresses: string;
    noStores: string;
    method: string;
    standard: string;
    express: string;
    expressNeedsPin: string;
    expressUnavailable: string;
    payment: string;
    card: string;
    discount: string;
    promoInvalid: string;
    totalNote: string;
    placeOrder: string;
    placing: string;
    placeFailed: string;
    phoneTitle: string;
    phoneHint: string;
    phoneRequired: string;
    sendCode: string;
    resendCode: string;
    verify: string;
    callback: {
      checking: string;
      successTitle: string;
      successHint: string;
      viewOrder: string;
      failedTitle: string;
      failedHint: string;
      tryAgain: string;
      pendingTitle: string;
      pendingHint: string;
      toOrders: string;
    };
    payNow: string;
    productUnavailable: string;
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
  metrics: {
    eyebrow: string;
    heading: string;
    subline: string;
    scoreLabel: string;
    outOf: string;
    reviewsSuffix: string;
    items: Record<string, string>;
  };
  pdp: {
    home: string;
    breadcrumb: string;
    buyNow: string;
    qty: string;
    color: string;
    configuration: string;
    inStock: string;
    freeDelivery: string;
    deliveryNote: string;
    warranty: string;
    returns: string;
    secure: string;
    highlights: string;
    specifications: string;
    related: string;
    spec: {
      brand: string;
      model: string;
      category: string;
      warranty: string;
      box: string;
      rating: string;
    };
    ai: {
      eyebrow: string;
      title: string;
      verdict: string;
      positive: string;
      pros: string;
      cons: string;
      themes: string;
      mentions: string;
      disclaimer: string;
    };
    reviews: {
      title: string;
      write: string;
      verified: string;
      helpful: string;
      basedOn: string;
    };
    qa: {
      title: string;
      ask: string;
      answer: string;
      by: string;
      votes: string;
    };
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
  footer: {
    newsletter: {
      title: string;
      subtitle: string;
      placeholder: string;
      subscribe: string;
      success: string;
      note: string;
    };
    tagline: string;
    followUs: string;
    contact: string;
    cols: Record<string, string>;
    links: Record<string, string>;
    payments: string;
    rights: string;
    madeIn: string;
    privacy: string;
    terms: string;
    cookies: string;
  };
  wishlist: {
    empty: string;
    emptyHint: string;
    addAll: string;
  };
  account: {
    /** Shown on tabs whose feature has not migrated from the old site yet. */
    comingSoon: string;
    title: string;
    memberSince: string;
    points: string;
    tierMember: string;
    signOut: string;
    nav: Record<string, string>;
    common: {
      save: string;
      saved: string;
      cancel: string;
      add: string;
      edit: string;
      remove: string;
      default: string;
      setDefault: string;
    };
    profile: {
      title: string;
      subtitle: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      phoneSearch: string;
      phoneNoResults: string;
      phoneResults: string;
      phoneResultOne: string;
      photo: string;
      photoHint: string;
      photoChoose: string;
      photoChange: string;
      photoRemove: string;
      photoNotImage: string;
      photoTooLarge: string;
      photoPreviewAlt: string;
      photoSelected: string;
      photoRemoved: string;
    };
    orders: {
      title: string;
      subtitle: string;
      order: string;
      items: string;
      view: string;
      reorder: string;
      /** Customer-facing labels for the real backend statuses; legacy values fall back in code. */
      statuses: Record<string, string>;
      empty: string;
      loadMore: string;
      cancelOrder: string;
      cancelConfirm: string;
      cancelKeep: string;
      cancelled: string;
      track: string;
      placedOn: string;
      failed: string;
      detail: {
        heading: string;
        items: string;
        delivery: string;
        pickup: string;
        recipient: string;
        summary: string;
        subtotal: string;
        discount: string;
        shipping: string;
        credit: string;
        total: string;
        timeline: string;
        notFound: string;
        back: string;
        payment: string;
        methodCard: string;
        methodTabby: string;
        methodTamara: string;
        methodCredit: string;
        proofPhoto: string;
        courier: string;
        methodExpress: string;
        methodRegular: string;
        methodInternational: string;
        contact: string;
        shippedOn: string;
        deliveredOn: string;
        eta: string;
      };
    };
    addresses: {
      title: string;
      subtitle: string;
      addNew: string;
      name: string;
      street: string;
      city: string;
      country: string;
      phone: string;
      empty: string;
      line2: string;
      state: string;
      postalCode: string;
      labels: { HOME: string; WORK: string; OTHER: string };
      deleteConfirm: string;
      noEditNote: string;
      useMyLocation: string;
      locating: string;
      locationFailed: string;
      customName: string;
    };
    payments: {
      title: string;
      subtitle: string;
      expires: string;
      addCard: string;
      bnpl: string;
      connected: string;
    };
    preferences: {
      title: string;
      subtitle: string;
      language: string;
      currency: string;
      notifications: string;
      channelEmail: string;
      channelSms: string;
      channelPush: string;
      newsletter: string;
    };
    security: {
      title: string;
      subtitle: string;
      changePassword: string;
      current: string;
      newPass: string;
      confirm: string;
      update: string;
      updated: string;
      mismatch: string;
      tooShort: string;
      twofa: string;
      twofaDesc: string;
      signOutAll: string;
      viaEmailIntro: string;
      sendCode: string;
      codeSentTo: string;
    };
    danger: {
      title: string;
      subtitle: string;
      delete: string;
      warning: string;
      modalTitle: string;
      modalBody: string;
      confirmHint: string;
      confirmWord: string;
      confirm: string;
      deletedTitle: string;
      deletedBody: string;
      backHome: string;
    };
  };
  auth: {
    welcomeTitle: string;
    welcomeSub: string;
    perks: { delivery: string; ai: string; warranty: string };
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    or: string;
    continueWith: string;
    floatChat: string;
    passwordTab: string;
    qrTab: string;
    qr: {
      title: string;
      step1: string;
      step2: string;
      step3: string;
      waiting: string;
      getApp: string;
    };
    login: {
      title: string;
      subtitle: string;
      submit: string;
      remember: string;
      forgot: string;
      noAccount: string;
      cta: string;
    };
    signup: {
      title: string;
      subtitle: string;
      submit: string;
      terms: string;
      hasAccount: string;
      cta: string;
      personalTab: string;
      businessTab: string;
      business: {
        name: string;
        contact: string;
        email: string;
        phone: string;
        industry: string;
        selectIndustry: string;
        employees: string;
        selectEmployees: string;
        licence: string;
        licenceHint: string;
        website: string;
        uploadCta: string;
        industries: Record<string, string>;
      };
    };
    /** Server failures mapped by HTTP status — never by matching English message text. */
    errors: {
      invalidCredentials: string;
      notRegistered: string;
      suspended: string;
      tooManyAttempts: string;
      emailExists: string;
      network: string;
      appleFailed: string;
      generic: string;
    };
    loading: string;
    otp: {
      title: string;
      sentTo: string;
      verify: string;
      resend: string;
      resendIn: string;
      wrong: string;
      expired: string;
      restart: string;
      back: string;
    };
    businessSoon: string;
    forgot: {
      emailTitle: string;
      emailSub: string;
      send: string;
      otpTitle: string;
      otpSub: string;
      verify: string;
      changeEmail: string;
      noCode: string;
      resend: string;
      resendIn: string;
      resetTitle: string;
      resetSub: string;
      submit: string;
      doneTitle: string;
      doneSub: string;
      backToSignin: string;
    };
  };
  shop: {
    title: string;
    subtitle: string;
    results: string;
    sortBy: string;
    sort: {
      featured: string;
      priceAsc: string;
      priceDesc: string;
      rating: string;
      reviews: string;
      discount: string;
    };
    filters: string;
    category: string;
    price: string;
    rating: string;
    onSale: string;
    bestsellers: string;
    ratingUp: string;
    priceMinAria: string;
    priceMaxAria: string;
    loadFailed: string;
    retry: string;
    clearAll: string;
    showResults: string;
    loadMore: string;
    empty: string;
    emptyHint: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    subtitle: string;
    address: string;
    phone: string;
    email: string;
    hours: string;
    regions: Record<string, string>;
    form: {
      title: string;
      subtitle: string;
      name: string;
      email: string;
      subject: string;
      region: string;
      message: string;
      send: string;
      sentTitle: string;
      sentBody: string;
      another: string;
    };
  };
  giveaway: {
    eyebrow: string;
    title: string;
    prize: string;
    subtitle: string;
    stepsLabel: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    cta: string;
    instagram: string;
    note: string;
  };
  notFound: {
    eyebrow: string;
    title: string;
    body: string;
    home: string;
    browse: string;
    categoriesTitle: string;
  };
  chat: {
    launch: string;
    greeting: string;
    title: string;
    status: string;
    intro: string;
    placeholder: string;
    send: string;
    close: string;
    quickTrack: string;
    quickReturns: string;
    quickProduct: string;
    quickHuman: string;
    replyTrack: string;
    replyReturns: string;
    replyProduct: string;
    replyHuman: string;
    fallback: string;
    disclaimer: string;
    typing: string;
    errorGeneric: string;
    rateLimited: string;
    charsLeft: string;
    escalateCta: string;
    viewProduct: string;
    outOfStock: string;
    preOrder: string;
    refurbished: string;
  };
}

const en: Dict = {
  stories: {
    ariaRow: "Stories",
    close: "Close",
    previous: "Previous story",
    next: "Next story",
    mute: "Mute",
    unmute: "Unmute",
    likes: "Likes",
    signInToLike: "Sign in to like stories",
  },
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
    whoWeAre: "Who We Are",
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
    savedForLater: "Saved for later",
    moveToCart: "Move to cart",
    selectAll: "Select all",
    selectedSuffix: "selected",
    noneSelected: "Select at least one item to check out",
    selectItem: "Select",
    shippingAtCheckout: "Calculated at checkout",
    syncErrorNote: "Something went wrong syncing your cart — it has been reloaded.",
    saved: "Saved",
    reviews: "reviews",
    inStock: "In stock",
  },
  checkout: {
    title: "Checkout",
    fulfilment: "How would you like to get it?",
    delivery: "Delivery",
    pickup: "Store pickup",
    manageAddresses: "Manage addresses",
    noAddresses: "No saved addresses yet — add one in your account to continue.",
    noStores: "No stores are available for pickup right now.",
    method: "Delivery speed",
    standard: "Standard delivery",
    express: "Express (30 min)",
    expressNeedsPin: "Add a map pin to this address to unlock express",
    expressUnavailable: "Not available for these items at this address",
    payment: "Payment method",
    card: "Card",
    discount: "Discount",
    promoInvalid: "This promo code can't be applied.",
    totalNote: "The final amount is confirmed on the payment page.",
    placeOrder: "Place order & pay",
    placing: "Preparing your payment…",
    placeFailed: "We couldn't place the order. Nothing was charged — please try again.",
    phoneTitle: "Verify your phone",
    phoneHint: "A quick SMS code — couriers need a reachable number.",
    phoneRequired: "Verify your phone number to place the order.",
    sendCode: "Send code",
    resendCode: "Resend code",
    verify: "Verify",
    callback: {
      checking: "Confirming your payment…",
      successTitle: "Payment confirmed",
      successHint: "Your order is paid and being prepared. A confirmation email is on its way.",
      viewOrder: "View order",
      failedTitle: "Payment didn't go through",
      failedHint: "You weren't charged. Your items are still reserved — you can try again.",
      tryAgain: "Try again",
      pendingTitle: "Payment still processing",
      pendingHint: "This can take a moment. Check your orders in a minute — we'll record the result either way.",
      toOrders: "Go to my orders",
    },
    payNow: "Pay now",
    productUnavailable: "This product isn't available right now.",
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
  metrics: {
    eyebrow: "By the numbers",
    heading: "Trusted by millions of shoppers",
    subline: "Real results from a marketplace built for confident buying.",
    scoreLabel: "Average review score",
    outOf: "out of 5",
    reviewsSuffix: "verified reviews",
    items: {
      customers: "Happy customers",
      orders: "Orders delivered",
      chats: "Buyobot conversations",
      ontime: "On-time delivery",
    },
  },
  pdp: {
    home: "Home",
    breadcrumb: "Breadcrumb",
    buyNow: "Buy now",
    qty: "Quantity",
    color: "Color",
    configuration: "Configuration",
    inStock: "In stock",
    freeDelivery: "Free next-day delivery",
    deliveryNote: "Order within 4 hours for delivery tomorrow",
    warranty: "2-year warranty",
    returns: "14-day free returns",
    secure: "Secure, encrypted checkout",
    highlights: "Highlights",
    specifications: "Specifications",
    related: "You may also like",
    spec: {
      brand: "Brand",
      model: "Model",
      category: "Category",
      warranty: "Warranty",
      box: "In the box",
      rating: "Rating",
    },
    ai: {
      eyebrow: "Buyobot review summary",
      title: "AI review summary",
      verdict: "The verdict",
      positive: "positive",
      pros: "What buyers love",
      cons: "Worth noting",
      themes: "Most mentioned",
      mentions: "mentions",
      disclaimer:
        "AI-generated from verified reviews. May contain inaccuracies — always check the reviews below.",
    },
    reviews: {
      title: "Customer reviews",
      write: "Write a review",
      verified: "Verified purchase",
      helpful: "Helpful",
      basedOn: "Based on",
    },
    qa: {
      title: "Questions & answers",
      ask: "Ask a question",
      answer: "Answer",
      by: "by",
      votes: "found this helpful",
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
  footer: {
    newsletter: {
      title: "Join the future of shopping",
      subtitle:
        "Early access to drops, AI-picked deals and 10% off your first order.",
      placeholder: "Enter your email",
      subscribe: "Subscribe",
      success: "You're in! Check your inbox to confirm.",
      note: "By subscribing you agree to our Privacy Policy. Unsubscribe anytime.",
    },
    tagline:
      "A premium, AI-native marketplace for the future you — electronics, audio, gaming and more, delivered fast.",
    followUs: "Follow us",
    contact: "Get in touch",
    cols: { shop: "Shop", buyology: "Buyology", support: "Support", company: "Company" },
    links: {
      electronics: "Electronics",
      buyobot: "Buyobot AI",
      repair: "Repair",
      rent: "Rent",
      tradein: "Trade-in",
      powerbank: "Powerbank Stations",
      diy: "DIY",
      help: "Help Center",
      track: "Track Order",
      shipping: "Shipping",
      returns: "Returns",
      warranty: "Warranty",
      contact: "Contact Us",
      about: "About Us",
      careers: "Careers",
      sustainability: "Sustainability",
      press: "Press",
      affiliates: "Affiliates",
    },
    payments: "We accept",
    rights: "All rights reserved.",
    madeIn: "Designed in the UAE · Prices in AED",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookies: "Cookies",
  },
  wishlist: {
    empty: "Your wishlist is empty",
    emptyHint: "Tap the heart on any product to save it here.",
    addAll: "Add all to cart",
  },
  account: {
    comingSoon: "This section is moving to the new site soon. Until then, manage it on buyology.online.",
    title: "My account",
    memberSince: "Member since",
    points: "points",
    tierMember: "member",
    signOut: "Sign out",
    nav: {
      profile: "Profile",
      orders: "Orders",
      addresses: "Addresses",
      payments: "Payment methods",
      preferences: "Preferences",
      security: "Security",
      danger: "Delete account",
    },
    common: {
      save: "Save changes",
      saved: "Saved",
      cancel: "Cancel",
      add: "Add",
      edit: "Edit",
      remove: "Remove",
      default: "Default",
      setDefault: "Set as default",
    },
    profile: {
      title: "Personal information",
      subtitle: "Update your name and contact details.",
      firstName: "First name",
      lastName: "Last name",
      email: "Email address",
      phone: "Phone number",
      phoneSearch: "Search countries",
      phoneNoResults: "No country matches that search.",
      phoneResults: "countries",
      phoneResultOne: "country",
      photo: "Profile photo",
      photoHint: "Optional. PNG, JPG or WebP, up to 5 MB.",
      photoChoose: "Add photo",
      photoChange: "Change photo",
      photoRemove: "Remove photo",
      photoNotImage: "That file isn’t an image. Choose a PNG, JPG or WebP instead.",
      photoTooLarge: "That image is over 5 MB. Choose a smaller one, or resize it and try again.",
      photoPreviewAlt: "Profile photo preview",
      photoSelected: "Photo selected",
      photoRemoved: "Profile photo removed.",
    },
    orders: {
      title: "Order history",
      subtitle: "Track and manage your recent orders.",
      order: "Order",
      items: "items",
      view: "View",
      reorder: "Reorder",
      statuses: {
        PENDING_PAYMENT: "Awaiting payment",
        PAID: "Paid",
        PACKAGING: "Being packed",
        READY_FOR_PICKUP: "Ready for pickup",
        IN_COURIER: "With the courier",
        IN_TRANSIT: "On its way",
        DELIVERED: "Delivered",
        CANCELLED: "Cancelled",
        FAILED: "Delivery failed",
      },
      empty: "No orders yet — your purchases will appear here.",
      loadMore: "Load more",
      cancelOrder: "Cancel order",
      cancelConfirm: "Cancel this order? If you already paid, the amount is refunded once the courier is confirmed stopped.",
      cancelKeep: "Keep order",
      cancelled: "Order cancelled.",
      track: "Track parcel",
      placedOn: "Placed on",
      failed: "Couldn't cancel this order",
      detail: {
        heading: "Order",
        items: "Items",
        delivery: "Delivery",
        pickup: "Store pickup",
        recipient: "Recipient",
        summary: "Summary",
        subtotal: "Subtotal",
        discount: "Discount",
        shipping: "Delivery fee",
        credit: "Paid with credit",
        total: "Total",
        timeline: "History",
        notFound: "We couldn't find this order.",
        payment: "Payment",
        methodCard: "Card",
        methodTabby: "Tabby",
        methodTamara: "Tamara",
        methodCredit: "Business credit",
        proofPhoto: "Photo proof",
        courier: "Courier",
        methodExpress: "Express delivery",
        methodRegular: "Standard delivery",
        methodInternational: "International shipping",
        contact: "Contact",
        shippedOn: "Shipped on",
        deliveredOn: "Delivered on",
        back: "Back to orders",
        eta: "Estimated delivery",
      },
    },
    addresses: {
      title: "Saved addresses",
      subtitle: "Manage where your orders are delivered.",
      addNew: "Add address",
      name: "Full name",
      street: "Street address",
      city: "City",
      country: "Country",
      phone: "Phone",
      empty: "No saved addresses yet.",
      line2: "Apartment, floor (optional)",
      state: "State / Emirate",
      postalCode: "Postal code (optional)",
      labels: { HOME: "Home", WORK: "Work", OTHER: "Other" },
      deleteConfirm: "Delete this address?",
      noEditNote: "To change an address, delete it and add the corrected one.",
      useMyLocation: "Use my location",
      locating: "Finding your location…",
      locationFailed: "We couldn't detect your location — fill the address in manually.",
      customName: "Name this address",
    },
    payments: {
      title: "Payment methods",
      subtitle: "Manage your saved cards and pay-later accounts.",
      expires: "Expires",
      addCard: "Add card",
      bnpl: "Pay-later",
      connected: "Connected",
    },
    preferences: {
      title: "Preferences",
      subtitle: "Language, currency and how we reach you.",
      language: "Language",
      currency: "Currency",
      notifications: "Notifications",
      channelEmail: "Email",
      channelSms: "SMS",
      channelPush: "Push",
      newsletter: "Product news & offers",
    },
    security: {
      title: "Security",
      subtitle: "Keep your account safe.",
      changePassword: "Change password",
      current: "Current password",
      newPass: "New password",
      confirm: "Confirm new password",
      update: "Update password",
      updated: "Password updated",
      mismatch: "Passwords don't match.",
      tooShort: "Use at least 8 characters.",
      twofa: "Two-factor authentication",
      twofaDesc: "Add an extra layer of security at sign-in.",
      signOutAll: "Sign out of all devices",
      viaEmailIntro: "We change your password with a code sent to your email — no current password needed.",
      sendCode: "Email me a code",
      codeSentTo: "Code sent to",
    },
    danger: {
      title: "Delete account",
      subtitle: "Permanently delete your account and all its data.",
      delete: "Delete account",
      warning:
        "This can't be undone. Your orders, wishlist, addresses and rewards will be permanently removed.",
      modalTitle: "Delete your account?",
      modalBody:
        "This will permanently erase your profile, order history, saved addresses and Buyology rewards. This action cannot be reversed.",
      confirmHint: "Type DELETE to confirm",
      confirmWord: "DELETE",
      confirm: "Permanently delete",
      deletedTitle: "Your account has been deleted",
      deletedBody: "We're sorry to see you go. You can create a new account anytime.",
      backHome: "Back to home",
    },
  },
  auth: {
    welcomeTitle: "The marketplace for the future you",
    welcomeSub:
      "Sign in to track orders, save wishlists and let Buyobot shop smarter with you.",
    perks: {
      delivery: "Free next-day delivery",
      ai: "Your personal AI shopping assistant",
      warranty: "2-year warranty on every product",
    },
    email: "Email address",
    password: "Password",
    firstName: "First name",
    lastName: "Last name",
    or: "or",
    continueWith: "Continue with",
    floatChat: "Found 3 laptops under your budget ✨",
    passwordTab: "Password",
    qrTab: "QR code",
    qr: {
      title: "Log in with the Buyology app",
      step1: "Open the Buyology app on your phone",
      step2: "Tap the scan icon in the top bar",
      step3: "Point your camera at this code",
      waiting: "Waiting for you to scan…",
      getApp: "Don't have the app yet?",
    },
    login: {
      title: "Welcome back",
      subtitle: "Sign in to your Buyology account.",
      submit: "Sign in",
      remember: "Remember me",
      forgot: "Forgot password?",
      noAccount: "New to Buyology?",
      cta: "Create an account",
    },
    signup: {
      title: "Create your account",
      subtitle: "Join Buyology and start shopping the future.",
      submit: "Create account",
      terms: "I agree to the Terms of Service and Privacy Policy.",
      hasAccount: "Already have an account?",
      cta: "Sign in",
      personalTab: "Personal",
      businessTab: "Business",
      business: {
        name: "Business name",
        contact: "Contact person",
        email: "Business email",
        phone: "Phone number (optional)",
        industry: "Industry",
        selectIndustry: "Select an industry",
        employees: "Number of employees",
        selectEmployees: "Select a range",
        licence: "Trade licence",
        licenceHint: "PDF or image \u00b7 up to 10 MB",
        website: "Website (optional)",
        uploadCta: "Click to upload or drag & drop",
        industries: {
          retail: "Retail",
          electronics: "Electronics",
          services: "Services",
          wholesale: "Wholesale",
          manufacturing: "Manufacturing",
          other: "Other",
        },
      },
    },
    errors: {
      invalidCredentials: "Incorrect email or password.",
      notRegistered: "No account found with this email — create one below.",
      suspended: "Your account has been suspended. Please contact support.",
      tooManyAttempts: "Too many attempts. Please try again in a few minutes.",
      emailExists: "An account with this email already exists — sign in instead.",
      network: "Can't reach the server. Check your connection and try again.",
      appleFailed: "Apple sign-in didn't complete. Please try again.",
      generic: "Something went wrong. Please try again.",
    },
    loading: "Please wait…",
    otp: {
      title: "Check your inbox",
      sentTo: "We sent a 6-digit code to",
      verify: "Verify & create account",
      resend: "Resend code",
      resendIn: "Resend in",
      wrong: "That code isn't right — try again.",
      expired: "That code has expired. Send a fresh one below.",
      restart: "That session expired — please sign up again.",
      back: "Change email",
    },
    businessSoon: "Business accounts are moving to the new site soon. Until then, please apply on buyology.online.",
    forgot: {
      emailTitle: "Forgot your password?",
      emailSub: "Enter your email and we'll send you a 6-digit code.",
      send: "Send code",
      otpTitle: "Enter the code",
      otpSub: "We sent a 6-digit code to",
      verify: "Verify",
      changeEmail: "Change email",
      noCode: "Didn't get the code?",
      resend: "Resend",
      resendIn: "Resend in",
      resetTitle: "Create a new password",
      resetSub: "Choose a strong password you haven't used before.",
      submit: "Reset password",
      doneTitle: "Password reset",
      doneSub: "Your password has been changed. You can now sign in.",
      backToSignin: "Back to sign in",
    },
  },
  shop: {
    title: "All products",
    subtitle: "Explore the full Buyology catalogue.",
    results: "products",
    sortBy: "Sort by",
    sort: {
      featured: "Featured",
      priceAsc: "Price: low to high",
      priceDesc: "Price: high to low",
      rating: "Top rated",
      reviews: "Most reviewed",
      discount: "Biggest discount",
    },
    filters: "Filters",
    category: "Category",
    price: "Price",
    rating: "Rating",
    onSale: "On sale (25%+ off)",
    bestsellers: "Bestsellers only",
    ratingUp: "& up",
    priceMinAria: "Minimum price",
    priceMaxAria: "Maximum price",
    loadFailed: "Couldn't load products",
    retry: "Try again",
    clearAll: "Clear all",
    showResults: "Show results",
    loadMore: "Load more",
    empty: "No products match your filters",
    emptyHint: "Try removing a filter or clearing all.",
  },
  contact: {
    eyebrow: "Contact",
    title: "Talk to Buyology",
    subtitle: "We're across the region and ready to help — pick your country or send us a message.",
    address: "Address",
    phone: "Phone",
    email: "Email",
    hours: "Hours",
    regions: {
      uae: "United Arab Emirates",
      qatar: "Qatar",
      saudi: "Saudi Arabia",
      bahrain: "Bahrain",
      azerbaijan: "Azerbaijan",
    },
    form: {
      title: "Send us a message",
      subtitle: "Ask us anything — we usually reply within a day.",
      name: "Your name",
      email: "Email address",
      subject: "Subject",
      region: "Region",
      message: "Message",
      send: "Send message",
      sentTitle: "Message sent!",
      sentBody: "Thanks for reaching out. Our team will get back to you shortly.",
      another: "Send another",
    },
  },
  giveaway: {
    eyebrow: "Giveaway",
    title: "Win the",
    prize: "iPhone 18 Pro",
    subtitle:
      "One reader walks away with the newest iPhone. Entry takes about a minute and closes at launch.",
    stepsLabel: "Two steps to enter",
    step1Title: "Create your Buyology account",
    step1Body: "Sign up on the site with the email you actually check — that is how we reach the winner.",
    step2Title: "Follow us on Instagram",
    step2Body: "Follow the Buyology page and keep notifications on. We announce the winner there.",
    cta: "Enter the giveaway",
    instagram: "Follow on Instagram",
    note: "The iPhone 18 Pro will be given away in the first week of its release date.",
  },
  notFound: {
    eyebrow: "Signal lost",
    title: "This page has gone off the grid",
    body: "The link may be broken, or the product may have sold out and moved on. Let's get you back to something good.",
    home: "Back to home",
    browse: "Browse all products",
    categoriesTitle: "Or pick up where you left off",
  },
  chat: {
    launch: "Chat with Buyobot",
    greeting: "I'm here to help you",
    title: "Buyobot",
    status: "Online · 24/7",
    intro: "Hi! I'm Buyobot. Ask me about an order, a product, or a return — any time, day or night.",
    placeholder: "Ask about orders, products, returns…",
    send: "Send message",
    close: "Close chat",
    quickTrack: "Track my order",
    quickReturns: "Returns & refunds",
    quickProduct: "Find a product",
    quickHuman: "Talk to a human",
    replyTrack: "Open Account → Orders and pick the order you want. Every order shows its current status and delivery window.",
    replyReturns: "You have 14 days from delivery to start a return. Unopened items are collected free of charge.",
    replyProduct: "Tell me the category and your budget and I'll narrow it down — or try voice search from the header.",
    replyHuman: "Our team is on support@buyology.online and replies within one working day. The contact page has regional phone numbers too.",
    fallback: "I haven't been taught that one yet. Try one of the buttons above, or email support@buyology.online.",
    disclaimer: "Buyobot is a demo assistant — answers are illustrative, not account-specific.",
    typing: "Typing…",
    errorGeneric: "That didn't go through. Try again, or contact our team.",
    rateLimited: "Too many messages just now. Try again in {s}s.",
    charsLeft: "{n} characters left",
    escalateCta: "Talk to our team",
    viewProduct: "View product",
    outOfStock: "Out of stock",
    preOrder: "Pre-order",
    refurbished: "Refurbished",
  },
};

const az: Dict = {
  stories: {
    ariaRow: "Hekayələr",
    close: "Bağla",
    previous: "Əvvəlki hekayə",
    next: "Növbəti hekayə",
    mute: "Səssiz",
    unmute: "Səsli",
    likes: "Bəyənmələr",
    signInToLike: "Hekayələri bəyənmək üçün daxil olun",
  },
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
    whoWeAre: "Biz kimik",
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
    savedForLater: "Sonraya saxlanılanlar",
    moveToCart: "Səbətə köçür",
    selectAll: "Hamısını seç",
    selectedSuffix: "seçilib",
    noneSelected: "Ödənişə keçmək üçün ən azı bir məhsul seçin",
    selectItem: "Seç",
    shippingAtCheckout: "Ödəniş zamanı hesablanır",
    syncErrorNote: "Səbətinizi sinxronlaşdırarkən xəta baş verdi — yenidən yükləndi.",
    saved: "Saxlanıldı",
    reviews: "rəy",
    inStock: "Stokda var",
  },
  checkout: {
    title: "Sifarişin rəsmiləşdirilməsi",
    fulfilment: "Necə almaq istəyirsiniz?",
    delivery: "Çatdırılma",
    pickup: "Mağazadan götürmə",
    manageAddresses: "Ünvanları idarə et",
    noAddresses: "Hələ yadda saxlanmış ünvan yoxdur — davam etmək üçün hesabınızda əlavə edin.",
    noStores: "Hazırda götürmə üçün mağaza yoxdur.",
    method: "Çatdırılma sürəti",
    standard: "Standart çatdırılma",
    express: "Ekspres (30 dəq)",
    expressNeedsPin: "Ekspres üçün bu ünvana xəritə nişanı əlavə edin",
    expressUnavailable: "Bu ünvanda bu məhsullar üçün mövcud deyil",
    payment: "Ödəniş üsulu",
    card: "Kart",
    discount: "Endirim",
    promoInvalid: "Bu promo kod tətbiq oluna bilmir.",
    totalNote: "Yekun məbləğ ödəniş səhifəsində təsdiqlənir.",
    placeOrder: "Sifariş ver və ödə",
    placing: "Ödənişiniz hazırlanır…",
    placeFailed: "Sifarişi yerləşdirə bilmədik. Heç nə çıxılmayıb — yenidən cəhd edin.",
    phoneTitle: "Telefonunuzu təsdiqləyin",
    phoneHint: "Qısa SMS kod — kuryerlərə əlçatan nömrə lazımdır.",
    phoneRequired: "Sifariş vermək üçün telefon nömrənizi təsdiqləyin.",
    sendCode: "Kod göndər",
    resendCode: "Kodu yenidən göndər",
    verify: "Təsdiqlə",
    callback: {
      checking: "Ödənişiniz təsdiqlənir…",
      successTitle: "Ödəniş təsdiqləndi",
      successHint: "Sifarişiniz ödənilib və hazırlanır. Təsdiq e-poçtu yoldadır.",
      viewOrder: "Sifarişə bax",
      failedTitle: "Ödəniş alınmadı",
      failedHint: "Sizdən heç nə çıxılmayıb. Məhsullarınız hələ rezervdədir — yenidən cəhd edə bilərsiniz.",
      tryAgain: "Yenidən cəhd et",
      pendingTitle: "Ödəniş hələ emal olunur",
      pendingHint: "Bu bir az çəkə bilər. Bir dəqiqə sonra sifarişlərinizi yoxlayın — nəticəni hər halda qeyd edəcəyik.",
      toOrders: "Sifarişlərimə keç",
    },
    payNow: "İndi ödə",
    productUnavailable: "Bu məhsul hazırda mövcud deyil.",
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
  metrics: {
    eyebrow: "Rəqəmlərlə",
    heading: "Milyonlarla alıcının etimadı",
    subline: "Etibarlı alış üçün qurulmuş marketpleysdən real nəticələr.",
    scoreLabel: "Orta rəy balı",
    outOf: "5-dən",
    reviewsSuffix: "təsdiqlənmiş rəy",
    items: {
      customers: "Məmnun müştəri",
      orders: "Çatdırılmış sifariş",
      chats: "Buyobot söhbəti",
      ontime: "Vaxtında çatdırılma",
    },
  },
  pdp: {
    home: "Ana səhifə",
    breadcrumb: "Naviqasiya cığırı",
    buyNow: "İndi al",
    qty: "Miqdar",
    color: "Rəng",
    configuration: "Konfiqurasiya",
    inStock: "Stokda var",
    freeDelivery: "Pulsuz növbəti gün çatdırılma",
    deliveryNote: "Sabah çatdırılma üçün 4 saat ərzində sifariş verin",
    warranty: "2 illik zəmanət",
    returns: "14 gün pulsuz qaytarma",
    secure: "Təhlükəsiz, şifrələnmiş ödəniş",
    highlights: "Əsas xüsusiyyətlər",
    specifications: "Texniki göstəricilər",
    related: "Bunlar da xoşunuza gələ bilər",
    spec: {
      brand: "Brend",
      model: "Model",
      category: "Kateqoriya",
      warranty: "Zəmanət",
      box: "Qutunun içində",
      rating: "Reytinq",
    },
    ai: {
      eyebrow: "Buyobot rəy xülasəsi",
      title: "Sİ rəy xülasəsi",
      verdict: "Nəticə",
      positive: "müsbət",
      pros: "Alıcıların sevdiyi",
      cons: "Nəzərə alınmalı",
      themes: "Ən çox qeyd olunan",
      mentions: "qeyd",
      disclaimer:
        "Təsdiqlənmiş rəylərdən Sİ tərəfindən yaradılıb. Yanlışlıqlar ola bilər — aşağıdakı rəyləri yoxlayın.",
    },
    reviews: {
      title: "Müştəri rəyləri",
      write: "Rəy yaz",
      verified: "Təsdiqlənmiş alış",
      helpful: "Faydalı",
      basedOn: "Əsaslanır",
    },
    qa: {
      title: "Suallar və cavablar",
      ask: "Sual ver",
      answer: "Cavab",
      by: "—",
      votes: "bunu faydalı bildi",
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
  footer: {
    newsletter: {
      title: "Gələcəyin alış-verişinə qoşul",
      subtitle:
        "Yeni məhsullara erkən giriş, Sİ seçimli endirimlər və ilk sifarişinə 10% endirim.",
      placeholder: "E-poçtunuzu daxil edin",
      subscribe: "Abunə ol",
      success: "Tamamdır! Təsdiq üçün poçtunuzu yoxlayın.",
      note: "Abunə olmaqla Məxfilik Siyasətimizi qəbul edirsiniz. İstənilən vaxt imtina edə bilərsiniz.",
    },
    tagline:
      "Gələcək sizin üçün premium, Sİ əsaslı marketpleys — elektronika, audio, oyun və daha çoxu sürətli çatdırılma ilə.",
    followUs: "Bizi izləyin",
    contact: "Əlaqə",
    cols: { shop: "Alış-veriş", buyology: "Buyology", support: "Dəstək", company: "Şirkət" },
    links: {
      electronics: "Elektronika",
      buyobot: "Buyobot Sİ",
      repair: "Təmir",
      rent: "İcarə",
      tradein: "Dəyişdirmə",
      powerbank: "Powerbank Stansiyaları",
      diy: "DIY",
      help: "Yardım Mərkəzi",
      track: "Sifarişi izlə",
      shipping: "Çatdırılma",
      returns: "Qaytarma",
      warranty: "Zəmanət",
      contact: "Bizimlə əlaqə",
      about: "Haqqımızda",
      careers: "Karyera",
      sustainability: "Dayanıqlılıq",
      press: "Mətbuat",
      affiliates: "Tərəfdaşlar",
    },
    payments: "Qəbul edirik",
    rights: "Bütün hüquqlar qorunur.",
    madeIn: "BƏƏ-də dizayn edilib · Qiymətlər AED ilə",
    privacy: "Məxfilik Siyasəti",
    terms: "İstifadə Şərtləri",
    cookies: "Kukilər",
  },
  wishlist: {
    empty: "İstək siyahınız boşdur",
    emptyHint: "Saxlamaq üçün istənilən məhsulun ürək işarəsinə toxunun.",
    addAll: "Hamısını səbətə əlavə et",
  },
  account: {
    comingSoon: "Bu bölmə tezliklə yeni sayta köçürüləcək. Hələlik buyology.online üzərindən idarə edin.",
    title: "Hesabım",
    memberSince: "Üzvlük tarixi",
    points: "xal",
    tierMember: "üzv",
    signOut: "Çıxış",
    nav: {
      profile: "Profil",
      orders: "Sifarişlər",
      addresses: "Ünvanlar",
      payments: "Ödəniş üsulları",
      preferences: "Tənzimləmələr",
      security: "Təhlükəsizlik",
      danger: "Hesabı sil",
    },
    common: {
      save: "Dəyişiklikləri yadda saxla",
      saved: "Yadda saxlanıldı",
      cancel: "Ləğv et",
      add: "Əlavə et",
      edit: "Redaktə et",
      remove: "Sil",
      default: "Əsas",
      setDefault: "Əsas kimi təyin et",
    },
    profile: {
      title: "Şəxsi məlumat",
      subtitle: "Adınızı və əlaqə məlumatlarınızı yeniləyin.",
      firstName: "Ad",
      lastName: "Soyad",
      email: "E-poçt ünvanı",
      phone: "Telefon nömrəsi",
      phoneSearch: "Ölkə axtarın",
      phoneNoResults: "Axtarışa uyğun ölkə tapılmadı.",
      phoneResults: "ölkə",
      phoneResultOne: "ölkə",
      photo: "Profil şəkli",
      photoHint: "İstəyə bağlı. PNG, JPG və ya WebP, 5 MB-a qədər.",
      photoChoose: "Şəkil əlavə edin",
      photoChange: "Şəkli dəyişin",
      photoRemove: "Şəkli silin",
      photoNotImage: "Bu fayl şəkil deyil. PNG, JPG və ya WebP seçin.",
      photoTooLarge: "Şəkil 5 MB-dan böyükdür. Daha kiçiyini seçin və ya ölçüsünü azaldın.",
      photoPreviewAlt: "Profil şəklinin önizləməsi",
      photoSelected: "Şəkil seçildi",
      photoRemoved: "Profil şəkli silindi.",
    },
    orders: {
      title: "Sifariş tarixçəsi",
      subtitle: "Son sifarişlərinizi izləyin və idarə edin.",
      order: "Sifariş",
      items: "məhsul",
      view: "Bax",
      reorder: "Yenidən sifariş",
      statuses: {
        PENDING_PAYMENT: "Ödəniş gözlənilir",
        PAID: "Ödənilib",
        PACKAGING: "Qablaşdırılır",
        READY_FOR_PICKUP: "Təhvil üçün hazırdır",
        IN_COURIER: "Kuryerdədir",
        IN_TRANSIT: "Yoldadır",
        DELIVERED: "Çatdırılıb",
        CANCELLED: "Ləğv edilib",
        FAILED: "Çatdırılma alınmadı",
      },
      empty: "Hələ sifariş yoxdur — alışlarınız burada görünəcək.",
      loadMore: "Daha çox göstər",
      cancelOrder: "Sifarişi ləğv et",
      cancelConfirm: "Bu sifariş ləğv edilsin? Ödəniş etmisinizsə, kuryer dayandırıldığı təsdiqlənən kimi məbləğ geri qaytarılır.",
      cancelKeep: "Sifarişi saxla",
      cancelled: "Sifariş ləğv edildi.",
      track: "Bağlamanı izlə",
      placedOn: "Sifariş tarixi:",
      failed: "Sifarişi ləğv etmək mümkün olmadı",
      detail: {
        heading: "Sifariş",
        items: "Məhsullar",
        delivery: "Çatdırılma",
        pickup: "Mağazadan təhvil",
        recipient: "Alan şəxs",
        summary: "Xülasə",
        subtotal: "Ara cəm",
        discount: "Endirim",
        shipping: "Çatdırılma haqqı",
        credit: "Kreditlə ödənilib",
        total: "Cəmi",
        timeline: "Tarixçə",
        notFound: "Bu sifarişi tapa bilmədik.",
        payment: "Ödəniş",
        methodCard: "Kart",
        methodTabby: "Tabby",
        methodTamara: "Tamara",
        methodCredit: "Biznes krediti",
        proofPhoto: "Foto sübut",
        courier: "Kuryer",
        methodExpress: "Ekspres çatdırılma",
        methodRegular: "Standart çatdırılma",
        methodInternational: "Beynəlxalq çatdırılma",
        contact: "Əlaqə",
        shippedOn: "Göndərilib:",
        deliveredOn: "Çatdırılıb:",
        back: "Sifarişlərə qayıt",
        eta: "Təxmini çatdırılma",
      },
    },
    addresses: {
      title: "Yadda saxlanmış ünvanlar",
      subtitle: "Sifarişlərinizin çatdırıldığı yeri idarə edin.",
      addNew: "Ünvan əlavə et",
      name: "Tam ad",
      street: "Küçə ünvanı",
      city: "Şəhər",
      country: "Ölkə",
      phone: "Telefon",
      empty: "Hələ yadda saxlanmış ünvan yoxdur.",
      line2: "Mənzil, mərtəbə (istəyə bağlı)",
      state: "Rayon / Əmirlik",
      postalCode: "Poçt indeksi (istəyə bağlı)",
      labels: { HOME: "Ev", WORK: "İş", OTHER: "Digər" },
      deleteConfirm: "Bu ünvan silinsin?",
      noEditNote: "Ünvanı dəyişmək üçün onu silib düzəlişlə yenidən əlavə edin.",
      useMyLocation: "Məkanımı istifadə et",
      locating: "Məkanınız tapılır…",
      locationFailed: "Məkanınızı təyin edə bilmədik — ünvanı əl ilə doldurun.",
      customName: "Bu ünvanı adlandırın",
    },
    payments: {
      title: "Ödəniş üsulları",
      subtitle: "Kartlarınızı və sonra-ödə hesablarınızı idarə edin.",
      expires: "Bitmə tarixi",
      addCard: "Kart əlavə et",
      bnpl: "Sonra ödə",
      connected: "Qoşulub",
    },
    preferences: {
      title: "Tənzimləmələr",
      subtitle: "Dil, valyuta və sizinlə əlaqə üsulu.",
      language: "Dil",
      currency: "Valyuta",
      notifications: "Bildirişlər",
      channelEmail: "E-poçt",
      channelSms: "SMS",
      channelPush: "Push",
      newsletter: "Məhsul xəbərləri və təkliflər",
    },
    security: {
      title: "Təhlükəsizlik",
      subtitle: "Hesabınızı qoruyun.",
      changePassword: "Parolu dəyiş",
      current: "Cari parol",
      newPass: "Yeni parol",
      confirm: "Yeni parolu təsdiqlə",
      update: "Parolu yenilə",
      updated: "Parol yeniləndi",
      mismatch: "Parollar uyğun gəlmir.",
      tooShort: "Ən azı 8 simvol istifadə edin.",
      twofa: "İki faktorlu autentifikasiya",
      twofaDesc: "Girişdə əlavə təhlükəsizlik qatı əlavə edin.",
      signOutAll: "Bütün cihazlardan çıx",
      viaEmailIntro: "Şifrənizi e-poçtunuza göndərilən kodla dəyişirik — cari şifrə tələb olunmur.",
      sendCode: "Kod göndər",
      codeSentTo: "Kod göndərildi:",
    },
    danger: {
      title: "Hesabı sil",
      subtitle: "Hesabınızı və bütün məlumatlarını həmişəlik silin.",
      delete: "Hesabı sil",
      warning:
        "Bu geri qaytarıla bilməz. Sifarişləriniz, istək siyahınız, ünvanlarınız və bonuslarınız həmişəlik silinəcək.",
      modalTitle: "Hesabınızı silmək istəyirsiniz?",
      modalBody:
        "Bu, profilinizi, sifariş tarixçənizi, ünvanlarınızı və Buyology bonuslarınızı həmişəlik siləcək. Bu əməliyyat geri qaytarıla bilməz.",
      confirmHint: "Təsdiq üçün DELETE yazın",
      confirmWord: "DELETE",
      confirm: "Həmişəlik sil",
      deletedTitle: "Hesabınız silindi",
      deletedBody: "Getdiyinizə görə üzülürük. İstənilən vaxt yeni hesab yarada bilərsiniz.",
      backHome: "Ana səhifəyə qayıt",
    },
  },
  auth: {
    welcomeTitle: "Gələcək sizin üçün marketpleys",
    welcomeSub:
      "Sifarişləri izləmək, istək siyahıları saxlamaq və Buyobot ilə daha ağıllı alış-veriş üçün daxil olun.",
    perks: {
      delivery: "Pulsuz növbəti gün çatdırılma",
      ai: "Şəxsi Sİ alış-veriş köməkçiniz",
      warranty: "Hər məhsula 2 illik zəmanət",
    },
    email: "E-poçt ünvanı",
    password: "Parol",
    firstName: "Ad",
    lastName: "Soyad",
    or: "və ya",
    continueWith: "Davam et:",
    floatChat: "Büdcənizə uyğun 3 noutbuk tapdım ✨",
    passwordTab: "Parol",
    qrTab: "QR kod",
    qr: {
      title: "Buyology tətbiqi ilə daxil ol",
      step1: "Telefonunuzda Buyology tətbiqini açın",
      step2: "Yuxarı paneldə skan ikonuna toxunun",
      step3: "Kameranı bu koda tutun",
      waiting: "Skan etməyinizi gözləyirik…",
      getApp: "Hələ tətbiqiniz yoxdur?",
    },
    login: {
      title: "Yenidən xoş gəldiniz",
      subtitle: "Buyology hesabınıza daxil olun.",
      submit: "Daxil ol",
      remember: "Məni xatırla",
      forgot: "Parolu unutmusunuz?",
      noAccount: "Buyology-də yenisiniz?",
      cta: "Hesab yarat",
    },
    signup: {
      title: "Hesab yaradın",
      subtitle: "Buyology-yə qoşulun və gələcəyi alış-veriş edin.",
      submit: "Hesab yarat",
      terms: "İstifadə Şərtləri və Məxfilik Siyasəti ilə razıyam.",
      hasAccount: "Artıq hesabınız var?",
      cta: "Daxil ol",
      personalTab: "Şəxsi",
      businessTab: "Biznes",
      business: {
        name: "Biznes adı",
        contact: "Əlaqələndirici şəxs",
        email: "Biznes e-poçtu",
        phone: "Telefon nömrəsi (istəyə bağlı)",
        industry: "Sahə",
        selectIndustry: "Sahə seçin",
        employees: "İşçilərin sayı",
        selectEmployees: "Diapazon seçin",
        licence: "Ticarət lisenziyası",
        licenceHint: "PDF və ya şəkil \u00b7 10 MB-a qədər",
        website: "Veb sayt (istəyə bağlı)",
        uploadCta: "Yükləmək üçün klikləyin və ya sürükləyin",
        industries: {
          retail: "Pərakəndə",
          electronics: "Elektronika",
          services: "Xidmətlər",
          wholesale: "Topdan",
          manufacturing: "İstehsal",
          other: "Digər",
        },
      },
    },
    errors: {
      invalidCredentials: "E-poçt və ya şifrə yanlışdır.",
      notRegistered: "Bu e-poçt ilə hesab tapılmadı — aşağıda yenisini yaradın.",
      suspended: "Hesabınız dayandırılıb. Dəstək xidməti ilə əlaqə saxlayın.",
      tooManyAttempts: "Həddindən çox cəhd. Bir neçə dəqiqədən sonra yenidən yoxlayın.",
      emailExists: "Bu e-poçt ilə hesab artıq mövcuddur — daxil olun.",
      network: "Serverə çatmaq mümkün deyil. Bağlantını yoxlayıb yenidən cəhd edin.",
      appleFailed: "Apple ilə giriş tamamlanmadı. Yenidən cəhd edin.",
      generic: "Xəta baş verdi. Yenidən cəhd edin.",
    },
    loading: "Gözləyin…",
    otp: {
      title: "E-poçtunuzu yoxlayın",
      sentTo: "6 rəqəmli kodu bu ünvana göndərdik:",
      verify: "Təsdiqlə və hesab yarat",
      resend: "Kodu yenidən göndər",
      resendIn: "Yenidən göndər:",
      wrong: "Kod düzgün deyil — yenidən cəhd edin.",
      expired: "Kodun vaxtı bitib. Aşağıdan yenisini göndərin.",
      restart: "Sessiyanın vaxtı bitdi — yenidən qeydiyyatdan keçin.",
      back: "E-poçtu dəyiş",
    },
    businessSoon: "Biznes hesabları tezliklə yeni sayta köçürüləcək. Hələlik buyology.online üzərindən müraciət edin.",
    forgot: {
      emailTitle: "Parolu unutmusunuz?",
      emailSub: "E-poçtunuzu daxil edin, sizə 6 rəqəmli kod göndərək.",
      send: "Kod göndər",
      otpTitle: "Kodu daxil edin",
      otpSub: "6 rəqəmli kodu bura göndərdik:",
      verify: "Təsdiqlə",
      changeEmail: "E-poçtu dəyiş",
      noCode: "Kod gəlmədi?",
      resend: "Yenidən göndər",
      resendIn: "Yenidən göndər:",
      resetTitle: "Yeni parol yaradın",
      resetSub: "Əvvəl istifadə etmədiyiniz güclü parol seçin.",
      submit: "Parolu sıfırla",
      doneTitle: "Parol sıfırlandı",
      doneSub: "Parolunuz dəyişdirildi. İndi daxil ola bilərsiniz.",
      backToSignin: "Girişə qayıt",
    },
  },
  shop: {
    title: "Bütün məhsullar",
    subtitle: "Buyology kataloqunu tam kəşf edin.",
    results: "məhsul",
    sortBy: "Sıralama",
    sort: {
      featured: "Seçilmiş",
      priceAsc: "Qiymət: aşağıdan yuxarı",
      priceDesc: "Qiymət: yuxarıdan aşağı",
      rating: "Ən yüksək reytinq",
      reviews: "Ən çox rəy",
      discount: "Ən böyük endirim",
    },
    filters: "Filtrlər",
    category: "Kateqoriya",
    price: "Qiymət",
    rating: "Reytinq",
    onSale: "Endirimdə (25%+)",
    bestsellers: "Yalnız ən çox satılanlar",
    ratingUp: "və yuxarı",
    priceMinAria: "Minimum qiymət",
    priceMaxAria: "Maksimum qiymət",
    loadFailed: "Məhsulları yükləmək mümkün olmadı",
    retry: "Yenidən cəhd et",
    clearAll: "Hamısını təmizlə",
    showResults: "Nəticələri göstər",
    loadMore: "Daha çox yüklə",
    empty: "Filtrlərinizə uyğun məhsul yoxdur",
    emptyHint: "Bir filtri silin və ya hamısını təmizləyin.",
  },
  contact: {
    eyebrow: "Əlaqə",
    title: "Buyology ilə əlaqə saxlayın",
    subtitle: "Bütün region üzrə buradayıq və kömək etməyə hazırıq — ölkənizi seçin və ya mesaj göndərin.",
    address: "Ünvan",
    phone: "Telefon",
    email: "E-poçt",
    hours: "İş saatları",
    regions: {
      uae: "Birləşmiş Ərəb Əmirlikləri",
      qatar: "Qətər",
      saudi: "Səudiyyə Ərəbistanı",
      bahrain: "Bəhreyn",
      azerbaijan: "Azərbaycan",
    },
    form: {
      title: "Bizə mesaj göndərin",
      subtitle: "İstənilən sualı verin — adətən bir gün ərzində cavab veririk.",
      name: "Adınız",
      email: "E-poçt ünvanı",
      subject: "Mövzu",
      region: "Region",
      message: "Mesaj",
      send: "Mesaj göndər",
      sentTitle: "Mesaj göndərildi!",
      sentBody: "Müraciətiniz üçün təşəkkürlər. Komandamız tezliklə sizinlə əlaqə saxlayacaq.",
      another: "Yenisini göndər",
    },
  },
  giveaway: {
    eyebrow: "Hədiyyə kampaniyası",
    title: "Qazan",
    prize: "iPhone 18 Pro",
    subtitle:
      "İştirakçılardan biri ən yeni iPhone-u qazanacaq. Qeydiyyat bir dəqiqə çəkir və təqdimat günü bağlanır.",
    stepsLabel: "İştirak üçün iki addım",
    step1Title: "Buyology hesabını yarat",
    step1Body: "Saytda istifadə etdiyiniz e-poçt ilə qeydiyyatdan keçin — qalibi bu ünvandan tapacağıq.",
    step2Title: "Instagram-da izləyin",
    step2Body: "Buyology səhifəsini izləyin və bildirişləri aktiv saxlayın. Qalibi orada elan edirik.",
    cta: "Kampaniyaya qoşul",
    instagram: "Instagram-da izlə",
    note: "iPhone 18 Pro təqdimat tarixindən sonrakı ilk həftə ərzində hədiyyə ediləcək.",
  },
  notFound: {
    eyebrow: "Siqnal itdi",
    title: "Bu səhifə şəbəkədən kənara çıxıb",
    body: "Keçid işləməyə bilər və ya məhsul satılıb bitib. Gəlin sizi yenidən maraqlı bir şeyə qaytaraq.",
    home: "Ana səhifəyə qayıt",
    browse: "Bütün məhsullara bax",
    categoriesTitle: "Və ya qaldığınız yerdən davam edin",
  },
  chat: {
    launch: "Buyobot ilə söhbət",
    greeting: "Sizə kömək etmək üçün buradayam",
    title: "Buyobot",
    status: "Onlayn · 24/7",
    intro: "Salam! Mən Buyobotam. Sifariş, məhsul və ya geri qaytarma barədə istənilən vaxt soruşun.",
    placeholder: "Sifariş, məhsul, geri qaytarma…",
    send: "Mesaj göndər",
    close: "Söhbəti bağla",
    quickTrack: "Sifarişimi izlə",
    quickReturns: "Geri qaytarma və vəsait",
    quickProduct: "Məhsul tap",
    quickHuman: "Operatorla danış",
    replyTrack: "Hesab → Sifarişlər bölməsini açın və istədiyiniz sifarişi seçin. Hər sifarişin statusu və çatdırılma vaxtı göstərilir.",
    replyReturns: "Çatdırılmadan sonra 14 gün ərzində geri qaytara bilərsiniz. Açılmamış məhsullar pulsuz götürülür.",
    replyProduct: "Kateqoriya və büdcənizi deyin, seçimi daraldım — və ya başlıqdakı səsli axtarışdan istifadə edin.",
    replyHuman: "Komandamız support@buyology.online ünvanında bir iş günü ərzində cavab verir. Əlaqə səhifəsində regional nömrələr də var.",
    fallback: "Bunu hələ öyrənməmişəm. Yuxarıdakı düymələrdən birini seçin və ya support@buyology.online ünvanına yazın.",
    disclaimer: "Buyobot nümayiş assistentidir — cavablar nümunə xarakterlidir, hesaba aid deyil.",
    typing: "Yazır…",
    errorGeneric: "Alınmadı. Yenidən cəhd edin və ya komandamızla əlaqə saxlayın.",
    rateLimited: "Çox sayda mesaj göndərildi. {s} saniyə sonra yenidən cəhd edin.",
    charsLeft: "{n} simvol qalıb",
    escalateCta: "Komandamızla danışın",
    viewProduct: "Məhsula bax",
    outOfStock: "Stokda yoxdur",
    preOrder: "Ön sifariş",
    refurbished: "Bərpa edilmiş",
  },
};

const ar: Dict = {
  stories: {
    ariaRow: "القصص",
    close: "إغلاق",
    previous: "القصة السابقة",
    next: "القصة التالية",
    mute: "كتم الصوت",
    unmute: "تشغيل الصوت",
    likes: "الإعجابات",
    signInToLike: "سجّل الدخول للإعجاب بالقصص",
  },
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
    whoWeAre: "من نحن",
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
    savedForLater: "محفوظ لوقت لاحق",
    moveToCart: "انقل إلى السلة",
    selectAll: "تحديد الكل",
    selectedSuffix: "محدد",
    noneSelected: "حدد منتجًا واحدًا على الأقل لإتمام الشراء",
    selectItem: "تحديد",
    shippingAtCheckout: "يُحسب عند إتمام الشراء",
    syncErrorNote: "حدث خطأ أثناء مزامنة سلتك — تم إعادة تحميلها.",
    saved: "محفوظ",
    reviews: "تقييم",
    inStock: "متوفّر",
  },
  checkout: {
    title: "إتمام الشراء",
    fulfilment: "كيف تودّ الاستلام؟",
    delivery: "توصيل",
    pickup: "استلام من المتجر",
    manageAddresses: "إدارة العناوين",
    noAddresses: "لا توجد عناوين محفوظة بعد — أضف عنوانًا في حسابك للمتابعة.",
    noStores: "لا توجد متاجر متاحة للاستلام حاليًا.",
    method: "سرعة التوصيل",
    standard: "توصيل عادي",
    express: "سريع (30 دقيقة)",
    expressNeedsPin: "أضف موقعًا على الخريطة لهذا العنوان لتفعيل التوصيل السريع",
    expressUnavailable: "غير متاح لهذه المنتجات على هذا العنوان",
    payment: "طريقة الدفع",
    card: "بطاقة",
    discount: "الخصم",
    promoInvalid: "لا يمكن تطبيق هذا الرمز الترويجي.",
    totalNote: "يتم تأكيد المبلغ النهائي في صفحة الدفع.",
    placeOrder: "أكِّد الطلب وادفع",
    placing: "جارٍ تجهيز الدفع…",
    placeFailed: "تعذر إتمام الطلب. لم يُخصم أي مبلغ — حاول مرة أخرى.",
    phoneTitle: "تحقق من هاتفك",
    phoneHint: "رمز SMS سريع — يحتاج المندوب إلى رقم يمكن الوصول إليه.",
    phoneRequired: "تحقق من رقم هاتفك لإتمام الطلب.",
    sendCode: "أرسل الرمز",
    resendCode: "إعادة إرسال الرمز",
    verify: "تحقق",
    callback: {
      checking: "جارٍ تأكيد دفعتك…",
      successTitle: "تم تأكيد الدفع",
      successHint: "طلبك مدفوع وقيد التجهيز. رسالة التأكيد في الطريق.",
      viewOrder: "عرض الطلب",
      failedTitle: "لم تتم عملية الدفع",
      failedHint: "لم يُخصم منك شيء. منتجاتك لا تزال محجوزة — يمكنك المحاولة مجددًا.",
      tryAgain: "حاول مرة أخرى",
      pendingTitle: "الدفع قيد المعالجة",
      pendingHint: "قد يستغرق هذا لحظة. تفقد طلباتك بعد دقيقة — سنسجل النتيجة في كل الأحوال.",
      toOrders: "الذهاب إلى طلباتي",
    },
    payNow: "ادفع الآن",
    productUnavailable: "هذا المنتج غير متاح حاليًا.",
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
  metrics: {
    eyebrow: "بالأرقام",
    heading: "موثوق من ملايين المتسوّقين",
    subline: "نتائج حقيقية من سوق مبني لتسوّق واثق.",
    scoreLabel: "متوسّط تقييم المراجعات",
    outOf: "من 5",
    reviewsSuffix: "مراجعة موثّقة",
    items: {
      customers: "عميل سعيد",
      orders: "طلب تم تسليمه",
      chats: "محادثة مع Buyobot",
      ontime: "تسليم في الوقت المحدد",
    },
  },
  pdp: {
    home: "الرئيسية",
    breadcrumb: "مسار التنقل",
    buyNow: "اشترِ الآن",
    qty: "الكمية",
    color: "اللون",
    configuration: "التهيئة",
    inStock: "متوفّر",
    freeDelivery: "توصيل مجاني في اليوم التالي",
    deliveryNote: "اطلب خلال 4 ساعات للتوصيل غدًا",
    warranty: "ضمان لمدة سنتين",
    returns: "إرجاع مجاني خلال 14 يومًا",
    secure: "دفع آمن ومشفّر",
    highlights: "أبرز المزايا",
    specifications: "المواصفات",
    related: "قد يعجبك أيضًا",
    spec: {
      brand: "العلامة التجارية",
      model: "الطراز",
      category: "الفئة",
      warranty: "الضمان",
      box: "محتويات العلبة",
      rating: "التقييم",
    },
    ai: {
      eyebrow: "ملخّص مراجعات Buyobot",
      title: "ملخّص المراجعات بالذكاء الاصطناعي",
      verdict: "الخلاصة",
      positive: "إيجابية",
      pros: "ما يحبّه المشترون",
      cons: "ما يستحق الانتباه",
      themes: "الأكثر ذكرًا",
      mentions: "إشارة",
      disclaimer:
        "أُنشئ بالذكاء الاصطناعي من مراجعات موثّقة. قد يحتوي على أخطاء — راجع التقييمات أدناه.",
    },
    reviews: {
      title: "تقييمات العملاء",
      write: "اكتب مراجعة",
      verified: "شراء موثّق",
      helpful: "مفيد",
      basedOn: "استنادًا إلى",
    },
    qa: {
      title: "الأسئلة والأجوبة",
      ask: "اطرح سؤالًا",
      answer: "الإجابة",
      by: "—",
      votes: "وجدوا هذا مفيدًا",
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
  footer: {
    newsletter: {
      title: "انضم إلى مستقبل التسوّق",
      subtitle:
        "وصول مبكر للإصدارات، وعروض يختارها الذكاء الاصطناعي، وخصم 10% على أول طلب.",
      placeholder: "أدخل بريدك الإلكتروني",
      subscribe: "اشترك",
      success: "تم! تحقّق من بريدك للتأكيد.",
      note: "بالاشتراك فأنت توافق على سياسة الخصوصية. يمكنك إلغاء الاشتراك في أي وقت.",
    },
    tagline:
      "سوق مميّز قائم على الذكاء الاصطناعي من أجلك — إلكترونيات وصوتيات وألعاب والمزيد، بتوصيل سريع.",
    followUs: "تابعنا",
    contact: "تواصل معنا",
    cols: { shop: "تسوّق", buyology: "Buyology", support: "الدعم", company: "الشركة" },
    links: {
      electronics: "إلكترونيات",
      buyobot: "Buyobot AI",
      repair: "الإصلاح",
      rent: "التأجير",
      tradein: "الاستبدال",
      powerbank: "محطات الشحن",
      diy: "DIY",
      help: "مركز المساعدة",
      track: "تتبّع الطلب",
      shipping: "الشحن",
      returns: "الإرجاع",
      warranty: "الضمان",
      contact: "اتصل بنا",
      about: "من نحن",
      careers: "الوظائف",
      sustainability: "الاستدامة",
      press: "الصحافة",
      affiliates: "الشركاء",
    },
    payments: "نقبل",
    rights: "جميع الحقوق محفوظة.",
    madeIn: "صُمّم في الإمارات · الأسعار بالدرهم",
    privacy: "سياسة الخصوصية",
    terms: "شروط الخدمة",
    cookies: "ملفات تعريف الارتباط",
  },
  wishlist: {
    empty: "قائمة أمنياتك فارغة",
    emptyHint: "اضغط على القلب في أي منتج لحفظه هنا.",
    addAll: "أضف الكل إلى السلة",
  },
  account: {
    comingSoon: "سينتقل هذا القسم إلى الموقع الجديد قريبًا. حتى ذلك الحين، يمكنك إدارته عبر buyology.online.",
    title: "حسابي",
    memberSince: "عضو منذ",
    points: "نقطة",
    tierMember: "عضو",
    signOut: "تسجيل الخروج",
    nav: {
      profile: "الملف الشخصي",
      orders: "الطلبات",
      addresses: "العناوين",
      payments: "طرق الدفع",
      preferences: "التفضيلات",
      security: "الأمان",
      danger: "حذف الحساب",
    },
    common: {
      save: "حفظ التغييرات",
      saved: "تم الحفظ",
      cancel: "إلغاء",
      add: "إضافة",
      edit: "تعديل",
      remove: "إزالة",
      default: "افتراضي",
      setDefault: "تعيين كافتراضي",
    },
    profile: {
      title: "المعلومات الشخصية",
      subtitle: "حدّث اسمك وبيانات التواصل.",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      phoneSearch: "ابحث عن دولة",
      phoneNoResults: "لا توجد دولة مطابقة لبحثك.",
      phoneResults: "دولة",
      phoneResultOne: "دولة",
      photo: "صورة الملف الشخصي",
      photoHint: "اختياري. PNG أو JPG أو WebP، حتى 5 ميغابايت.",
      photoChoose: "إضافة صورة",
      photoChange: "تغيير الصورة",
      photoRemove: "إزالة الصورة",
      photoNotImage: "هذا الملف ليس صورة. اختر ملف PNG أو JPG أو WebP.",
      photoTooLarge: "حجم الصورة يتجاوز 5 ميغابايت. اختر صورة أصغر أو قلّل حجمها.",
      photoPreviewAlt: "معاينة صورة الملف الشخصي",
      photoSelected: "تم اختيار الصورة",
      photoRemoved: "تمت إزالة صورة الملف الشخصي.",
    },
    orders: {
      title: "سجل الطلبات",
      subtitle: "تتبّع طلباتك الأخيرة وأدرها.",
      order: "طلب",
      items: "منتج",
      view: "عرض",
      reorder: "إعادة الطلب",
      statuses: {
        PENDING_PAYMENT: "بانتظار الدفع",
        PAID: "مدفوع",
        PACKAGING: "قيد التغليف",
        READY_FOR_PICKUP: "جاهز للاستلام",
        IN_COURIER: "مع المندوب",
        IN_TRANSIT: "في الطريق",
        DELIVERED: "تم التوصيل",
        CANCELLED: "ملغي",
        FAILED: "فشل التوصيل",
      },
      empty: "لا توجد طلبات بعد — ستظهر مشترياتك هنا.",
      loadMore: "عرض المزيد",
      cancelOrder: "إلغاء الطلب",
      cancelConfirm: "هل تريد إلغاء هذا الطلب؟ إذا كنت قد دفعت، يُعاد المبلغ فور تأكيد إيقاف المندوب.",
      cancelKeep: "الاحتفاظ بالطلب",
      cancelled: "تم إلغاء الطلب.",
      track: "تتبّع الشحنة",
      placedOn: "تاريخ الطلب:",
      failed: "تعذّر إلغاء هذا الطلب",
      detail: {
        heading: "الطلب",
        items: "المنتجات",
        delivery: "التوصيل",
        pickup: "الاستلام من المتجر",
        recipient: "المستلم",
        summary: "الملخص",
        subtotal: "المجموع الفرعي",
        discount: "الخصم",
        shipping: "رسوم التوصيل",
        credit: "مدفوع بالرصيد",
        total: "الإجمالي",
        timeline: "السجل",
        notFound: "لم نتمكن من العثور على هذا الطلب.",
        payment: "الدفع",
        methodCard: "بطاقة",
        methodTabby: "Tabby",
        methodTamara: "Tamara",
        methodCredit: "رصيد الأعمال",
        proofPhoto: "إثبات بالصورة",
        courier: "المندوب",
        methodExpress: "توصيل سريع",
        methodRegular: "توصيل عادي",
        methodInternational: "شحن دولي",
        contact: "جهة الاتصال",
        shippedOn: "تم الشحن في",
        deliveredOn: "تم التوصيل في",
        back: "العودة إلى الطلبات",
        eta: "التوصيل المتوقع",
      },
    },
    addresses: {
      title: "العناوين المحفوظة",
      subtitle: "أدر أماكن توصيل طلباتك.",
      addNew: "إضافة عنوان",
      name: "الاسم الكامل",
      street: "عنوان الشارع",
      city: "المدينة",
      country: "الدولة",
      phone: "الهاتف",
      empty: "لا توجد عناوين محفوظة بعد.",
      line2: "الشقة، الطابق (اختياري)",
      state: "المنطقة / الإمارة",
      postalCode: "الرمز البريدي (اختياري)",
      labels: { HOME: "المنزل", WORK: "العمل", OTHER: "أخرى" },
      deleteConfirm: "هل تريد حذف هذا العنوان؟",
      noEditNote: "لتغيير عنوان، احذفه ثم أضِفه من جديد مصحّحًا.",
      useMyLocation: "استخدم موقعي",
      locating: "جارٍ تحديد موقعك…",
      locationFailed: "تعذّر تحديد موقعك — املأ العنوان يدويًا.",
      customName: "سمِّ هذا العنوان",
    },
    payments: {
      title: "طرق الدفع",
      subtitle: "أدر بطاقاتك وحسابات الدفع لاحقًا.",
      expires: "تنتهي في",
      addCard: "إضافة بطاقة",
      bnpl: "ادفع لاحقًا",
      connected: "متصل",
    },
    preferences: {
      title: "التفضيلات",
      subtitle: "اللغة والعملة وكيفية تواصلنا معك.",
      language: "اللغة",
      currency: "العملة",
      notifications: "الإشعارات",
      channelEmail: "البريد",
      channelSms: "رسالة نصية",
      channelPush: "تنبيهات",
      newsletter: "أخبار المنتجات والعروض",
    },
    security: {
      title: "الأمان",
      subtitle: "حافظ على أمان حسابك.",
      changePassword: "تغيير كلمة المرور",
      current: "كلمة المرور الحالية",
      newPass: "كلمة المرور الجديدة",
      confirm: "تأكيد كلمة المرور الجديدة",
      update: "تحديث كلمة المرور",
      updated: "تم تحديث كلمة المرور",
      mismatch: "كلمتا المرور غير متطابقتين.",
      tooShort: "استخدم 8 أحرف على الأقل.",
      twofa: "المصادقة الثنائية",
      twofaDesc: "أضف طبقة حماية إضافية عند تسجيل الدخول.",
      signOutAll: "تسجيل الخروج من كل الأجهزة",
      viaEmailIntro: "نغيّر كلمة مرورك برمز يُرسل إلى بريدك الإلكتروني — لا حاجة لكلمة المرور الحالية.",
      sendCode: "أرسل لي رمزًا",
      codeSentTo: "أُرسل الرمز إلى",
    },
    danger: {
      title: "حذف الحساب",
      subtitle: "احذف حسابك وكل بياناته نهائيًا.",
      delete: "حذف الحساب",
      warning:
        "لا يمكن التراجع عن هذا. ستُحذف طلباتك وقائمة أمنياتك وعناوينك ومكافآتك نهائيًا.",
      modalTitle: "حذف حسابك؟",
      modalBody:
        "سيؤدي هذا إلى محو ملفك الشخصي وسجل طلباتك وعناوينك المحفوظة ومكافآت Buyology نهائيًا. لا يمكن التراجع عن هذا الإجراء.",
      confirmHint: "اكتب DELETE للتأكيد",
      confirmWord: "DELETE",
      confirm: "حذف نهائي",
      deletedTitle: "تم حذف حسابك",
      deletedBody: "يؤسفنا رحيلك. يمكنك إنشاء حساب جديد في أي وقت.",
      backHome: "العودة إلى الرئيسية",
    },
  },
  auth: {
    welcomeTitle: "السوق من أجل مستقبلك",
    welcomeSub:
      "سجّل الدخول لتتبّع الطلبات وحفظ قوائم الأمنيات ولتسوّق بذكاء أكبر مع Buyobot.",
    perks: {
      delivery: "توصيل مجاني في اليوم التالي",
      ai: "مساعد التسوّق الذكي الخاص بك",
      warranty: "ضمان سنتين على كل منتج",
    },
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    or: "أو",
    continueWith: "المتابعة عبر",
    floatChat: "وجدت 3 حواسيب ضمن ميزانيتك ✨",
    passwordTab: "كلمة المرور",
    qrTab: "رمز QR",
    qr: {
      title: "سجّل الدخول عبر تطبيق Buyology",
      step1: "افتح تطبيق Buyology على هاتفك",
      step2: "اضغط على أيقونة المسح في الشريط العلوي",
      step3: "وجّه الكاميرا نحو هذا الرمز",
      waiting: "بانتظار مسحك للرمز…",
      getApp: "ليس لديك التطبيق بعد؟",
    },
    login: {
      title: "مرحبًا بعودتك",
      subtitle: "سجّل الدخول إلى حساب Buyology.",
      submit: "تسجيل الدخول",
      remember: "تذكّرني",
      forgot: "نسيت كلمة المرور؟",
      noAccount: "جديد على Buyology؟",
      cta: "أنشئ حسابًا",
    },
    signup: {
      title: "أنشئ حسابك",
      subtitle: "انضم إلى Buyology وابدأ تسوّق المستقبل.",
      submit: "إنشاء حساب",
      terms: "أوافق على شروط الخدمة وسياسة الخصوصية.",
      hasAccount: "لديك حساب بالفعل؟",
      cta: "تسجيل الدخول",
      personalTab: "شخصي",
      businessTab: "أعمال",
      business: {
        name: "اسم النشاط التجاري",
        contact: "الشخص المسؤول",
        email: "بريد العمل الإلكتروني",
        phone: "رقم الهاتف (اختياري)",
        industry: "المجال",
        selectIndustry: "اختر مجالًا",
        employees: "عدد الموظفين",
        selectEmployees: "اختر نطاقًا",
        licence: "الرخصة التجارية",
        licenceHint: "PDF أو صورة \u00b7 حتى 10 ميغابايت",
        website: "الموقع الإلكتروني (اختياري)",
        uploadCta: "انقر للرفع أو اسحب الملف وأفلته",
        industries: {
          retail: "تجزئة",
          electronics: "إلكترونيات",
          services: "خدمات",
          wholesale: "جملة",
          manufacturing: "تصنيع",
          other: "أخرى",
        },
      },
    },
    errors: {
      invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      notRegistered: "لا يوجد حساب بهذا البريد — أنشئ حسابًا أدناه.",
      suspended: "تم إيقاف حسابك. يرجى التواصل مع الدعم.",
      tooManyAttempts: "محاولات كثيرة جدًا. حاول مرة أخرى بعد دقائق.",
      emailExists: "يوجد حساب بهذا البريد بالفعل — سجّل الدخول بدلًا من ذلك.",
      network: "تعذّر الوصول إلى الخادم. تحقق من اتصالك وحاول مجددًا.",
      appleFailed: "لم يكتمل تسجيل الدخول عبر Apple. حاول مرة أخرى.",
      generic: "حدث خطأ ما. حاول مرة أخرى.",
    },
    loading: "يرجى الانتظار…",
    otp: {
      title: "تحقق من بريدك الوارد",
      sentTo: "أرسلنا رمزًا من 6 أرقام إلى",
      verify: "تحقّق وأنشئ الحساب",
      resend: "إعادة إرسال الرمز",
      resendIn: "إعادة الإرسال خلال",
      wrong: "الرمز غير صحيح — حاول مرة أخرى.",
      expired: "انتهت صلاحية الرمز. أرسل رمزًا جديدًا أدناه.",
      restart: "انتهت الجلسة — يرجى التسجيل من جديد.",
      back: "تغيير البريد الإلكتروني",
    },
    businessSoon: "حسابات الأعمال ستنتقل إلى الموقع الجديد قريبًا. حتى ذلك الحين، قدّم الطلب عبر buyology.online.",
    forgot: {
      emailTitle: "نسيت كلمة المرور؟",
      emailSub: "أدخل بريدك الإلكتروني وسنرسل لك رمزًا من 6 أرقام.",
      send: "إرسال الرمز",
      otpTitle: "أدخل الرمز",
      otpSub: "أرسلنا رمزًا من 6 أرقام إلى",
      verify: "تحقّق",
      changeEmail: "تغيير البريد",
      noCode: "لم يصلك الرمز؟",
      resend: "إعادة الإرسال",
      resendIn: "إعادة الإرسال خلال",
      resetTitle: "أنشئ كلمة مرور جديدة",
      resetSub: "اختر كلمة مرور قوية لم تستخدمها من قبل.",
      submit: "إعادة تعيين كلمة المرور",
      doneTitle: "تمت إعادة التعيين",
      doneSub: "تم تغيير كلمة مرورك. يمكنك تسجيل الدخول الآن.",
      backToSignin: "العودة لتسجيل الدخول",
    },
  },
  shop: {
    title: "كل المنتجات",
    subtitle: "استكشف كتالوج Buyology بالكامل.",
    results: "منتج",
    sortBy: "الترتيب حسب",
    sort: {
      featured: "مميّز",
      priceAsc: "السعر: من الأقل للأعلى",
      priceDesc: "السعر: من الأعلى للأقل",
      rating: "الأعلى تقييمًا",
      reviews: "الأكثر مراجعة",
      discount: "أكبر خصم",
    },
    filters: "الفلاتر",
    category: "الفئة",
    price: "السعر",
    rating: "التقييم",
    onSale: "التخفيضات (خصم 25%+)",
    bestsellers: "الأكثر مبيعًا فقط",
    ratingUp: "فأكثر",
    priceMinAria: "الحد الأدنى للسعر",
    priceMaxAria: "الحد الأقصى للسعر",
    loadFailed: "تعذر تحميل المنتجات",
    retry: "حاول مرة أخرى",
    clearAll: "مسح الكل",
    showResults: "عرض النتائج",
    loadMore: "تحميل المزيد",
    empty: "لا توجد منتجات تطابق فلاترك",
    emptyHint: "جرّب إزالة فلتر أو مسح الكل.",
  },
  contact: {
    eyebrow: "تواصل",
    title: "تحدّث إلى Buyology",
    subtitle: "نحن حاضرون في أنحاء المنطقة وجاهزون لمساعدتك — اختر دولتك أو أرسل لنا رسالة.",
    address: "العنوان",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    hours: "ساعات العمل",
    regions: {
      uae: "الإمارات العربية المتحدة",
      qatar: "قطر",
      saudi: "السعودية",
      bahrain: "البحرين",
      azerbaijan: "أذربيجان",
    },
    form: {
      title: "أرسل لنا رسالة",
      subtitle: "اسألنا أي شيء — نردّ عادةً خلال يوم.",
      name: "اسمك",
      email: "البريد الإلكتروني",
      subject: "الموضوع",
      region: "المنطقة",
      message: "الرسالة",
      send: "إرسال الرسالة",
      sentTitle: "تم إرسال الرسالة!",
      sentBody: "شكرًا لتواصلك. سيعود إليك فريقنا قريبًا.",
      another: "إرسال رسالة أخرى",
    },
  },
  giveaway: {
    eyebrow: "سحب وجوائز",
    title: "اربح",
    prize: "iPhone 18 Pro",
    subtitle:
      "أحد المشاركين سيفوز بأحدث iPhone. التسجيل يستغرق دقيقة واحدة ويُغلق يوم الإطلاق.",
    stepsLabel: "خطوتان للمشاركة",
    step1Title: "أنشئ حساب Buyology",
    step1Body: "سجّل على الموقع بالبريد الإلكتروني الذي تستخدمه فعلاً — عبره سنتواصل مع الفائز.",
    step2Title: "تابعنا على إنستغرام",
    step2Body: "تابع صفحة Buyology وفعّل الإشعارات. نعلن اسم الفائز هناك.",
    cta: "شارك في السحب",
    instagram: "تابعنا على إنستغرام",
    note: "سيتم تسليم iPhone 18 Pro خلال الأسبوع الأول من تاريخ إطلاقه.",
  },
  notFound: {
    eyebrow: "انقطعت الإشارة",
    title: "هذه الصفحة خارج نطاق التغطية",
    body: "قد يكون الرابط معطلاً أو أن المنتج قد نفد من المخزون. دعنا نعيدك إلى شيء يستحق.",
    home: "العودة إلى الرئيسية",
    browse: "تصفح كل المنتجات",
    categoriesTitle: "أو تابع من حيث توقفت",
  },
  chat: {
    launch: "الدردشة مع Buyobot",
    greeting: "أنا هنا لمساعدتك",
    title: "Buyobot",
    status: "متصل · على مدار الساعة",
    intro: "مرحبًا! أنا Buyobot. اسألني عن طلب أو منتج أو إرجاع، في أي وقت ليلًا أو نهارًا.",
    placeholder: "اسأل عن الطلبات أو المنتجات أو الإرجاع…",
    send: "إرسال الرسالة",
    close: "إغلاق الدردشة",
    quickTrack: "تتبّع طلبي",
    quickReturns: "الإرجاع والاسترداد",
    quickProduct: "ابحث عن منتج",
    quickHuman: "التحدث إلى موظف",
    replyTrack: "افتح الحساب ← الطلبات واختر الطلب المطلوب. يعرض كل طلب حالته الحالية وموعد التسليم.",
    replyReturns: "لديك 14 يومًا من تاريخ التسليم لبدء الإرجاع. تُستلم المنتجات غير المفتوحة مجانًا.",
    replyProduct: "أخبرني بالفئة وميزانيتك وسأضيّق الخيارات — أو جرّب البحث الصوتي من الأعلى.",
    replyHuman: "فريقنا متاح على support@buyology.online ويرد خلال يوم عمل واحد. صفحة التواصل تضم أرقامًا إقليمية أيضًا.",
    fallback: "لم أتعلّم هذا بعد. جرّب أحد الأزرار أعلاه أو راسلنا على support@buyology.online.",
    disclaimer: "Buyobot مساعد تجريبي — الإجابات توضيحية وليست خاصة بحسابك.",
    typing: "يكتب…",
    errorGeneric: "لم تنجح العملية. حاول مرة أخرى أو تواصل مع فريقنا.",
    rateLimited: "رسائل كثيرة الآن. أعد المحاولة بعد {s} ثانية.",
    charsLeft: "بقي {n} حرفًا",
    escalateCta: "تحدث مع فريقنا",
    viewProduct: "عرض المنتج",
    outOfStock: "غير متوفر",
    preOrder: "طلب مسبق",
    refurbished: "مُجدَّد",
  },
};

export const dictionaries: Record<Locale, Dict> = { en, az, ar };
