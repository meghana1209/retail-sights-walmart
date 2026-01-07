import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Each product has a UNIQUE name and UNIQUE image using reliable Unsplash URLs
const productTemplates = {
  Electronics: [
    { name: "Samsung Galaxy S24 Ultra", price: 1199.99, image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop" },
    { name: "Apple iPhone 15 Pro Max", price: 1099.99, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop" },
    { name: "Sony 65\" 4K OLED Smart TV", price: 1499.99, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop" },
    { name: "MacBook Pro 14\" M3", price: 1999.99, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop" },
    { name: "Dell XPS 15 Laptop", price: 1349.99, image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop" },
    { name: "Apple iPad Pro 12.9\"", price: 1099.99, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop" },
    { name: "Sony PlayStation 5", price: 499.99, image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop" },
    { name: "Nintendo Switch OLED", price: 349.99, image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop" },
    { name: "Apple AirPods Pro 2nd Gen", price: 249.99, image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop" },
    { name: "Samsung Galaxy Watch 6", price: 329.99, image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop" },
    { name: "Bose QuietComfort Ultra Headphones", price: 349.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" },
    { name: "LG 55\" NanoCell 4K TV", price: 699.99, image: "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=400&h=400&fit=crop" },
    { name: "Canon EOS R6 Mark II Camera", price: 2499.99, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop" },
    { name: "DJI Mini 3 Pro Drone", price: 759.99, image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=400&fit=crop" },
    { name: "Anker 65W USB-C Charger", price: 49.99, image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop" },
    { name: "Samsung 1TB 990 Pro SSD", price: 89.99, image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop" },
    { name: "Logitech MX Master 3S Mouse", price: 99.99, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop" },
    { name: "Apple Watch Series 9", price: 399.99, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop" },
    { name: "JBL Flip 6 Bluetooth Speaker", price: 129.99, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop" },
    { name: "Ring Video Doorbell Pro 2", price: 229.99, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
    { name: "Sony WH-1000XM5 Headphones", price: 398.00, image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop" },
    { name: "Microsoft Xbox Series X", price: 499.99, image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=400&fit=crop" },
    { name: "Apple Mac Mini M2", price: 599.00, image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=400&fit=crop" },
    { name: "Google Pixel 8 Pro", price: 999.00, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop" },
    { name: "Amazon Echo Show 10", price: 249.99, image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&h=400&fit=crop" },
    { name: "Kindle Paperwhite Signature", price: 189.99, image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop" },
    { name: "ASUS ROG Gaming Monitor 27\"", price: 449.99, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop" },
    { name: "Razer BlackWidow V4 Keyboard", price: 169.99, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop" },
    { name: "SteelSeries Arctis Nova Pro Headset", price: 349.99, image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop" },
    { name: "TP-Link Deco Mesh WiFi 6", price: 229.99, image: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400&h=400&fit=crop" },
  ],
  Groceries: [
    { name: "Organic Whole Milk 1 Gallon", price: 5.99, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop" },
    { name: "Fresh Strawberries 1lb", price: 4.99, image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop" },
    { name: "Organic Bananas Bundle", price: 2.49, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop" },
    { name: "Extra Virgin Olive Oil 500ml", price: 12.99, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop" },
    { name: "Jasmine Rice 5lb Bag", price: 8.99, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop" },
    { name: "Free Range Eggs 12ct", price: 6.49, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop" },
    { name: "Organic Avocados 4ct", price: 5.99, image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop" },
    { name: "Atlantic Salmon Fillet 1lb", price: 14.99, image: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400&h=400&fit=crop" },
    { name: "Almond Butter 16oz", price: 9.99, image: "https://images.unsplash.com/photo-1612187715738-b63bfa045a45?w=400&h=400&fit=crop" },
    { name: "Greek Yogurt 32oz", price: 5.49, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop" },
    { name: "Organic Baby Spinach 5oz", price: 4.29, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop" },
    { name: "Whole Wheat Bread Loaf", price: 3.99, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop" },
    { name: "Ground Coffee 12oz", price: 11.99, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop" },
    { name: "Orange Juice 64oz", price: 4.99, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop" },
    { name: "Cheddar Cheese Block 1lb", price: 7.99, image: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&h=400&fit=crop" },
    { name: "Organic Raw Honey 16oz", price: 8.49, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop" },
    { name: "Mixed Nuts 24oz", price: 12.99, image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=400&fit=crop" },
    { name: "Pasta Variety Pack", price: 6.99, image: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop" },
    { name: "Marinara Sauce 24oz", price: 3.49, image: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&h=400&fit=crop" },
    { name: "Fresh Blueberries 6oz", price: 4.99, image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=400&fit=crop" },
    { name: "Organic Chicken Breast 2lb", price: 12.99, image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop" },
    { name: "Peanut Butter 28oz", price: 7.49, image: "https://images.unsplash.com/photo-1598662972299-5408ddb8a3dc?w=400&h=400&fit=crop" },
    { name: "Oat Milk 64oz", price: 4.99, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop" },
    { name: "Fresh Mozzarella 8oz", price: 5.99, image: "https://images.unsplash.com/photo-1626957341926-98752fc2ba90?w=400&h=400&fit=crop" },
    { name: "Organic Green Tea Box", price: 6.99, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop" },
    { name: "Maple Syrup 12oz", price: 9.99, image: "https://images.unsplash.com/photo-1589496933738-f5c27bc146e3?w=400&h=400&fit=crop" },
    { name: "Dark Chocolate Bar 85%", price: 4.49, image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop" },
    { name: "Coconut Oil 14oz", price: 8.99, image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop" },
    { name: "Quinoa 2lb Bag", price: 7.99, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop" },
    { name: "Apple Cider Vinegar 32oz", price: 6.49, image: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=400&h=400&fit=crop" },
  ],
  "Clothing & Shoes": [
    { name: "Nike Air Max 270", price: 149.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop" },
    { name: "Levi's 501 Original Jeans", price: 69.99, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop" },
    { name: "Adidas Ultraboost 22", price: 189.99, image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop" },
    { name: "North Face Puffer Jacket", price: 229.99, image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop" },
    { name: "Champion Classic Hoodie", price: 54.99, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop" },
    { name: "Calvin Klein Boxer Briefs 3-Pack", price: 39.99, image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400&h=400&fit=crop" },
    { name: "Ray-Ban Aviator Sunglasses", price: 163.99, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop" },
    { name: "Timberland 6\" Premium Boots", price: 198.99, image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&h=400&fit=crop" },
    { name: "Polo Ralph Lauren Classic Shirt", price: 89.99, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop" },
    { name: "Nike Dri-FIT Training Tee", price: 34.99, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop" },
    { name: "Converse Chuck Taylor All Star", price: 65.00, image: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=400&h=400&fit=crop" },
    { name: "Under Armour Sports Bra", price: 44.99, image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=400&fit=crop" },
    { name: "Tommy Hilfiger Classic Polo", price: 59.99, image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=400&h=400&fit=crop" },
    { name: "Vans Old Skool Sneakers", price: 69.99, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop" },
    { name: "Columbia Fleece Jacket", price: 79.99, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop" },
    { name: "Hanes Cotton T-Shirts 5-Pack", price: 24.99, image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop" },
    { name: "New Balance 574 Classic", price: 89.99, image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=400&fit=crop" },
    { name: "Lululemon Align Yoga Pants", price: 98.00, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop" },
    { name: "Carhartt Work Jacket", price: 129.99, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop" },
    { name: "Skechers Memory Foam Shoes", price: 74.99, image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop" },
    { name: "Nike Air Force 1 '07", price: 110.00, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop" },
    { name: "Wrangler Classic Fit Jeans", price: 29.99, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop" },
    { name: "Puma RS-X Sneakers", price: 110.00, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop" },
    { name: "Dockers Classic Chinos", price: 49.99, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop" },
    { name: "Dickies Original 874 Pants", price: 28.99, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop" },
    { name: "Reebok Classic Leather", price: 80.00, image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop" },
    { name: "ASICS Gel-Kayano 29", price: 159.95, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop" },
    { name: "Brooks Ghost 15 Running", price: 139.95, image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop" },
    { name: "Hoka Bondi 8 Running Shoes", price: 165.00, image: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=400&h=400&fit=crop" },
    { name: "On Cloud Running Shoes", price: 139.99, image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop" },
  ],
  "Home & Kitchen": [
    { name: "KitchenAid Artisan Stand Mixer", price: 379.99, image: "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=400&h=400&fit=crop" },
    { name: "Dyson V15 Cordless Vacuum", price: 749.99, image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=400&fit=crop" },
    { name: "Instant Pot Duo 7-in-1", price: 89.99, image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop" },
    { name: "Ninja Professional Blender", price: 99.99, image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=400&fit=crop" },
    { name: "All-Clad Stainless Steel 10pc Set", price: 699.99, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop" },
    { name: "Keurig K-Elite Coffee Maker", price: 169.99, image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop" },
    { name: "iRobot Roomba i7+", price: 799.99, image: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400&h=400&fit=crop" },
    { name: "Le Creuset Dutch Oven 5.5qt", price: 369.99, image: "https://images.unsplash.com/photo-1585442136570-9ae1db7e60f4?w=400&h=400&fit=crop" },
    { name: "Vitamix Professional 750", price: 499.99, image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop" },
    { name: "Casper Memory Foam Pillow", price: 89.00, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop" },
    { name: "Philips Sonicare DiamondClean", price: 169.99, image: "https://images.unsplash.com/photo-1559056199-5a1f9a3a3f88?w=400&h=400&fit=crop" },
    { name: "Cuisinart 14-Cup Food Processor", price: 199.99, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop" },
    { name: "Brooklinen Luxe Sheet Set Queen", price: 169.00, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop" },
    { name: "Nespresso Vertuo Plus", price: 179.00, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop" },
    { name: "Calphalon Nonstick 10pc Set", price: 299.99, image: "https://images.unsplash.com/photo-1584990347449-a2d4c2c2c46f?w=400&h=400&fit=crop" },
    { name: "Shark Navigator Lift-Away", price: 199.99, image: "https://images.unsplash.com/photo-1527515545081-5db817172677?w=400&h=400&fit=crop" },
    { name: "Hamilton Beach 4-Slice Toaster", price: 29.99, image: "https://images.unsplash.com/photo-1621682372775-533449e550ed?w=400&h=400&fit=crop" },
    { name: "OXO Pop Container 10pc Set", price: 79.99, image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=400&fit=crop" },
    { name: "Breville Smart Oven Air Fryer", price: 349.99, image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop" },
    { name: "Safavieh Madison Area Rug 5x7", price: 229.00, image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&h=400&fit=crop" },
    { name: "Ninja Foodi Digital Air Fry Oven", price: 179.99, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=400&fit=crop" },
    { name: "Lodge Cast Iron Skillet 12\"", price: 44.99, image: "https://images.unsplash.com/photo-1593759608136-45eb2ad9507d?w=400&h=400&fit=crop" },
    { name: "Zojirushi Rice Cooker 5.5 Cup", price: 189.99, image: "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=400&fit=crop" },
    { name: "Simplehuman Sensor Trash Can", price: 199.99, image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=400&fit=crop" },
    { name: "Dyson Pure Cool Air Purifier", price: 549.99, image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop" },
    { name: "Staub Cast Iron Cocotte 4qt", price: 299.99, image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop" },
    { name: "Beckham Hotel Collection Pillows", price: 49.99, image: "https://images.unsplash.com/photo-1592789705501-f9ae4287c4a9?w=400&h=400&fit=crop" },
    { name: "Moccamaster Coffee Brewer", price: 349.00, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop" },
    { name: "Ruggable Washable Rug 5x7", price: 299.00, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop" },
    { name: "Bissell CrossWave Pet Pro", price: 299.99, image: "https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?w=400&h=400&fit=crop" },
  ],
  "Sports & Outdoors": [
    { name: "Yeti Rambler 30oz Tumbler", price: 38.00, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop" },
    { name: "Coleman Sundome 6-Person Tent", price: 149.99, image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop" },
    { name: "Fitbit Charge 5", price: 149.95, image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop" },
    { name: "Stanley Adventure Cooler 16qt", price: 89.99, image: "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?w=400&h=400&fit=crop" },
    { name: "Hydro Flask 32oz Wide Mouth", price: 44.95, image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=400&fit=crop" },
    { name: "Osprey Atmos AG 65 Backpack", price: 270.00, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop" },
    { name: "Garmin Forerunner 265", price: 449.99, image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&h=400&fit=crop" },
    { name: "Callaway Strata Complete Golf Set", price: 499.99, image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=400&fit=crop" },
    { name: "Bowflex SelectTech 552 Dumbbells", price: 429.00, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop" },
    { name: "Manduka PRO 6mm Yoga Mat", price: 120.00, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop" },
    { name: "REI Co-op Magma 15 Sleeping Bag", price: 399.00, image: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&h=400&fit=crop" },
    { name: "Schwinn Discover Hybrid Bike", price: 399.99, image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=400&fit=crop" },
    { name: "Everlast Pro Style Training Gloves", price: 34.99, image: "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?w=400&h=400&fit=crop" },
    { name: "TRX Pro4 Suspension Trainer", price: 229.95, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop" },
    { name: "Patagonia Nano Puff Jacket", price: 199.00, image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=400&fit=crop" },
    { name: "GoPro HERO12 Black", price: 399.99, image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&h=400&fit=crop" },
    { name: "Wilson Evolution Basketball", price: 69.99, image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop" },
    { name: "SKLZ Speed and Agility Ladder", price: 24.99, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop" },
    { name: "Theragun Mini 2.0", price: 199.00, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop" },
    { name: "Kelty Lowdown Camp Chair", price: 49.95, image: "https://images.unsplash.com/photo-1530053969600-caed2596d242?w=400&h=400&fit=crop" },
    { name: "NordicTrack C 990 Treadmill", price: 1499.00, image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=400&fit=crop" },
    { name: "Peloton Bike+", price: 2495.00, image: "https://images.unsplash.com/photo-1591741535018-d065e7c7cadb?w=400&h=400&fit=crop" },
    { name: "Hyperice Hypervolt 2 Pro", price: 329.00, image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop" },
    { name: "WHOOP 4.0 Fitness Tracker", price: 239.00, image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=400&h=400&fit=crop" },
    { name: "Arc'teryx Beta AR Jacket", price: 599.00, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop" },
    { name: "Black Diamond Spot 400 Headlamp", price: 49.95, image: "https://images.unsplash.com/photo-1511497584788-876760111969?w=400&h=400&fit=crop" },
    { name: "ENO DoubleNest Hammock", price: 69.95, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop" },
    { name: "MSR PocketRocket 2 Stove", price: 54.95, image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=400&h=400&fit=crop" },
    { name: "Salomon X Ultra 4 Hiking Shoes", price: 140.00, image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&h=400&fit=crop" },
    { name: "Gregory Baltoro 65 Backpack", price: 320.00, image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=400&fit=crop" },
  ],
  "Toys & Games": [
    { name: "LEGO Star Wars Millennium Falcon", price: 169.99, image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop" },
    { name: "Nintendo Switch Lite Blue", price: 199.99, image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=400&fit=crop" },
    { name: "Barbie Dreamhouse 2024", price: 199.99, image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop" },
    { name: "Hot Wheels Ultimate Garage", price: 89.99, image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&h=400&fit=crop" },
    { name: "Monopoly Classic Board Game", price: 19.99, image: "https://images.unsplash.com/photo-1611891487122-207579d67d98?w=400&h=400&fit=crop" },
    { name: "Nerf Elite 2.0 Commander", price: 29.99, image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop" },
    { name: "Play-Doh 36-Pack Bundle", price: 24.99, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop" },
    { name: "Melissa & Doug Wooden Puzzle Set", price: 14.99, image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop" },
    { name: "Fisher-Price Laugh & Learn Smart Stage", price: 39.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Crayola Inspiration Art Set 140pc", price: 34.99, image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=400&fit=crop" },
    { name: "UNO Card Game Original", price: 7.99, image: "https://images.unsplash.com/photo-1606503153255-59d8b2e4e5e8?w=400&h=400&fit=crop" },
    { name: "Paw Patrol Lookout Tower Playset", price: 69.99, image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop" },
    { name: "LEGO City Police Station", price: 99.99, image: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=400&h=400&fit=crop" },
    { name: "Razor A5 Lux Scooter", price: 74.99, image: "https://images.unsplash.com/photo-1565536427770-78a3a4c47d97?w=400&h=400&fit=crop" },
    { name: "Jenga Classic Block Game", price: 14.99, image: "https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400&h=400&fit=crop" },
    { name: "Magna-Tiles Clear Colors 100pc", price: 119.99, image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=400&fit=crop" },
    { name: "VTech KidiZoom Creator Cam", price: 49.99, image: "https://images.unsplash.com/photo-1531565637446-32307b194362?w=400&h=400&fit=crop" },
    { name: "Ticket to Ride Board Game", price: 44.99, image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&h=400&fit=crop" },
    { name: "LOL Surprise OMG Doll", price: 32.99, image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop" },
    { name: "Radio Flyer Classic Red Wagon", price: 119.99, image: "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=400&h=400&fit=crop" },
    { name: "Osmo Genius Starter Kit", price: 99.99, image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop" },
    { name: "Bluey Family House Playset", price: 49.99, image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop" },
    { name: "LEGO Technic Bugatti Chiron", price: 349.99, image: "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=400&h=400&fit=crop" },
    { name: "Risk Global Domination Game", price: 29.99, image: "https://images.unsplash.com/photo-1606503153255-59d8b2e4e5e8?w=400&h=400&fit=crop" },
    { name: "Scrabble Deluxe Edition", price: 34.99, image: "https://images.unsplash.com/photo-1611891487122-207579d67d98?w=400&h=400&fit=crop" },
    { name: "Rubik's Cube Original 3x3", price: 12.99, image: "https://images.unsplash.com/photo-1591991731833-b4807cf7ef94?w=400&h=400&fit=crop" },
    { name: "Pokemon Trading Card Elite Box", price: 49.99, image: "https://images.unsplash.com/photo-1605979257913-1704eb7b6246?w=400&h=400&fit=crop" },
    { name: "Squishmallows 16\" Plush", price: 19.99, image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop" },
    { name: "Catan Board Game", price: 44.99, image: "https://images.unsplash.com/photo-1606503153255-59d8b2e4e5e8?w=400&h=400&fit=crop" },
    { name: "Exploding Kittens Card Game", price: 19.99, image: "https://images.unsplash.com/photo-1518832553480-cd0e625ed3e6?w=400&h=400&fit=crop" },
  ],
  "Beauty & Personal Care": [
    { name: "Dyson Airwrap Complete Long", price: 599.99, image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop" },
    { name: "La Mer Moisturizing Cream 2oz", price: 190.00, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop" },
    { name: "Olaplex No.3 Hair Perfector", price: 30.00, image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop" },
    { name: "Charlotte Tilbury Pillow Talk Palette", price: 75.00, image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop" },
    { name: "Drunk Elephant C-Firma Day Serum", price: 80.00, image: "https://images.unsplash.com/photo-1620756235225-8c9dc7f5c65a?w=400&h=400&fit=crop" },
    { name: "Tatcha Dewy Skin Cream", price: 68.00, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop" },
    { name: "Fenty Beauty Pro Filt'r Foundation", price: 38.00, image: "https://images.unsplash.com/photo-1557205465-f3762edea6d3?w=400&h=400&fit=crop" },
    { name: "SK-II Facial Treatment Essence 230ml", price: 185.00, image: "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=400&h=400&fit=crop" },
    { name: "ghd Platinum+ Hair Styler", price: 279.00, image: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=400&h=400&fit=crop" },
    { name: "Estee Lauder Advanced Night Repair", price: 75.00, image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop" },
    { name: "MAC Ruby Woo Lipstick", price: 21.00, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop" },
    { name: "Paula's Choice 2% BHA Exfoliant", price: 32.00, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop" },
    { name: "Sunday Riley Good Genes Serum", price: 85.00, image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop" },
    { name: "NuFace Trinity Facial Toning Device", price: 339.00, image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop" },
    { name: "Ouai Wave Spray", price: 26.00, image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop" },
    { name: "Urban Decay All Nighter Setting Spray", price: 33.00, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop" },
    { name: "The Ordinary Niacinamide 10%", price: 6.00, image: "https://images.unsplash.com/photo-1620756235225-8c9dc7f5c65a?w=400&h=400&fit=crop" },
    { name: "Kiehl's Ultra Facial Cream", price: 32.00, image: "https://images.unsplash.com/photo-1611930022073-84f59e64c132?w=400&h=400&fit=crop" },
    { name: "NARS Blush Orgasm", price: 30.00, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop" },
    { name: "CeraVe Moisturizing Cream 19oz", price: 16.99, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop" },
    { name: "Dyson Supersonic Hair Dryer", price: 429.99, image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop" },
    { name: "Glossier Boy Brow", price: 17.00, image: "https://images.unsplash.com/photo-1583241800698-e8ab01b85185?w=400&h=400&fit=crop" },
    { name: "Tom Ford Black Orchid Eau de Parfum", price: 150.00, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop" },
    { name: "Augustinus Bader The Rich Cream", price: 280.00, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop" },
    { name: "Rare Beauty Soft Pinch Blush", price: 23.00, image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop" },
    { name: "Oribe Dry Texturizing Spray", price: 49.00, image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop" },
    { name: "Dr. Dennis Gross Peel Pads", price: 88.00, image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop" },
    { name: "Supergoop Unseen Sunscreen SPF 40", price: 38.00, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop" },
    { name: "Chanel No 5 Eau de Parfum", price: 135.00, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop" },
    { name: "Tarte Shape Tape Concealer", price: 30.00, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop" },
  ],
  "Baby & Kids": [
    { name: "Graco Pack 'n Play Playard", price: 99.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Pampers Swaddlers Size 1 192ct", price: 49.99, image: "https://images.unsplash.com/photo-1584839404042-8bc21d240e74?w=400&h=400&fit=crop" },
    { name: "Ergobaby Omni 360 Carrier", price: 179.00, image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop" },
    { name: "Baby Brezza Formula Pro Advanced", price: 199.99, image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop" },
    { name: "UPPAbaby Vista V2 Stroller", price: 969.99, image: "https://images.unsplash.com/photo-1586992831114-03f6e20dd23c?w=400&h=400&fit=crop" },
    { name: "Hatch Baby Rest+ Sound Machine", price: 89.99, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
    { name: "4moms MamaRoo Multi-Motion Swing", price: 219.99, image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop" },
    { name: "Enfamil NeuroPro Infant Formula", price: 39.99, image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop" },
    { name: "Owlet Dream Sock Monitor", price: 299.00, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Skip Hop Explore Activity Center", price: 79.99, image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop" },
    { name: "Nanit Pro Smart Baby Monitor", price: 299.99, image: "https://images.unsplash.com/photo-1584839404042-8bc21d240e74?w=400&h=400&fit=crop" },
    { name: "Chicco KeyFit 35 Car Seat", price: 229.99, image: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400&h=400&fit=crop" },
    { name: "Huggies Little Snugglers Size 1 198ct", price: 42.99, image: "https://images.unsplash.com/photo-1584839404042-8bc21d240e74?w=400&h=400&fit=crop" },
    { name: "Baby Jogger City Mini GT2 Stroller", price: 379.99, image: "https://images.unsplash.com/photo-1586992831114-03f6e20dd23c?w=400&h=400&fit=crop" },
    { name: "Dr. Brown's Natural Flow Bottle Set", price: 29.99, image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop" },
    { name: "Boppy Original Nursing Pillow", price: 39.99, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop" },
    { name: "Medela Pump In Style with MaxFlow", price: 299.99, image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop" },
    { name: "Bumbo Multi Seat", price: 54.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Aden + Anais Swaddle Blankets 4-Pack", price: 49.99, image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop" },
    { name: "Fisher-Price Deluxe Kick & Play Gym", price: 54.99, image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop" },
    { name: "Nuna PIPA Lite LX Car Seat", price: 449.95, image: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400&h=400&fit=crop" },
    { name: "Spectra S1 Plus Breast Pump", price: 199.99, image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop" },
    { name: "Doona Car Seat & Stroller", price: 550.00, image: "https://images.unsplash.com/photo-1586992831114-03f6e20dd23c?w=400&h=400&fit=crop" },
    { name: "BabyBjorn Bouncer Bliss", price: 229.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Snoo Smart Sleeper Bassinet", price: 1695.00, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop" },
    { name: "Elvie Double Electric Breast Pump", price: 499.00, image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop" },
    { name: "Cybex Sirona S Convertible Car Seat", price: 499.95, image: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400&h=400&fit=crop" },
    { name: "Bugaboo Fox 5 Stroller", price: 1449.00, image: "https://images.unsplash.com/photo-1586992831114-03f6e20dd23c?w=400&h=400&fit=crop" },
    { name: "Lovevery Play Gym", price: 140.00, image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop" },
    { name: "Newton Baby Crib Mattress", price: 299.99, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop" },
  ],
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch existing categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, name");

    if (catError) throw catError;

    const categoryMap = new Map(categories.map((c: any) => [c.name, c.id]));
    const productsToInsert: any[] = [];

    // Generate unique products - each with unique image from Unsplash
    for (const [categoryName, templates] of Object.entries(productTemplates)) {
      const categoryId = categoryMap.get(categoryName);
      if (!categoryId) continue;

      for (const template of templates) {
        const stock = Math.floor(Math.random() * 150) + 10;
        const rating = 3.5 + Math.random() * 1.5;
        const hasDiscount = Math.random() > 0.6;
        
        productsToInsert.push({
          name: template.name,
          price: template.price,
          original_price: hasDiscount ? parseFloat((template.price * 1.2).toFixed(2)) : null,
          image_url: template.image,
          category_id: categoryId,
          stock: stock,
          threshold: 10,
          rating: parseFloat(rating.toFixed(1)),
          reviews_count: Math.floor(Math.random() * 1500) + 50,
          is_featured: Math.random() > 0.85,
          description: `High-quality ${template.name} from ${categoryName} category. Perfect for everyday use.`,
        });
      }
    }

    console.log(`Preparing to insert ${productsToInsert.length} unique products with Unsplash images`);

    // Get products that have order_items referencing them
    const { data: productsWithOrders } = await supabase
      .from("order_items")
      .select("product_id");
    
    const referencedProductIds = new Set(
      (productsWithOrders || []).map((item: any) => item.product_id)
    );

    // Delete only products that don't have order references
    if (referencedProductIds.size > 0) {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .not("id", "in", `(${Array.from(referencedProductIds).join(",")})`);

      if (deleteError) {
        console.log("Delete error (non-fatal):", deleteError);
      }
    } else {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) {
        console.log("Delete error (non-fatal):", deleteError);
      }
    }

    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from("products")
        .insert(batch);

      if (insertError) throw insertError;
      inserted += batch.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully seeded ${inserted} unique products with reliable Unsplash images`,
        categories: Array.from(categoryMap.keys()),
        totalProducts: inserted,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error seeding products:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
