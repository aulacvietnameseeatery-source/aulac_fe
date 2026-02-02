// src/data/menu-data.ts

export type ElementType = "Earth" | "Water" | "Wood" | "Fire" | "Metal";
export type CategoryId = "starters" | "salad" | "pho" | "bun" | "main" | "beverage" | "dessert";

export interface MenuItem {
    id: string;
    category: CategoryId;
    element: ElementType;
    subCategory?: string;
    name: {
        en: string;
        fr: string;
    };
    price: number; // CHF
    image: string;
    isSignature?: boolean;
    isVegetarian?: boolean;
}

// Danh sách Categories (Thứ tự hiển thị)
export const CATEGORIES = [
    { id: "starters", label: { en: "Starters", fr: "Entrées" }, icon: "🌱" },
    { id: "salad", label: { en: "Salads", fr: "Salades" }, icon: "🥗" },
    { id: "pho", label: { en: "Phở", fr: "Phở" }, icon: "🍜" },
    { id: "bun", label: { en: "Vermicelli", fr: "Bún" }, icon: "🍲" },
    { id: "main", label: { en: "Signatures", fr: "Plats Signatures" }, icon: "🍛" },
    { id: "beverage", label: { en: "Drinks", fr: "Boissons" }, icon: "☕" },
    { id: "dessert", label: { en: "Desserts", fr: "Desserts" }, icon: "🍮" },
] as const;

export const MENU_ITEMS: MenuItem[] = [
    // ==========================================
    // 1. STARTERS (EARTH)
    // ==========================================
    {
        id: "kv-01",
        category: "starters",
        element: "Earth",
        name: {
            fr: "Nems frits, végétariens ou au porc",
            en: "Crispy spring rolls, vegetarian or pork"
        },
        price: 14, // CHF
        image: "/images/menu/starters/spring-rolls.jpg",
    },
    {
        id: "kv-02",
        category: "starters",
        element: "Earth",
        name: {
            fr: "Nems croustillants aux fruits de mer (crevettes et calamar)",
            en: "Crispy seafood spring rolls with shrimp and squid"
        },
        price: 16,
        image: "/images/menu/starters/seafood-rolls.jpg",
    },
    {
        id: "kv-03",
        category: "starters",
        element: "Earth",
        name: {
            fr: "Rouleaux de printemps aux crevettes ou tofu",
            en: "Fresh spring rolls with shrimp or tofu"
        },
        price: 12,
        image: "/images/menu/starters/fresh-rolls.jpg",
    },
    {
        id: "kv-04",
        category: "starters",
        element: "Earth",
        name: {
            fr: "Bœuf grillé en feuilles de bétel, vermicelles fins",
            en: "Grilled beef in betel leaves with fine rice vermicelli"
        },
        price: 18,
        image: "/images/menu/starters/bo-la-lot.jpg",
    },
    {
        id: "kv-05",
        category: "starters",
        element: "Earth",
        name: {
            fr: "Ailes de poulet croustillantes, sauce beurre et nuoc-mâm",
            en: "Crispy chicken wings with butter fish sauce glaze"
        },
        price: 15,
        image: "/images/menu/starters/chicken-wings.jpg",
    },
    {
        id: "kv-06",
        category: "starters",
        element: "Earth",
        name: {
            fr: "Crevettes frites, mayonnaise à la moutarde",
            en: "Crispy prawns with mustard mayonnaise"
        },
        price: 19,
        image: "/images/menu/starters/prawns-mayo.jpg",
    },
    {
        id: "kv-07",
        category: "starters",
        element: "Earth",
        name: {
            fr: "Brioche vietnamienne frite, garnie de porc caramélisé",
            en: "Fried Vietnamese bun filled with caramelized pork"
        },
        price: 12,
        image: "/images/menu/starters/banh-bao.jpg",
    },
    {
        id: "kv-08",
        category: "starters",
        element: "Earth",
        name: {
            fr: "Pommes de terre rôties, beurre à l’ail",
            en: "Fried potatoes with garlic butter"
        },
        price: 9,
        image: "/images/menu/starters/fries.jpg",
    },

    // ==========================================
    // 2. SALADS (WATER)
    // ==========================================
    {
        id: "salad-01",
        category: "salad",
        element: "Water",
        name: {
            fr: "Salade de papaye verte aux crevettes grillées",
            en: "Green papaya salad with grilled shrimp"
        },
        price: 22,
        image: "/images/menu/salad/papaya-salad.jpg",
    },
    {
        id: "salad-02",
        category: "salad",
        element: "Water",
        name: {
            fr: "Salade de bœuf marinée aux herbes et agrumes",
            en: "Marinated beef salad with herbs and citrus"
        },
        price: 24,
        image: "/images/menu/salad/beef-salad.jpg",
    },
    {
        id: "salad-03",
        category: "salad",
        element: "Water",
        name: {
            fr: "Salade de fruits de mer An Lạc",
            en: "An Lạc seafood salad"
        },
        price: 26,
        image: "/images/menu/salad/seafood-salad.jpg",
        isSignature: true,
    },

    // ==========================================
    // 3. PHO (WATER)
    // ==========================================
    // --- Soup ---
    {
        id: "pho-01",
        category: "pho",
        subCategory: "soup",
        element: "Water",
        name: {
            fr: "Soupe phở au bœuf mi-cuit et travers",
            en: "Phở noodle soup with rare beef and ribs"
        },
        price: 28,
        image: "/images/menu/pho/pho-bo-suon.jpg",
    },
    {
        id: "pho-02",
        category: "pho",
        subCategory: "soup",
        element: "Water",
        name: {
            fr: "Phở au bœuf sauté",
            en: "Phở noodle soup with wok-seared beef"
        },
        price: 29,
        image: "/images/menu/pho/pho-tai-lan.jpg",
    },
    {
        id: "pho-03",
        category: "pho",
        subCategory: "soup",
        element: "Water",
        name: {
            fr: "Phở au poulet",
            en: "Chicken phở"
        },
        price: 26,
        image: "/images/menu/pho/pho-ga.jpg",
    },
    {
        id: "pho-04",
        category: "pho",
        subCategory: "soup",
        element: "Water",
        name: {
            fr: "Phở végétarien",
            en: "Vegetarian phở"
        },
        price: 24,
        image: "/images/menu/pho/pho-chay.jpg",
        isVegetarian: true,
    },
    {
        id: "pho-05",
        category: "pho",
        subCategory: "soup",
        element: "Water",
        name: {
            fr: "Œuf poché",
            en: "Poached egg"
        },
        price: 3,
        image: "/images/menu/pho/egg.jpg",
    },

    // --- Mixed (Dry) ---
    {
        id: "pho-mixed-01",
        category: "pho",
        subCategory: "mixed",
        element: "Water",
        name: {
            fr: "Phở au bœuf, version mélangée, bouillon à part",
            en: "Mixed phở noodles with beef, broth served separately"
        },
        price: 29,
        image: "/images/menu/pho/pho-tron-bo.jpg",
    },
    {
        id: "pho-mixed-02",
        category: "pho",
        subCategory: "mixed",
        element: "Water",
        name: {
            fr: "Phở au poulet, version mélangée, bouillon à part",
            en: "Mixed phở noodles with chicken, broth served separately"
        },
        price: 27,
        image: "/images/menu/pho/pho-tron-ga.jpg",
    },
    {
        id: "pho-mixed-03",
        category: "pho",
        subCategory: "mixed",
        element: "Water",
        name: {
            fr: "Phở végétarien, version mélangée, bouillon à part",
            en: "Mixed vegetarian phở noodles, broth served separately"
        },
        price: 25,
        image: "/images/menu/pho/pho-tron-chay.jpg",
        isVegetarian: true,
    },

    // ==========================================
    // 4. VERMICELLI (BUN) - WOOD
    // ==========================================
    {
        id: "bun-01",
        category: "bun",
        element: "Wood",
        name: {
            fr: "Bún au bœuf",
            en: "Rice vermicelli with beef"
        },
        price: 27,
        image: "/images/menu/bun/bun-bo.jpg",
    },
    {
        id: "bun-02",
        category: "bun",
        element: "Wood",
        name: {
            fr: "Bún au poulet",
            en: "Rice vermicelli with chicken"
        },
        price: 26,
        image: "/images/menu/bun/bun-ga.jpg",
    },
    {
        id: "bun-03",
        category: "bun",
        element: "Wood",
        name: {
            fr: "Bún végétarien",
            en: "Vegetarian rice vermicelli"
        },
        price: 24,
        image: "/images/menu/bun/bun-chay.jpg",
        isVegetarian: true,
    },
    {
        id: "bun-04",
        category: "bun",
        element: "Wood",
        name: {
            fr: "Bún chả – sélection spéciale",
            en: "Special grilled pork with vermicelli"
        },
        price: 29,
        image: "/images/menu/bun/bun-cha.jpg",
        isSignature: true,
    },

    // ==========================================
    // 5. SIGNATURES (MAINS) - FIRE
    // ==========================================
    {
        id: "main-01",
        category: "main",
        element: "Fire",
        name: {
            fr: "Bœuf sauté « luc lac », riz blanc et œuf au plat",
            en: "Shaking beef with rice and fried egg"
        },
        price: 34,
        image: "/images/menu/main/bo-luc-lac.jpg",
        isSignature: true,
    },
    {
        id: "main-02",
        category: "main",
        element: "Fire",
        name: {
            fr: "Riz au travers de porc grillé, œuf au plat",
            en: "Grilled pork chop rice with fried egg"
        },
        price: 28,
        image: "/images/menu/main/com-suon.jpg",
    },
    {
        id: "main-03",
        category: "main",
        element: "Fire",
        name: {
            fr: "Riz au poulet, sauce An Lạc",
            en: "Chicken rice with An Lạc house sauce"
        },
        price: 26,
        image: "/images/menu/main/com-ga.jpg",
    },
    {
        id: "main-04",
        category: "main",
        element: "Fire",
        name: {
            fr: "Poulet rôti, riz frit croustillant",
            en: "Roasted chicken with crispy fried rice"
        },
        price: 29,
        image: "/images/menu/main/ga-nuong.jpg",
    },
    {
        id: "main-05",
        category: "main",
        element: "Fire",
        name: {
            fr: "Canard sauce tamarin, riz gluant",
            en: "Tamarind duck with sticky rice"
        },
        price: 32,
        image: "/images/menu/main/vit-sot-me.jpg",
    },
    {
        id: "main-06",
        category: "main",
        element: "Fire",
        name: {
            fr: "Aubergine grillée à l’huile de ciboule, riz ou riz gluant",
            en: "Grilled eggplant with scallion oil, rice or sticky rice"
        },
        price: 24,
        image: "/images/menu/main/ca-tim-nuong.jpg",
        isVegetarian: true,
    },
    {
        id: "main-07",
        category: "main",
        element: "Fire",
        name: {
            fr: "Tofu braisé aux légumes, riz frit croustillant",
            en: "Braised tofu with vegetables and crispy fried rice"
        },
        price: 25,
        image: "/images/menu/main/tau-hu-kho.jpg",
        isVegetarian: true,
    },
    {
        id: "main-08",
        category: "main",
        element: "Fire",
        name: {
            fr: "Nouilles sautées au canard cinq-épices",
            en: "Stir-fried noodles with five-spice duck"
        },
        price: 30,
        image: "/images/menu/main/mi-xao-vit.jpg",
    },
    {
        id: "main-09",
        category: "main",
        element: "Fire",
        name: {
            fr: "Vermicelles de haricot mungo sautés, crevettes ou tofu",
            en: "Stir-fried glass noodles with shrimp or tofu"
        },
        price: 28,
        image: "/images/menu/main/mien-xao.jpg",
    },
    {
        id: "main-10",
        category: "main",
        element: "Fire",
        name: {
            fr: "Riz sauté aux crevettes",
            en: "Fried rice with shrimp"
        },
        price: 26,
        image: "/images/menu/main/com-chien-tom.jpg",
    },

    // ==========================================
    // 6. BEVERAGE (EARTH)
    // ==========================================
    {
        id: "bev-01",
        category: "beverage",
        element: "Earth",
        name: {
            fr: "Thé au jasmin, nougat de sésame et gingembre confit",
            en: "Jasmine tea with sesame nougat and candied ginger"
        },
        price: 8,
        image: "/images/menu/beverage/jasmine-tea.jpg",
    },
    {
        id: "bev-02",
        category: "beverage",
        element: "Earth",
        name: {
            fr: "Café vietnamien, biscuits fondants à la noix de coco",
            en: "Vietnamese coffee with coconut meltaway cookies"
        },
        price: 9,
        image: "/images/menu/beverage/viet-coffee.jpg",
    },

    // ==========================================
    // 7. DESSERTS (METAL)
    // ==========================================
    {
        id: "des-01",
        category: "dessert",
        element: "Metal",
        name: {
            fr: "Pudding au thé au lait",
            en: "Milk tea pudding"
        },
        price: 11,
        image: "/images/menu/dessert/pudding.jpg",
    },
    {
        id: "des-02",
        category: "dessert",
        element: "Metal",
        name: {
            fr: "Boules de riz gluant sucrées, trois saveurs",
            en: "Sweet glutinous rice dumplings, three flavors"
        },
        price: 12,
        image: "/images/menu/dessert/che-troi-nuoc.jpg",
    },
    {
        id: "des-03",
        category: "dessert",
        element: "Metal",
        name: {
            fr: "Riz gluant, glace coco",
            en: "Sticky rice with coconut ice cream"
        },
        price: 14,
        image: "/images/menu/dessert/xoi-kem-dua.jpg",
    },
    {
        id: "des-04",
        category: "dessert",
        element: "Metal",
        name: {
            fr: "Banane grillée au riz gluant, glace coco",
            en: "Grilled banana in sticky rice with coconut ice cream"
        },
        price: 14,
        image: "/images/menu/dessert/chuoi-nep-nuong.jpg",
    },
    {
        id: "des-05",
        category: "dessert",
        element: "Metal",
        name: {
            fr: "Glaces artisanales de saison",
            en: "Seasonal artisanal ice cream"
        },
        price: 9,
        image: "/images/menu/dessert/ice-cream.jpg",
    },
];