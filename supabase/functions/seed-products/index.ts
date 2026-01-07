import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product templates with accurate product images
const productTemplates = {
  Electronics: [
    { name: "Samsung Galaxy S24 Ultra", price: 1199.99, image: "https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-s928-sm-s928bztqins-thumb-539573340" },
    { name: "Apple iPhone 15 Pro Max", price: 1099.99, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium" },
    { name: "Sony 65\" 4K OLED Smart TV", price: 1499.99, image: "https://m.media-amazon.com/images/I/81yhfKx2LoL._AC_SL1500_.jpg" },
    { name: "MacBook Pro 14\" M3", price: 1999.99, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310" },
    { name: "Dell XPS 15 Laptop", price: 1349.99, image: "https://m.media-amazon.com/images/I/71rXPaLtW2L._AC_SL1500_.jpg" },
    { name: "Apple iPad Pro 12.9\"", price: 1099.99, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-select-wifi-spacegray-202405" },
    { name: "Sony PlayStation 5", price: 499.99, image: "https://m.media-amazon.com/images/I/619BkvKW35L._SL1500_.jpg" },
    { name: "Nintendo Switch OLED", price: 349.99, image: "https://m.media-amazon.com/images/I/61nqNujSF3L._SL1500_.jpg" },
    { name: "Apple AirPods Pro", price: 249.99, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83" },
    { name: "Samsung Galaxy Watch 6", price: 329.99, image: "https://m.media-amazon.com/images/I/61LkGPQ5h9L._AC_SL1500_.jpg" },
    { name: "Bose QuietComfort Ultra", price: 349.99, image: "https://m.media-amazon.com/images/I/51QvjLKvjQL._AC_SL1500_.jpg" },
    { name: "LG 55\" NanoCell 4K TV", price: 699.99, image: "https://m.media-amazon.com/images/I/81aVilBCKxL._AC_SL1500_.jpg" },
    { name: "Canon EOS R6 Camera", price: 2499.99, image: "https://m.media-amazon.com/images/I/71s4O7oNsyL._AC_SL1500_.jpg" },
    { name: "DJI Mini 3 Pro Drone", price: 759.99, image: "https://m.media-amazon.com/images/I/61ikpt60ShL._AC_SL1500_.jpg" },
    { name: "Anker 65W USB-C Charger", price: 49.99, image: "https://m.media-amazon.com/images/I/61VfL4+P6bL._AC_SL1500_.jpg" },
    { name: "Samsung 1TB SSD", price: 89.99, image: "https://m.media-amazon.com/images/I/71kCbvSQ56L._AC_SL1500_.jpg" },
    { name: "Logitech MX Master 3S", price: 99.99, image: "https://m.media-amazon.com/images/I/61ni3t1ryQL._AC_SL1500_.jpg" },
    { name: "Apple Watch Series 9", price: 399.99, image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ML703ref_VW_34FR+watch-case-45-aluminum-pink-nc-s9_VW_34FR+watch-face-45-aluminum-pink-s9_VW_34FR" },
    { name: "JBL Flip 6 Speaker", price: 129.99, image: "https://m.media-amazon.com/images/I/71Rtm-FbpNL._AC_SL1500_.jpg" },
    { name: "Ring Video Doorbell Pro 2", price: 229.99, image: "https://m.media-amazon.com/images/I/51mlWvWPVuS._SL1000_.jpg" },
  ],
  Groceries: [
    { name: "Organic Whole Milk 1 Gallon", price: 5.99, image: "https://m.media-amazon.com/images/I/71lrFKqNFAL._SL1500_.jpg" },
    { name: "Fresh Strawberries 1lb", price: 4.99, image: "https://m.media-amazon.com/images/I/81y7TLMSBEL._SL1500_.jpg" },
    { name: "Organic Bananas Bundle", price: 2.49, image: "https://m.media-amazon.com/images/I/71wLYrpWxXL._SL1500_.jpg" },
    { name: "Extra Virgin Olive Oil 500ml", price: 12.99, image: "https://m.media-amazon.com/images/I/71nX-uMYLNL._SL1500_.jpg" },
    { name: "Jasmine Rice 5lb Bag", price: 8.99, image: "https://m.media-amazon.com/images/I/81kVCxXLCML._SL1500_.jpg" },
    { name: "Free Range Eggs 12ct", price: 6.49, image: "https://m.media-amazon.com/images/I/71vH4pWfjnL._SL1500_.jpg" },
    { name: "Organic Avocados 4ct", price: 5.99, image: "https://m.media-amazon.com/images/I/71ysLcnqO8L._SL1500_.jpg" },
    { name: "Atlantic Salmon Fillet 1lb", price: 14.99, image: "https://m.media-amazon.com/images/I/71J2+dInc1L._SL1500_.jpg" },
    { name: "Almond Butter 16oz", price: 9.99, image: "https://m.media-amazon.com/images/I/71akFGQbWGL._SL1500_.jpg" },
    { name: "Greek Yogurt 32oz", price: 5.49, image: "https://m.media-amazon.com/images/I/71fhVNLdWeL._SL1500_.jpg" },
    { name: "Organic Baby Spinach 5oz", price: 4.29, image: "https://m.media-amazon.com/images/I/71p2mKh7RsL._SL1500_.jpg" },
    { name: "Whole Wheat Bread Loaf", price: 3.99, image: "https://m.media-amazon.com/images/I/71-G0I09sEL._SL1500_.jpg" },
    { name: "Ground Coffee 12oz", price: 11.99, image: "https://m.media-amazon.com/images/I/71wCWpnAs4L._SL1500_.jpg" },
    { name: "Orange Juice 64oz", price: 4.99, image: "https://m.media-amazon.com/images/I/71YpkYzG5LL._SL1500_.jpg" },
    { name: "Cheddar Cheese Block 1lb", price: 7.99, image: "https://m.media-amazon.com/images/I/71-VH4w-yNL._SL1500_.jpg" },
    { name: "Organic Raw Honey 16oz", price: 8.49, image: "https://m.media-amazon.com/images/I/71TDNYPfbTL._SL1500_.jpg" },
    { name: "Mixed Nuts 24oz", price: 12.99, image: "https://m.media-amazon.com/images/I/81rTJRK0VoL._SL1500_.jpg" },
    { name: "Pasta Variety Pack", price: 6.99, image: "https://m.media-amazon.com/images/I/81F9Wq1lSeL._SL1500_.jpg" },
    { name: "Marinara Sauce 24oz", price: 3.49, image: "https://m.media-amazon.com/images/I/71JJ0yXBJzL._SL1500_.jpg" },
    { name: "Fresh Blueberries 6oz", price: 4.99, image: "https://m.media-amazon.com/images/I/71M2cB9RbKL._SL1500_.jpg" },
  ],
  "Clothing & Shoes": [
    { name: "Nike Air Max 270", price: 149.99, image: "https://m.media-amazon.com/images/I/71LGljZ7AfL._AC_SL1500_.jpg" },
    { name: "Levi's 501 Original Jeans", price: 69.99, image: "https://m.media-amazon.com/images/I/71+iULIrNWL._AC_SL1500_.jpg" },
    { name: "Adidas Ultraboost 22", price: 189.99, image: "https://m.media-amazon.com/images/I/71m6+SbCBML._AC_SL1500_.jpg" },
    { name: "North Face Puffer Jacket", price: 229.99, image: "https://m.media-amazon.com/images/I/71l-P+RR4KL._AC_SL1500_.jpg" },
    { name: "Champion Hoodie Classic", price: 54.99, image: "https://m.media-amazon.com/images/I/71TvT5QJ5rL._AC_SL1500_.jpg" },
    { name: "Calvin Klein Boxer Briefs 3-Pack", price: 39.99, image: "https://m.media-amazon.com/images/I/81bZf0T8HrL._AC_SL1500_.jpg" },
    { name: "Ray-Ban Aviator Sunglasses", price: 163.99, image: "https://m.media-amazon.com/images/I/41U3HBVnKoL._AC_SL1000_.jpg" },
    { name: "Timberland 6\" Premium Boots", price: 198.99, image: "https://m.media-amazon.com/images/I/81KQp+cIJrL._AC_SL1500_.jpg" },
    { name: "Polo Ralph Lauren Shirt", price: 89.99, image: "https://m.media-amazon.com/images/I/71pWRs7wh2L._AC_SL1500_.jpg" },
    { name: "Nike Dri-FIT Training Tee", price: 34.99, image: "https://m.media-amazon.com/images/I/61JQE1lnmeL._AC_SL1500_.jpg" },
    { name: "Converse Chuck Taylor All Star", price: 65.00, image: "https://m.media-amazon.com/images/I/71i9-w-XBXL._AC_SL1500_.jpg" },
    { name: "Under Armour Sports Bra", price: 44.99, image: "https://m.media-amazon.com/images/I/71+vE+-4jRL._AC_SL1500_.jpg" },
    { name: "Tommy Hilfiger Polo", price: 59.99, image: "https://m.media-amazon.com/images/I/81J0kSHITNL._AC_SL1500_.jpg" },
    { name: "Vans Old Skool Sneakers", price: 69.99, image: "https://m.media-amazon.com/images/I/61m2-ioSEDL._AC_SL1500_.jpg" },
    { name: "Columbia Fleece Jacket", price: 79.99, image: "https://m.media-amazon.com/images/I/71lKafNE0xL._AC_SL1500_.jpg" },
    { name: "Hanes Cotton T-Shirts 5-Pack", price: 24.99, image: "https://m.media-amazon.com/images/I/71EQKlQxPBL._AC_SL1500_.jpg" },
    { name: "New Balance 574 Classic", price: 89.99, image: "https://m.media-amazon.com/images/I/61fNLjcgPNL._AC_SL1000_.jpg" },
    { name: "Lululemon Yoga Pants", price: 98.00, image: "https://m.media-amazon.com/images/I/61ZjZ2lKDHL._AC_SL1500_.jpg" },
    { name: "Carhartt Work Jacket", price: 129.99, image: "https://m.media-amazon.com/images/I/71B4r6mHv7L._AC_SL1500_.jpg" },
    { name: "Skechers Memory Foam Shoes", price: 74.99, image: "https://m.media-amazon.com/images/I/71qnEVg3TbL._AC_SL1500_.jpg" },
  ],
  "Home & Kitchen": [
    { name: "KitchenAid Stand Mixer", price: 379.99, image: "https://m.media-amazon.com/images/I/71Rdd6zN9jL._AC_SL1500_.jpg" },
    { name: "Dyson V15 Cordless Vacuum", price: 749.99, image: "https://m.media-amazon.com/images/I/61w1xofNQnL._SL1500_.jpg" },
    { name: "Instant Pot Duo 7-in-1", price: 89.99, image: "https://m.media-amazon.com/images/I/71WtwEvYDOS._AC_SL1500_.jpg" },
    { name: "Ninja Professional Blender", price: 99.99, image: "https://m.media-amazon.com/images/I/71xPULFm9gL._AC_SL1500_.jpg" },
    { name: "All-Clad Stainless Steel Set", price: 699.99, image: "https://m.media-amazon.com/images/I/71LGu1+0hJL._AC_SL1500_.jpg" },
    { name: "Keurig K-Elite Coffee Maker", price: 169.99, image: "https://m.media-amazon.com/images/I/71k8Xs98jNL._AC_SL1500_.jpg" },
    { name: "iRobot Roomba i7+", price: 799.99, image: "https://m.media-amazon.com/images/I/61SAt-TXrpL._AC_SL1500_.jpg" },
    { name: "Le Creuset Dutch Oven", price: 369.99, image: "https://m.media-amazon.com/images/I/71WvjQ+1F2L._AC_SL1500_.jpg" },
    { name: "Vitamix Professional Blender", price: 499.99, image: "https://m.media-amazon.com/images/I/71nA-pOE8yL._AC_SL1500_.jpg" },
    { name: "Casper Memory Foam Pillow", price: 89.00, image: "https://m.media-amazon.com/images/I/81I6hD0FhXL._AC_SL1500_.jpg" },
    { name: "Philips Sonicare Toothbrush", price: 169.99, image: "https://m.media-amazon.com/images/I/71RkjxIWgiL._AC_SL1500_.jpg" },
    { name: "Cuisinart Food Processor", price: 199.99, image: "https://m.media-amazon.com/images/I/81a8Pr-G4kL._AC_SL1500_.jpg" },
    { name: "Brooklinen Luxe Sheet Set", price: 169.00, image: "https://m.media-amazon.com/images/I/81Fn-jnb7bL._AC_SL1500_.jpg" },
    { name: "Nespresso Vertuo Plus", price: 179.00, image: "https://m.media-amazon.com/images/I/71bzE5gpCYL._AC_SL1500_.jpg" },
    { name: "Calphalon Nonstick Cookware", price: 299.99, image: "https://m.media-amazon.com/images/I/81OD-nGbMJL._AC_SL1500_.jpg" },
    { name: "Shark Navigator Vacuum", price: 199.99, image: "https://m.media-amazon.com/images/I/71JG-75LvCL._AC_SL1500_.jpg" },
    { name: "Hamilton Beach Toaster", price: 29.99, image: "https://m.media-amazon.com/images/I/81hFPUO4sZL._AC_SL1500_.jpg" },
    { name: "OXO Pop Container Set", price: 79.99, image: "https://m.media-amazon.com/images/I/81vJsWQD4zL._AC_SL1500_.jpg" },
    { name: "Breville Smart Oven Air", price: 349.99, image: "https://m.media-amazon.com/images/I/81kPUeWk+-L._AC_SL1500_.jpg" },
    { name: "Safavieh Area Rug 5x7", price: 229.00, image: "https://m.media-amazon.com/images/I/A1vc6tIbsRL._AC_SL1500_.jpg" },
  ],
  "Sports & Outdoors": [
    { name: "Yeti Rambler 30oz Tumbler", price: 38.00, image: "https://m.media-amazon.com/images/I/61ImmfE-xbL._AC_SL1500_.jpg" },
    { name: "Coleman 6-Person Tent", price: 149.99, image: "https://m.media-amazon.com/images/I/81rkQQ2TYTL._AC_SL1500_.jpg" },
    { name: "Fitbit Charge 5", price: 149.95, image: "https://m.media-amazon.com/images/I/71DXTGCRLRL._AC_SL1500_.jpg" },
    { name: "Stanley Adventure Cooler", price: 89.99, image: "https://m.media-amazon.com/images/I/81nLSqVlKSL._AC_SL1500_.jpg" },
    { name: "Hydro Flask 32oz Bottle", price: 44.95, image: "https://m.media-amazon.com/images/I/61hP4YRs5bL._AC_SL1500_.jpg" },
    { name: "Osprey Hiking Backpack 40L", price: 199.99, image: "https://m.media-amazon.com/images/I/81X4j-hk2qL._AC_SL1500_.jpg" },
    { name: "Garmin Forerunner 245", price: 299.99, image: "https://m.media-amazon.com/images/I/61fE8KLGYLL._AC_SL1500_.jpg" },
    { name: "Callaway Golf Club Set", price: 499.99, image: "https://m.media-amazon.com/images/I/71fyjy9VFKL._AC_SL1500_.jpg" },
    { name: "Bowflex Adjustable Dumbbells", price: 429.00, image: "https://m.media-amazon.com/images/I/71rpctZRJdL._AC_SL1500_.jpg" },
    { name: "Manduka PRO Yoga Mat", price: 68.00, image: "https://m.media-amazon.com/images/I/71dFMGhz-hL._AC_SL1500_.jpg" },
    { name: "REI Co-op Sleeping Bag", price: 149.00, image: "https://m.media-amazon.com/images/I/71QY3h8k0+L._AC_SL1500_.jpg" },
    { name: "Schwinn 10-Speed Bike", price: 399.99, image: "https://m.media-amazon.com/images/I/81uK6dbz7qL._AC_SL1500_.jpg" },
    { name: "Everlast Boxing Gloves", price: 34.99, image: "https://m.media-amazon.com/images/I/81vI-tEO0zL._AC_SL1500_.jpg" },
    { name: "TRX Suspension Trainer", price: 179.95, image: "https://m.media-amazon.com/images/I/61jlePn5sJL._AC_SL1500_.jpg" },
    { name: "Patagonia Down Sweater", price: 179.00, image: "https://m.media-amazon.com/images/I/71i2R+Jk4xL._AC_SL1500_.jpg" },
    { name: "GoPro HERO11 Black", price: 399.99, image: "https://m.media-amazon.com/images/I/61p2fYPHSeL._AC_SL1500_.jpg" },
    { name: "Wilson NCAA Basketball", price: 29.99, image: "https://m.media-amazon.com/images/I/81sGSZNTU8L._AC_SL1500_.jpg" },
    { name: "SKLZ Agility Ladder", price: 24.99, image: "https://m.media-amazon.com/images/I/61T+CbIoJsL._AC_SL1500_.jpg" },
    { name: "Theragun Mini", price: 199.00, image: "https://m.media-amazon.com/images/I/61nKX1vEMTL._AC_SL1500_.jpg" },
    { name: "Kelty Camping Chair", price: 49.95, image: "https://m.media-amazon.com/images/I/71tLeFN8AGL._AC_SL1500_.jpg" },
  ],
  "Toys & Games": [
    { name: "LEGO Star Wars Millennium Falcon", price: 169.99, image: "https://m.media-amazon.com/images/I/81Nfhj4gXqL._AC_SL1500_.jpg" },
    { name: "Nintendo Switch Lite", price: 199.99, image: "https://m.media-amazon.com/images/I/61iDumDKRxL._AC_SL1500_.jpg" },
    { name: "Barbie Dreamhouse 2023", price: 199.99, image: "https://m.media-amazon.com/images/I/81-skm0PKKL._AC_SL1500_.jpg" },
    { name: "Hot Wheels Ultimate Garage", price: 89.99, image: "https://m.media-amazon.com/images/I/81KvRCpRzyL._AC_SL1500_.jpg" },
    { name: "Monopoly Classic Board Game", price: 19.99, image: "https://m.media-amazon.com/images/I/81Ul+c-wk0L._AC_SL1500_.jpg" },
    { name: "Nerf Elite 2.0 Blaster", price: 29.99, image: "https://m.media-amazon.com/images/I/71GsYnZ3XNL._AC_SL1500_.jpg" },
    { name: "Play-Doh 36-Pack Bundle", price: 24.99, image: "https://m.media-amazon.com/images/I/81+bSGcRGwL._AC_SL1500_.jpg" },
    { name: "Melissa & Doug Wooden Puzzle", price: 14.99, image: "https://m.media-amazon.com/images/I/A1p2VCJJFWL._AC_SL1500_.jpg" },
    { name: "Fisher-Price Laugh & Learn", price: 39.99, image: "https://m.media-amazon.com/images/I/81FH29+RfNL._AC_SL1500_.jpg" },
    { name: "Crayola Art Supply Set", price: 34.99, image: "https://m.media-amazon.com/images/I/81pXnJVaYdL._AC_SL1500_.jpg" },
    { name: "UNO Card Game", price: 7.99, image: "https://m.media-amazon.com/images/I/81E+0Y8KZ9L._AC_SL1500_.jpg" },
    { name: "Paw Patrol Tower Playset", price: 69.99, image: "https://m.media-amazon.com/images/I/71pJ8pGJhCL._AC_SL1500_.jpg" },
    { name: "LEGO City Police Station", price: 99.99, image: "https://m.media-amazon.com/images/I/81YQKqGQnCL._AC_SL1500_.jpg" },
    { name: "Razor Scooter A5 Lux", price: 74.99, image: "https://m.media-amazon.com/images/I/61K6sOtFV3L._AC_SL1500_.jpg" },
    { name: "Jenga Classic Game", price: 14.99, image: "https://m.media-amazon.com/images/I/71hEXUNBT5L._AC_SL1500_.jpg" },
    { name: "Magna-Tiles 100pc Set", price: 119.99, image: "https://m.media-amazon.com/images/I/81d5i2D9nYL._AC_SL1500_.jpg" },
    { name: "VTech KidiZoom Camera", price: 49.99, image: "https://m.media-amazon.com/images/I/71Z5DKMZ01L._AC_SL1500_.jpg" },
    { name: "Ticket to Ride Board Game", price: 44.99, image: "https://m.media-amazon.com/images/I/91YNJM4OkmL._AC_SL1500_.jpg" },
    { name: "LOL Surprise Doll", price: 12.99, image: "https://m.media-amazon.com/images/I/81K6w1m8+SL._AC_SL1500_.jpg" },
    { name: "Radio Flyer Wagon Classic", price: 119.99, image: "https://m.media-amazon.com/images/I/71Jf4UGSB5L._AC_SL1500_.jpg" },
  ],
  "Beauty & Personal Care": [
    { name: "Dyson Airwrap Complete", price: 599.99, image: "https://m.media-amazon.com/images/I/61nzJks04QL._SL1500_.jpg" },
    { name: "La Mer Moisturizing Cream", price: 190.00, image: "https://m.media-amazon.com/images/I/61+P2nv3VIL._SL1500_.jpg" },
    { name: "Olaplex Hair Repair Set", price: 99.00, image: "https://m.media-amazon.com/images/I/71T5zptVpAL._SL1500_.jpg" },
    { name: "Charlotte Tilbury Palette", price: 75.00, image: "https://m.media-amazon.com/images/I/71hMPkiW6NL._SL1500_.jpg" },
    { name: "Drunk Elephant Vitamin C Serum", price: 80.00, image: "https://m.media-amazon.com/images/I/61c22lLyC6L._SL1500_.jpg" },
    { name: "Tatcha Dewy Skin Cream", price: 68.00, image: "https://m.media-amazon.com/images/I/51+L4VvmDeL._SL1500_.jpg" },
    { name: "Fenty Beauty Foundation", price: 38.00, image: "https://m.media-amazon.com/images/I/51mDpGLbXaL._SL1200_.jpg" },
    { name: "SK-II Facial Treatment Essence", price: 185.00, image: "https://m.media-amazon.com/images/I/51l6B9mM3ZL._SL1500_.jpg" },
    { name: "ghd Platinum+ Styler", price: 279.00, image: "https://m.media-amazon.com/images/I/61TnXBhdGzL._SL1500_.jpg" },
    { name: "Estee Lauder Night Repair", price: 75.00, image: "https://m.media-amazon.com/images/I/61iZJVEBLYL._SL1500_.jpg" },
    { name: "MAC Lipstick Ruby Woo", price: 21.00, image: "https://m.media-amazon.com/images/I/61l0bX3xGWL._SL1500_.jpg" },
    { name: "Paula's Choice BHA Exfoliant", price: 32.00, image: "https://m.media-amazon.com/images/I/51FiIPxYbSL._SL1500_.jpg" },
    { name: "Sunday Riley Good Genes", price: 85.00, image: "https://m.media-amazon.com/images/I/51kMNz5y0VL._SL1500_.jpg" },
    { name: "NuFace Trinity Facial Toner", price: 339.00, image: "https://m.media-amazon.com/images/I/61XQazlNmjL._SL1500_.jpg" },
    { name: "Ouai Hair Oil", price: 30.00, image: "https://m.media-amazon.com/images/I/51EO0pYYaJL._SL1500_.jpg" },
    { name: "Urban Decay Setting Spray", price: 33.00, image: "https://m.media-amazon.com/images/I/61MwJrYuQRL._SL1500_.jpg" },
    { name: "The Ordinary Niacinamide", price: 6.00, image: "https://m.media-amazon.com/images/I/51Z3nVi62ZL._SL1500_.jpg" },
    { name: "Kiehl's Ultra Facial Cream", price: 32.00, image: "https://m.media-amazon.com/images/I/516V8nYL1aL._SL1500_.jpg" },
    { name: "NARS Blush Orgasm", price: 30.00, image: "https://m.media-amazon.com/images/I/61aEsQmfj-L._SL1500_.jpg" },
    { name: "CeraVe Moisturizing Cream", price: 16.99, image: "https://m.media-amazon.com/images/I/61S7BrCBj7L._SL1500_.jpg" },
  ],
  "Baby & Kids": [
    { name: "Graco Pack 'n Play", price: 99.99, image: "https://m.media-amazon.com/images/I/71VqXrcNJxL._SL1500_.jpg" },
    { name: "Pampers Swaddlers Size 1 192ct", price: 49.99, image: "https://m.media-amazon.com/images/I/71dKsT3bMFL._SL1500_.jpg" },
    { name: "Ergobaby Carrier Omni 360", price: 179.00, image: "https://m.media-amazon.com/images/I/71z+I+VlNPL._SL1500_.jpg" },
    { name: "Baby Brezza Formula Pro", price: 199.99, image: "https://m.media-amazon.com/images/I/71vixMh3TbL._SL1500_.jpg" },
    { name: "UPPAbaby Vista V2 Stroller", price: 969.99, image: "https://m.media-amazon.com/images/I/71RFMnM+tYL._SL1500_.jpg" },
    { name: "Hatch Baby Rest Sound Machine", price: 69.99, image: "https://m.media-amazon.com/images/I/61WoZXcYRJL._SL1500_.jpg" },
    { name: "4moms MamaRoo Swing", price: 219.99, image: "https://m.media-amazon.com/images/I/71d6kJzfuoL._SL1500_.jpg" },
    { name: "Enfamil NeuroPro Formula", price: 39.99, image: "https://m.media-amazon.com/images/I/71tTg4XoeJL._SL1500_.jpg" },
    { name: "Owlet Smart Sock 3", price: 299.00, image: "https://m.media-amazon.com/images/I/61m2xTF5roL._SL1500_.jpg" },
    { name: "Skip Hop Activity Center", price: 79.99, image: "https://m.media-amazon.com/images/I/71vSbaqvn4L._SL1500_.jpg" },
    { name: "Nanit Pro Baby Monitor", price: 299.99, image: "https://m.media-amazon.com/images/I/61LMIcuE2qL._SL1500_.jpg" },
    { name: "Chicco KeyFit 30 Car Seat", price: 199.99, image: "https://m.media-amazon.com/images/I/71vhXAqvq1L._SL1500_.jpg" },
    { name: "Huggies Little Snugglers", price: 42.99, image: "https://m.media-amazon.com/images/I/81Ueo3C5rkL._SL1500_.jpg" },
    { name: "Baby Jogger City Mini GT2", price: 379.99, image: "https://m.media-amazon.com/images/I/71cKVZKiaSL._SL1500_.jpg" },
    { name: "Dr. Brown's Bottle Set", price: 29.99, image: "https://m.media-amazon.com/images/I/71pYk0gWTML._SL1500_.jpg" },
    { name: "Boppy Nursing Pillow", price: 39.99, image: "https://m.media-amazon.com/images/I/71ggB2z3ZZL._SL1500_.jpg" },
    { name: "Medela Pump In Style", price: 199.99, image: "https://m.media-amazon.com/images/I/71MYPzLJoSL._SL1500_.jpg" },
    { name: "Bumbo Floor Seat", price: 44.99, image: "https://m.media-amazon.com/images/I/71U3WPAqbKL._SL1500_.jpg" },
    { name: "Aden + Anais Swaddle 4-Pack", price: 49.99, image: "https://m.media-amazon.com/images/I/71oU5y3TdRL._SL1500_.jpg" },
    { name: "Fisher-Price Baby Gym", price: 54.99, image: "https://m.media-amazon.com/images/I/81I4WM+NSmL._SL1500_.jpg" },
  ],
};

// Product name variations to create more unique products
const nameVariations = [
  "", " - Premium", " - Standard", " - Deluxe", " Pro", " Plus", " Max"
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
        
        // Create 7 variations of each product to reach 1000+
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
