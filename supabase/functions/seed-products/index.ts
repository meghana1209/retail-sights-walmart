import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product templates with real product image URLs
const productTemplates = {
  Electronics: [
    { name: "Samsung Galaxy S24 Ultra 256GB", price: 1199.99, image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400" },
    { name: "Apple iPhone 15 Pro Max", price: 1099.99, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400" },
    { name: "Sony 65\" 4K OLED Smart TV", price: 1499.99, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400" },
    { name: "MacBook Pro 14\" M3 Pro", price: 1999.99, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400" },
    { name: "Dell XPS 15 Laptop", price: 1349.99, image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400" },
    { name: "Apple iPad Pro 12.9\"", price: 1099.99, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400" },
    { name: "Sony PlayStation 5", price: 499.99, image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400" },
    { name: "Nintendo Switch OLED", price: 349.99, image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400" },
    { name: "AirPods Pro 2nd Gen", price: 249.99, image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400" },
    { name: "Samsung Galaxy Watch 6", price: 329.99, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
    { name: "Bose QuietComfort Headphones", price: 349.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { name: "LG 55\" NanoCell TV", price: 699.99, image: "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=400" },
    { name: "Canon EOS R6 Camera", price: 2499.99, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400" },
    { name: "DJI Mini 3 Pro Drone", price: 759.99, image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400" },
    { name: "Anker 65W USB-C Charger", price: 49.99, image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400" },
    { name: "Samsung 1TB SSD", price: 89.99, image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400" },
    { name: "Logitech MX Master 3S Mouse", price: 99.99, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400" },
    { name: "Apple Watch Series 9", price: 399.99, image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400" },
    { name: "JBL Flip 6 Speaker", price: 129.99, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" },
    { name: "Ring Video Doorbell Pro", price: 229.99, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400" },
  ],
  Groceries: [
    { name: "Organic Whole Milk 1 Gallon", price: 5.99, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { name: "Fresh Strawberries 1lb", price: 4.99, image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400" },
    { name: "Organic Bananas Bundle", price: 2.49, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400" },
    { name: "Premium Olive Oil 500ml", price: 12.99, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400" },
    { name: "Jasmine Rice 5lb Bag", price: 8.99, image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400" },
    { name: "Free Range Eggs 12ct", price: 6.49, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400" },
    { name: "Organic Avocados 4ct", price: 5.99, image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400" },
    { name: "Fresh Atlantic Salmon 1lb", price: 14.99, image: "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400" },
    { name: "Almond Butter 16oz", price: 9.99, image: "https://images.unsplash.com/photo-1612187376442-b9f18bd54c67?w=400" },
    { name: "Greek Yogurt 32oz", price: 5.49, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400" },
    { name: "Organic Baby Spinach 5oz", price: 4.29, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400" },
    { name: "Whole Wheat Bread Loaf", price: 3.99, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
    { name: "Fresh Ground Coffee 12oz", price: 11.99, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400" },
    { name: "Orange Juice 64oz", price: 4.99, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400" },
    { name: "Cheddar Cheese Block 1lb", price: 7.99, image: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400" },
    { name: "Organic Honey 16oz", price: 8.49, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400" },
    { name: "Mixed Nuts 24oz", price: 12.99, image: "https://images.unsplash.com/photo-1536591375623-e3c6f50d0c46?w=400" },
    { name: "Pasta Variety Pack 5lb", price: 6.99, image: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400" },
    { name: "Tomato Sauce 24oz", price: 3.49, image: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400" },
    { name: "Fresh Blueberries 6oz", price: 4.99, image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400" },
  ],
  "Clothing & Shoes": [
    { name: "Nike Air Max 270 Running Shoes", price: 149.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { name: "Levi's 501 Original Fit Jeans", price: 69.99, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400" },
    { name: "Adidas Ultraboost 22", price: 189.99, image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400" },
    { name: "North Face Puffer Jacket", price: 229.99, image: "https://images.unsplash.com/photo-1544923246-77307dd628b5?w=400" },
    { name: "Champion Hoodie Classic", price: 54.99, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400" },
    { name: "Calvin Klein Underwear 3-Pack", price: 39.99, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400" },
    { name: "Ray-Ban Aviator Sunglasses", price: 163.99, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400" },
    { name: "Timberland 6\" Premium Boots", price: 198.99, image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400" },
    { name: "Polo Ralph Lauren Shirt", price: 89.99, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400" },
    { name: "Nike Dri-FIT Training Tee", price: 34.99, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" },
    { name: "Converse Chuck Taylor All Star", price: 65.00, image: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=400" },
    { name: "Under Armour Sports Bra", price: 44.99, image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400" },
    { name: "Tommy Hilfiger Polo", price: 59.99, image: "https://images.unsplash.com/photo-1625910513413-5fc4e5e64b36?w=400" },
    { name: "Vans Old Skool Sneakers", price: 69.99, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400" },
    { name: "Columbia Fleece Jacket", price: 79.99, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400" },
    { name: "Hanes Cotton T-Shirt 5-Pack", price: 24.99, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400" },
    { name: "New Balance 574 Classic", price: 89.99, image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400" },
    { name: "Lululemon Yoga Pants", price: 98.00, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400" },
    { name: "Carhartt Work Jacket", price: 129.99, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
    { name: "Skechers Memory Foam Shoes", price: 74.99, image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400" },
  ],
  "Home & Kitchen": [
    { name: "KitchenAid Stand Mixer", price: 379.99, image: "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=400" },
    { name: "Dyson V15 Cordless Vacuum", price: 749.99, image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400" },
    { name: "Instant Pot Duo 7-in-1", price: 89.99, image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400" },
    { name: "Ninja Blender Pro", price: 99.99, image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400" },
    { name: "All-Clad Stainless Set", price: 699.99, image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400" },
    { name: "Keurig K-Elite Coffee Maker", price: 169.99, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400" },
    { name: "iRobot Roomba i7+", price: 799.99, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400" },
    { name: "Le Creuset Dutch Oven", price: 369.99, image: "https://images.unsplash.com/photo-1585442027404-4b15e8e2ab66?w=400" },
    { name: "Vitamix Professional Blender", price: 499.99, image: "https://images.unsplash.com/photo-1622480914645-7e70d66b7d16?w=400" },
    { name: "Casper Memory Foam Pillow", price: 89.00, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400" },
    { name: "Philips Sonicare Toothbrush", price: 169.99, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400" },
    { name: "Cuisinart Food Processor", price: 199.99, image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400" },
    { name: "Brooklinen Luxe Sheet Set", price: 169.00, image: "https://images.unsplash.com/photo-1616627561839-074385245ff6?w=400" },
    { name: "Nespresso Vertuo Plus", price: 179.00, image: "https://images.unsplash.com/photo-1612481849206-d7f55f5e8e5c?w=400" },
    { name: "Calphalon Nonstick Set", price: 299.99, image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400" },
    { name: "Shark Navigator Vacuum", price: 199.99, image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400" },
    { name: "Hamilton Beach Toaster", price: 29.99, image: "https://images.unsplash.com/photo-1621866486861-f9eafe0bbdc3?w=400" },
    { name: "OXO Pop Container Set", price: 79.99, image: "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?w=400" },
    { name: "Breville Smart Oven", price: 349.99, image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400" },
    { name: "Ruggable Washable Rug 5x7", price: 229.00, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400" },
  ],
  "Sports & Outdoors": [
    { name: "Yeti Rambler 30oz Tumbler", price: 38.00, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400" },
    { name: "Coleman 6-Person Tent", price: 149.99, image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400" },
    { name: "Fitbit Charge 5 Tracker", price: 149.95, image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400" },
    { name: "Stanley Adventure Cooler", price: 89.99, image: "https://images.unsplash.com/photo-1568702846914-96b305d2uj57?w=400" },
    { name: "Hydro Flask 32oz Bottle", price: 44.95, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400" },
    { name: "Osprey Hiking Backpack 40L", price: 199.99, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
    { name: "Garmin Forerunner 245", price: 299.99, image: "https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=400" },
    { name: "Callaway Golf Club Set", price: 499.99, image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400" },
    { name: "Bowflex Dumbbells 52.5lb", price: 429.00, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400" },
    { name: "Peloton Yoga Mat", price: 68.00, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400" },
    { name: "REI Co-op Sleeping Bag", price: 149.00, image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400" },
    { name: "Schwinn 10-Speed Bike", price: 399.99, image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400" },
    { name: "Everlast Boxing Gloves", price: 34.99, image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400" },
    { name: "TRX Suspension Training Kit", price: 179.95, image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400" },
    { name: "Patagonia Down Vest", price: 179.00, image: "https://images.unsplash.com/photo-1544923246-77307dd628b5?w=400" },
    { name: "GoPro HERO11 Black", price: 399.99, image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400" },
    { name: "Wilson NCAA Basketball", price: 29.99, image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400" },
    { name: "SKLZ Agility Ladder", price: 24.99, image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400" },
    { name: "Theragun Mini Massager", price: 199.00, image: "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=400" },
    { name: "Kelty Camping Chair", price: 49.95, image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400" },
  ],
  "Toys & Games": [
    { name: "LEGO Star Wars Millennium Falcon", price: 169.99, image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400" },
    { name: "Nintendo Switch Lite", price: 199.99, image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400" },
    { name: "Barbie Dreamhouse 2023", price: 199.99, image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400" },
    { name: "Hot Wheels Ultimate Garage", price: 89.99, image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400" },
    { name: "Monopoly Classic Board Game", price: 19.99, image: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=400" },
    { name: "Nerf Elite 2.0 Blaster", price: 29.99, image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400" },
    { name: "Play-Doh 36-Pack", price: 24.99, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400" },
    { name: "Melissa & Doug Wooden Puzzle", price: 14.99, image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400" },
    { name: "Fisher-Price Laugh & Learn", price: 39.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400" },
    { name: "Crayola Art Supply Set", price: 34.99, image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400" },
    { name: "UNO Card Game", price: 7.99, image: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=400" },
    { name: "Paw Patrol Tower Playset", price: 69.99, image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400" },
    { name: "LEGO City Police Station", price: 99.99, image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400" },
    { name: "Razor Scooter A5 Lux", price: 74.99, image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400" },
    { name: "Jenga Classic Game", price: 14.99, image: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=400" },
    { name: "Magna-Tiles 100pc Set", price: 119.99, image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400" },
    { name: "VTech KidiZoom Camera", price: 49.99, image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400" },
    { name: "Ticket to Ride Board Game", price: 44.99, image: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=400" },
    { name: "LOL Surprise Doll", price: 12.99, image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400" },
    { name: "Radio Flyer Wagon Classic", price: 119.99, image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400" },
  ],
  "Beauty & Personal Care": [
    { name: "Dyson Airwrap Complete", price: 599.99, image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400" },
    { name: "La Mer Moisturizing Cream", price: 190.00, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "Olaplex Hair Repair Set", price: 99.00, image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400" },
    { name: "Charlotte Tilbury Palette", price: 75.00, image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400" },
    { name: "Drunk Elephant Vitamin C", price: 80.00, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400" },
    { name: "Tatcha Dewy Skin Cream", price: 68.00, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "Fenty Beauty Foundation", price: 38.00, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400" },
    { name: "SK-II Facial Treatment Essence", price: 185.00, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "ghd Platinum+ Styler", price: 279.00, image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400" },
    { name: "Estee Lauder Night Repair", price: 75.00, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "MAC Lipstick Ruby Woo", price: 21.00, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400" },
    { name: "Paula's Choice BHA Exfoliant", price: 32.00, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400" },
    { name: "Sunday Riley Good Genes", price: 85.00, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400" },
    { name: "NuFace Trinity Facial Toner", price: 339.00, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "Ouai Hair Oil", price: 30.00, image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400" },
    { name: "Urban Decay Setting Spray", price: 33.00, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400" },
    { name: "The Ordinary Niacinamide", price: 6.00, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400" },
    { name: "Kiehl's Ultra Facial Cream", price: 32.00, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "NARS Blush Orgasm", price: 30.00, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400" },
    { name: "Clinique Dramatically Lotion", price: 28.00, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
  ],
  "Baby & Kids": [
    { name: "Graco Pack 'n Play", price: 99.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400" },
    { name: "Pampers Swaddlers Size 1 192ct", price: 49.99, image: "https://images.unsplash.com/photo-1584839404042-8bc21d240e77?w=400" },
    { name: "Ergobaby Carrier Omni 360", price: 179.00, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400" },
    { name: "Baby Brezza Formula Pro", price: 199.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400" },
    { name: "Uppababy Vista V2 Stroller", price: 969.99, image: "https://images.unsplash.com/photo-1591578673858-e8d72f9c78c9?w=400" },
    { name: "Hatch Baby Rest Sound Machine", price: 69.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400" },
    { name: "4moms MamaRoo Swing", price: 219.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400" },
    { name: "Enfamil NeuroPro Formula", price: 39.99, image: "https://images.unsplash.com/photo-1584839404042-8bc21d240e77?w=400" },
    { name: "Owlet Smart Sock 3", price: 299.00, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400" },
    { name: "Skip Hop Activity Center", price: 79.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400" },
    { name: "Nanit Pro Baby Monitor", price: 299.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400" },
    { name: "Chicco KeyFit 30 Car Seat", price: 199.99, image: "https://images.unsplash.com/photo-1591578673858-e8d72f9c78c9?w=400" },
    { name: "Huggies Little Snugglers", price: 42.99, image: "https://images.unsplash.com/photo-1584839404042-8bc21d240e77?w=400" },
    { name: "Baby Jogger City Mini GT2", price: 379.99, image: "https://images.unsplash.com/photo-1591578673858-e8d72f9c78c9?w=400" },
    { name: "Dr. Brown's Bottle Set", price: 29.99, image: "https://images.unsplash.com/photo-1584839404042-8bc21d240e77?w=400" },
    { name: "Boppy Nursing Pillow", price: 39.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400" },
    { name: "Medela Pump In Style", price: 199.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400" },
    { name: "Bumbo Floor Seat", price: 44.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400" },
    { name: "Aden + Anais Swaddle 4-Pack", price: 49.99, image: "https://images.unsplash.com/photo-1584839404042-8bc21d240e77?w=400" },
    { name: "Fisher-Price Baby Gym", price: 54.99, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400" },
  ],
};

// Product name variations to create more unique products
const nameVariations = [
  "", " - Premium", " - Standard", " - Deluxe", " Pro", " Plus", " Max", " Elite", " Classic", " Limited Edition"
];

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

    // Generate 1000+ products
    for (const [categoryName, templates] of Object.entries(productTemplates)) {
      const categoryId = categoryMap.get(categoryName);
      if (!categoryId) continue;

      // Create multiple variations of each template
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        
        // Create 6-8 variations of each product to reach 1000+
        for (let v = 0; v < 7; v++) {
          const variation = nameVariations[v % nameVariations.length];
          const priceMultiplier = 0.9 + (Math.random() * 0.3); // 90% to 120% of base price
          const stock = Math.floor(Math.random() * 150) + 10;
          const rating = 3.5 + Math.random() * 1.5; // 3.5 to 5.0
          
          productsToInsert.push({
            name: `${template.name}${variation}`,
            price: parseFloat((template.price * priceMultiplier).toFixed(2)),
            original_price: v > 0 ? parseFloat((template.price * priceMultiplier * 1.15).toFixed(2)) : null,
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
    }

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

    // Insert in batches of 100
    const batchSize = 100;
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
        message: `Successfully seeded ${inserted} products`,
        categories: Array.from(categoryMap.keys()),
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
