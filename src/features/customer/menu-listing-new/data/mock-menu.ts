export interface MenuItemData {
    id: string;
    name: string;
    price: number | string;
    desc: string;
    image: string;
}

export interface MenuCategory {
    id: string;
    name: string;
    items: MenuItemData[];
}

export const MENU_DATA: MenuCategory[] = [
    {
        id: 'chef',
        name: "Chef's Selection",
        items: [
            { id: 'sig-1', name: 'Risotto al Tartufo', price: 42, desc: 'Arborio rice slow-cooked with black truffle shavings and aged parmesan.', image: '/images/menu-listing/menu-grid/Truffle Mushroom Risotto.png' },
            { id: 'sig-2', name: 'Wagyu Beef A5', price: 89, desc: 'Premium Japanese A5 Wagyu, grilled to perfection with sea salt.', image: '/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png' },
            { id: 'sig-3', name: 'Lobster Thermidor', price: 58, desc: 'Whole lobster cooked in a rich creamy brandy sauce with cheese crust.', image: '/images/menu-listing/menu-grid/Lobster Thermidor.png' },
            { id: 'sig-4', name: 'Peking Duck', price: 45, desc: 'Crispy skin duck served with pancakes, cucumber, scallion, and hoisin sauce.', image: '/images/menu-listing/menu-grid/Peking Duck.png' },
        ]
    },
    {
        id: 'pho',
        name: "Traditional Pho",
        items: [
            { id: 'pho-1', name: 'Pho Dac Biet', price: 24, desc: 'Special combination beef noodle soup with rare steak, flank, brisket, tendon, and tripe.', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1974&auto=format&fit=crop' },
            { id: 'pho-2', name: 'Pho Tai', price: 20, desc: 'Classic beef noodle soup with thin slices of rare steak.', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=1974&auto=format&fit=crop' },
            { id: 'pho-3', name: 'Pho Nam', price: 20, desc: 'Beef noodle soup with well-done flank.', image: 'https://images.unsplash.com/photo-1613843572836-e633d7b04936?q=80&w=1974&auto=format&fit=crop' },
            { id: 'pho-4', name: 'Pho Ga', price: 19, desc: 'Chicken noodle soup with shredded free-range chicken.', image: 'https://images.unsplash.com/photo-1627850024823-356885360980?q=80&w=1974&auto=format&fit=crop' },
            { id: 'pho-5', name: 'Pho Bo Vien', price: 19, desc: 'Beef noodle soup with handmade beef meatballs.', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1974&auto=format&fit=crop' },
            { id: 'pho-6', name: 'Pho Chay', price: 18, desc: 'Vegetarian noodle soup with tofu, vegetables, and vegetable broth.', image: 'https://images.unsplash.com/photo-1547496502-ffa22d388946?q=80&w=1974&auto=format&fit=crop' },
            { id: 'pho-7', name: 'Pho Tai Lan', price: 22, desc: 'Hanoi style noodle soup with wok-seared garlic beef.', image: 'https://images.unsplash.com/photo-1634818462211-2092cc77a83d?q=80&w=1974&auto=format&fit=crop' },
            { id: 'pho-8', name: 'Pho Hai San', price: 26, desc: 'Seafood noodle soup with shrimp, calamari, and fish balls.', image: 'https://images.unsplash.com/photo-1563861541300-366567154fb0?q=80&w=1974&auto=format&fit=crop' },
            { id: 'pho-9', name: 'Pho Suon Bo', price: 28, desc: 'Short rib beef noodle soup with a giant bone-in short rib.', image: 'https://images.unsplash.com/photo-1585250462002-a1b73063f663?q=80&w=1974&auto=format&fit=crop' },
            { id: 'pho-10', name: 'Pho Tron', price: 21, desc: 'Dry mixed pho noodles with beef, peanuts, herbs, and special sauce.', image: 'https://images.unsplash.com/photo-1617622141675-d227cce57f61?q=80&w=2084&auto=format&fit=crop' },
        ]
    },
    {
        id: 'starters',
        name: "Starters & Rolls",
        items: [
            { id: 'st-1', name: 'Goi Cuon', price: 12, desc: 'Fresh spring rolls with shrimp, pork, herbs, and vermicelli.', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop' },
            { id: 'st-2', name: 'Cha Gio', price: 14, desc: 'Fried spring rolls with minced pork, wood ear mushrooms, and glass noodles.', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1971&auto=format&fit=crop' },
            { id: 'st-3', name: 'Banh Xeo', price: 18, desc: 'Vietnamese sizzling pancake with shrimp, pork, and bean sprouts.', image: 'https://images.unsplash.com/photo-1605658607672-ec1047db3782?q=80&w=2072&auto=format&fit=crop' },
            { id: 'st-4', name: 'Nom Hoa Chuoi', price: 15, desc: 'Banana flower salad with chicken and roasted peanuts.', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=2070&auto=format&fit=crop' },
            { id: 'st-5', name: 'Canh Ga Chien Nuoc Mam', price: 16, desc: 'Fried chicken wings glazed in fish sauce.', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=2070&auto=format&fit=crop' },
            { id: 'st-6', name: 'Bo Bia', price: 12, desc: 'Fresh rolls with jicama, egg, sausage, and dried shrimp.', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop' },
        ]
    },
    {
        id: 'grill',
        name: "Grill & BBQ",
        items: [
            { id: 'grill-1', name: 'Bun Cha', price: 22, desc: 'Grilled pork patties and pork belly served with vermicelli and herbs.', image: 'https://images.unsplash.com/photo-1503764654157-72d979d9af2f?q=80&w=2074&auto=format&fit=crop' },
            { id: 'grill-2', name: 'Com Tam Suon', price: 21, desc: 'Broken rice with grilled pork chop, egg meatloaf, and shredded pork skin.', image: 'https://images.unsplash.com/photo-1599321955726-e04842d99462?q=80&w=2070&auto=format&fit=crop' },
            { id: 'grill-3', name: 'Bo La Lot', price: 18, desc: 'Grilled beef wrapped in betel leaves.', image: 'https://images.unsplash.com/photo-1688643806140-1a738a927c3a?q=80&w=2070&auto=format&fit=crop' },
            { id: 'grill-4', name: 'Nem Nuong', price: 19, desc: 'Grilled pork sausage skewers served with rice paper.', image: 'https://images.unsplash.com/photo-1529193591184-b1d580690dd0?q=80&w=2000&auto=format&fit=crop' },
            { id: 'grill-5', name: 'Ga Nuong La Chanh', price: 20, desc: 'Grilled chicken with kaffir lime leaves.', image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=1974&auto=format&fit=crop' },
            { id: 'grill-6', name: 'Suon Nuong', price: 23, desc: 'Grilled honey glazed pork ribs.', image: 'https://images.unsplash.com/photo-1544025162-d76690b67f61?q=80&w=2070&auto=format&fit=crop' },
            { id: 'grill-7', name: 'Muc Nuong Sa Te', price: 25, desc: 'Grilled spicy squid with satay sauce.', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=2000&auto=format&fit=crop' },
            { id: 'grill-8', name: 'Tom Nuong Muoi Ot', price: 28, desc: 'Grilled shrimp with chili salt.', image: 'https://images.unsplash.com/photo-1606850897176-081469e3d062?q=80&w=2070&auto=format&fit=crop' },
            { id: 'grill-9', name: 'Ca Nuong Da Gion', price: 32, desc: 'Grilled whole fish with crispy skin.', image: 'https://images.unsplash.com/photo-1534939561126-855f8665b53e?q=80&w=2070&auto=format&fit=crop' },
        ]
    },
    {
        id: 'dessert',
        name: "Desserts",
        items: [
            { id: 'des-1', name: 'Che Ba Mau', price: 10, desc: 'Three color dessert with beans, jelly, and coconut milk.', image: '/images/menu-listing/menu-grid/Tiramisu.png' },
            { id: 'des-2', name: 'Banh Flan', price: 8, desc: 'Vietnamese caramel custard pudding.', image: '/images/menu-listing/menu-grid/Tiramisu.png' },
            { id: 'des-3', name: 'Che Troi Nuoc', price: 9, desc: 'Glutinous rice balls in ginger syrup.', image: '/images/menu-listing/menu-grid/Tiramisu.png' },
            { id: 'des-4', name: 'Kem Dua', price: 12, desc: 'Coconut ice cream served in a coconut shell.', image: '/images/menu-listing/menu-grid/Tiramisu.png' },
        ]
    },
    {
        id: 'drinks',
        name: "Wines & Drinks",
        items: [
            { id: 'dr-1', name: 'Ca Phe Sua Da', price: 6, desc: 'Vietnamese iced coffee with condensed milk.', image: '/images/menu-listing/menu-grid/Krug Clos d\'Ambonnay Champagne.png' },
            { id: 'dr-2', name: 'Tra Da Chanh', price: 5, desc: 'Iced tea with lime and sugar.', image: '/images/menu-listing/menu-grid/Krug Clos d\'Ambonnay Champagne.png' },
            { id: 'dr-3', name: 'Nuoc Mia', price: 6, desc: 'Freshly squeezed sugarcane juice.', image: '/images/menu-listing/menu-grid/Krug Clos d\'Ambonnay Champagne.png' },
            { id: 'dr-4', name: 'Krug Champagne', price: 350, desc: 'Bottle. Premier Grand Cru Classé.', image: '/images/menu-listing/menu-grid/Krug Clos d\'Ambonnay Champagne.png' },
            { id: 'dr-5', name: 'Vang Da Lat', price: 45, desc: 'Bottle. Premium Dalat Red Wine.', image: '/images/menu-listing/menu-grid/Krug Clos d\'Ambonnay Champagne.png' },
            { id: 'dr-6', name: 'Bia Saigon', price: 8, desc: 'Saigon Beer Export.', image: '/images/menu-listing/menu-grid/Krug Clos d\'Ambonnay Champagne.png' },
        ]
    }
];
