import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Each product has a UNIQUE name and UNIQUE image - no duplicates
const productTemplates = {
  Electronics: [
    { name: "Samsung Galaxy S24 Ultra", price: 1199.99, image: "https://m.media-amazon.com/images/I/71lD7eGdW-L._AC_SL1500_.jpg" },
    { name: "Apple iPhone 15 Pro Max", price: 1099.99, image: "https://m.media-amazon.com/images/I/81SigpJN1KL._AC_SL1500_.jpg" },
    { name: "Sony 65\" 4K OLED Smart TV", price: 1499.99, image: "https://m.media-amazon.com/images/I/81yhfKx2LoL._AC_SL1500_.jpg" },
    { name: "MacBook Pro 14\" M3", price: 1999.99, image: "https://m.media-amazon.com/images/I/61lsexTCOhL._AC_SL1500_.jpg" },
    { name: "Dell XPS 15 Laptop", price: 1349.99, image: "https://m.media-amazon.com/images/I/71rXPaLtW2L._AC_SL1500_.jpg" },
    { name: "Apple iPad Pro 12.9\"", price: 1099.99, image: "https://m.media-amazon.com/images/I/81c+9BOQNWL._AC_SL1500_.jpg" },
    { name: "Sony PlayStation 5", price: 499.99, image: "https://m.media-amazon.com/images/I/619BkvKW35L._SL1500_.jpg" },
    { name: "Nintendo Switch OLED", price: 349.99, image: "https://m.media-amazon.com/images/I/61nqNujSF3L._SL1500_.jpg" },
    { name: "Apple AirPods Pro 2nd Gen", price: 249.99, image: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg" },
    { name: "Samsung Galaxy Watch 6", price: 329.99, image: "https://m.media-amazon.com/images/I/61LkGPQ5h9L._AC_SL1500_.jpg" },
    { name: "Bose QuietComfort Ultra Headphones", price: 349.99, image: "https://m.media-amazon.com/images/I/51QvjLKvjQL._AC_SL1500_.jpg" },
    { name: "LG 55\" NanoCell 4K TV", price: 699.99, image: "https://m.media-amazon.com/images/I/81aVilBCKxL._AC_SL1500_.jpg" },
    { name: "Canon EOS R6 Mark II Camera", price: 2499.99, image: "https://m.media-amazon.com/images/I/71s4O7oNsyL._AC_SL1500_.jpg" },
    { name: "DJI Mini 3 Pro Drone", price: 759.99, image: "https://m.media-amazon.com/images/I/61ikpt60ShL._AC_SL1500_.jpg" },
    { name: "Anker 65W USB-C Charger", price: 49.99, image: "https://m.media-amazon.com/images/I/61VfL4+P6bL._AC_SL1500_.jpg" },
    { name: "Samsung 1TB 990 Pro SSD", price: 89.99, image: "https://m.media-amazon.com/images/I/71kCbvSQ56L._AC_SL1500_.jpg" },
    { name: "Logitech MX Master 3S Mouse", price: 99.99, image: "https://m.media-amazon.com/images/I/61ni3t1ryQL._AC_SL1500_.jpg" },
    { name: "Apple Watch Series 9", price: 399.99, image: "https://m.media-amazon.com/images/I/71XMTLtZd5L._AC_SL1500_.jpg" },
    { name: "JBL Flip 6 Bluetooth Speaker", price: 129.99, image: "https://m.media-amazon.com/images/I/71Rtm-FbpNL._AC_SL1500_.jpg" },
    { name: "Ring Video Doorbell Pro 2", price: 229.99, image: "https://m.media-amazon.com/images/I/51mlWvWPVuS._SL1000_.jpg" },
    { name: "Sony WH-1000XM5 Headphones", price: 398.00, image: "https://m.media-amazon.com/images/I/61vJtKbAssL._AC_SL1500_.jpg" },
    { name: "Microsoft Xbox Series X", price: 499.99, image: "https://m.media-amazon.com/images/I/51ojzJk77qL._SL1024_.jpg" },
    { name: "Apple Mac Mini M2", price: 599.00, image: "https://m.media-amazon.com/images/I/61VNggTh6GL._AC_SL1500_.jpg" },
    { name: "Google Pixel 8 Pro", price: 999.00, image: "https://m.media-amazon.com/images/I/71HU7+twRyL._AC_SL1500_.jpg" },
    { name: "Amazon Echo Show 10", price: 249.99, image: "https://m.media-amazon.com/images/I/61RvzWKPtnL._AC_SL1000_.jpg" },
    { name: "Kindle Paperwhite Signature", price: 189.99, image: "https://m.media-amazon.com/images/I/61PHls7OAVL._AC_SL1000_.jpg" },
    { name: "ASUS ROG Gaming Monitor 27\"", price: 449.99, image: "https://m.media-amazon.com/images/I/81hNI-cTNnL._AC_SL1500_.jpg" },
    { name: "Razer BlackWidow V4 Keyboard", price: 169.99, image: "https://m.media-amazon.com/images/I/71H2j2M6A3L._AC_SL1500_.jpg" },
    { name: "SteelSeries Arctis Nova Pro Headset", price: 349.99, image: "https://m.media-amazon.com/images/I/61KsGlZfKwL._AC_SL1500_.jpg" },
    { name: "TP-Link Deco Mesh WiFi 6", price: 229.99, image: "https://m.media-amazon.com/images/I/61i+BoZ-0mL._AC_SL1500_.jpg" },
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
    { name: "Organic Chicken Breast 2lb", price: 12.99, image: "https://m.media-amazon.com/images/I/61UtWc9uyXL._SL1000_.jpg" },
    { name: "Peanut Butter 28oz", price: 7.49, image: "https://m.media-amazon.com/images/I/81ZrFEwQvoL._SL1500_.jpg" },
    { name: "Oat Milk 64oz", price: 4.99, image: "https://m.media-amazon.com/images/I/61VBJCqt7GL._SL1500_.jpg" },
    { name: "Fresh Mozzarella 8oz", price: 5.99, image: "https://m.media-amazon.com/images/I/61x+M8U3YsL._SL1500_.jpg" },
    { name: "Organic Green Tea Box", price: 6.99, image: "https://m.media-amazon.com/images/I/81Qpv9dNf9L._SL1500_.jpg" },
    { name: "Maple Syrup 12oz", price: 9.99, image: "https://m.media-amazon.com/images/I/71Tpw4o8+fL._SL1500_.jpg" },
    { name: "Dark Chocolate Bar 85%", price: 4.49, image: "https://m.media-amazon.com/images/I/81KdDiYmvCL._SL1500_.jpg" },
    { name: "Coconut Oil 14oz", price: 8.99, image: "https://m.media-amazon.com/images/I/71EoI45jBRL._SL1500_.jpg" },
    { name: "Quinoa 2lb Bag", price: 7.99, image: "https://m.media-amazon.com/images/I/81O0gNPlURL._SL1500_.jpg" },
    { name: "Apple Cider Vinegar 32oz", price: 6.49, image: "https://m.media-amazon.com/images/I/71FrV97DjTL._SL1500_.jpg" },
  ],
  "Clothing & Shoes": [
    { name: "Nike Air Max 270", price: 149.99, image: "https://m.media-amazon.com/images/I/71LGljZ7AfL._AC_SL1500_.jpg" },
    { name: "Levi's 501 Original Jeans", price: 69.99, image: "https://m.media-amazon.com/images/I/71+iULIrNWL._AC_SL1500_.jpg" },
    { name: "Adidas Ultraboost 22", price: 189.99, image: "https://m.media-amazon.com/images/I/71m6+SbCBML._AC_SL1500_.jpg" },
    { name: "North Face Puffer Jacket", price: 229.99, image: "https://m.media-amazon.com/images/I/71l-P+RR4KL._AC_SL1500_.jpg" },
    { name: "Champion Classic Hoodie", price: 54.99, image: "https://m.media-amazon.com/images/I/71TvT5QJ5rL._AC_SL1500_.jpg" },
    { name: "Calvin Klein Boxer Briefs 3-Pack", price: 39.99, image: "https://m.media-amazon.com/images/I/81bZf0T8HrL._AC_SL1500_.jpg" },
    { name: "Ray-Ban Aviator Sunglasses", price: 163.99, image: "https://m.media-amazon.com/images/I/41U3HBVnKoL._AC_SL1000_.jpg" },
    { name: "Timberland 6\" Premium Boots", price: 198.99, image: "https://m.media-amazon.com/images/I/81KQp+cIJrL._AC_SL1500_.jpg" },
    { name: "Polo Ralph Lauren Classic Shirt", price: 89.99, image: "https://m.media-amazon.com/images/I/71pWRs7wh2L._AC_SL1500_.jpg" },
    { name: "Nike Dri-FIT Training Tee", price: 34.99, image: "https://m.media-amazon.com/images/I/61JQE1lnmeL._AC_SL1500_.jpg" },
    { name: "Converse Chuck Taylor All Star", price: 65.00, image: "https://m.media-amazon.com/images/I/71i9-w-XBXL._AC_SL1500_.jpg" },
    { name: "Under Armour Sports Bra", price: 44.99, image: "https://m.media-amazon.com/images/I/71+vE+-4jRL._AC_SL1500_.jpg" },
    { name: "Tommy Hilfiger Classic Polo", price: 59.99, image: "https://m.media-amazon.com/images/I/81J0kSHITNL._AC_SL1500_.jpg" },
    { name: "Vans Old Skool Sneakers", price: 69.99, image: "https://m.media-amazon.com/images/I/61m2-ioSEDL._AC_SL1500_.jpg" },
    { name: "Columbia Fleece Jacket", price: 79.99, image: "https://m.media-amazon.com/images/I/71lKafNE0xL._AC_SL1500_.jpg" },
    { name: "Hanes Cotton T-Shirts 5-Pack", price: 24.99, image: "https://m.media-amazon.com/images/I/71EQKlQxPBL._AC_SL1500_.jpg" },
    { name: "New Balance 574 Classic", price: 89.99, image: "https://m.media-amazon.com/images/I/61fNLjcgPNL._AC_SL1000_.jpg" },
    { name: "Lululemon Align Yoga Pants", price: 98.00, image: "https://m.media-amazon.com/images/I/61ZjZ2lKDHL._AC_SL1500_.jpg" },
    { name: "Carhartt Work Jacket", price: 129.99, image: "https://m.media-amazon.com/images/I/71B4r6mHv7L._AC_SL1500_.jpg" },
    { name: "Skechers Memory Foam Shoes", price: 74.99, image: "https://m.media-amazon.com/images/I/71qnEVg3TbL._AC_SL1500_.jpg" },
    { name: "Nike Air Force 1 '07", price: 110.00, image: "https://m.media-amazon.com/images/I/61LZ7TyVLpL._AC_SL1500_.jpg" },
    { name: "Wrangler Classic Fit Jeans", price: 29.99, image: "https://m.media-amazon.com/images/I/81C2Zj4bJzL._AC_SL1500_.jpg" },
    { name: "Puma RS-X Sneakers", price: 110.00, image: "https://m.media-amazon.com/images/I/71CLST3N8HL._AC_SL1500_.jpg" },
    { name: "Dockers Classic Chinos", price: 49.99, image: "https://m.media-amazon.com/images/I/71lRVlqPD5L._AC_SL1500_.jpg" },
    { name: "Dickies Original 874 Pants", price: 28.99, image: "https://m.media-amazon.com/images/I/71TY3pGJD7L._AC_SL1500_.jpg" },
    { name: "Reebok Classic Leather", price: 80.00, image: "https://m.media-amazon.com/images/I/71h7c4ghnTL._AC_SL1500_.jpg" },
    { name: "ASICS Gel-Kayano 29", price: 159.95, image: "https://m.media-amazon.com/images/I/71nfE2XJoHL._AC_SL1500_.jpg" },
    { name: "Brooks Ghost 15 Running", price: 139.95, image: "https://m.media-amazon.com/images/I/71E9HRcz7aL._AC_SL1500_.jpg" },
    { name: "Hoka Bondi 8 Running Shoes", price: 165.00, image: "https://m.media-amazon.com/images/I/61L0f8qfqBL._AC_SL1200_.jpg" },
    { name: "On Cloud Running Shoes", price: 139.99, image: "https://m.media-amazon.com/images/I/71FNzG5RCRL._AC_SL1500_.jpg" },
  ],
  "Home & Kitchen": [
    { name: "KitchenAid Artisan Stand Mixer", price: 379.99, image: "https://m.media-amazon.com/images/I/71Rdd6zN9jL._AC_SL1500_.jpg" },
    { name: "Dyson V15 Cordless Vacuum", price: 749.99, image: "https://m.media-amazon.com/images/I/61w1xofNQnL._SL1500_.jpg" },
    { name: "Instant Pot Duo 7-in-1", price: 89.99, image: "https://m.media-amazon.com/images/I/71WtwEvYDOS._AC_SL1500_.jpg" },
    { name: "Ninja Professional Blender", price: 99.99, image: "https://m.media-amazon.com/images/I/71xPULFm9gL._AC_SL1500_.jpg" },
    { name: "All-Clad Stainless Steel 10pc Set", price: 699.99, image: "https://m.media-amazon.com/images/I/71LGu1+0hJL._AC_SL1500_.jpg" },
    { name: "Keurig K-Elite Coffee Maker", price: 169.99, image: "https://m.media-amazon.com/images/I/71k8Xs98jNL._AC_SL1500_.jpg" },
    { name: "iRobot Roomba i7+", price: 799.99, image: "https://m.media-amazon.com/images/I/61SAt-TXrpL._AC_SL1500_.jpg" },
    { name: "Le Creuset Dutch Oven 5.5qt", price: 369.99, image: "https://m.media-amazon.com/images/I/71WvjQ+1F2L._AC_SL1500_.jpg" },
    { name: "Vitamix Professional 750", price: 499.99, image: "https://m.media-amazon.com/images/I/71nA-pOE8yL._AC_SL1500_.jpg" },
    { name: "Casper Memory Foam Pillow", price: 89.00, image: "https://m.media-amazon.com/images/I/81I6hD0FhXL._AC_SL1500_.jpg" },
    { name: "Philips Sonicare DiamondClean", price: 169.99, image: "https://m.media-amazon.com/images/I/71RkjxIWgiL._AC_SL1500_.jpg" },
    { name: "Cuisinart 14-Cup Food Processor", price: 199.99, image: "https://m.media-amazon.com/images/I/81a8Pr-G4kL._AC_SL1500_.jpg" },
    { name: "Brooklinen Luxe Sheet Set Queen", price: 169.00, image: "https://m.media-amazon.com/images/I/81Fn-jnb7bL._AC_SL1500_.jpg" },
    { name: "Nespresso Vertuo Plus", price: 179.00, image: "https://m.media-amazon.com/images/I/71bzE5gpCYL._AC_SL1500_.jpg" },
    { name: "Calphalon Nonstick 10pc Set", price: 299.99, image: "https://m.media-amazon.com/images/I/81OD-nGbMJL._AC_SL1500_.jpg" },
    { name: "Shark Navigator Lift-Away", price: 199.99, image: "https://m.media-amazon.com/images/I/71JG-75LvCL._AC_SL1500_.jpg" },
    { name: "Hamilton Beach 4-Slice Toaster", price: 29.99, image: "https://m.media-amazon.com/images/I/81hFPUO4sZL._AC_SL1500_.jpg" },
    { name: "OXO Pop Container 10pc Set", price: 79.99, image: "https://m.media-amazon.com/images/I/81vJsWQD4zL._AC_SL1500_.jpg" },
    { name: "Breville Smart Oven Air Fryer", price: 349.99, image: "https://m.media-amazon.com/images/I/81kPUeWk+-L._AC_SL1500_.jpg" },
    { name: "Safavieh Madison Area Rug 5x7", price: 229.00, image: "https://m.media-amazon.com/images/I/A1vc6tIbsRL._AC_SL1500_.jpg" },
    { name: "Ninja Foodi Digital Air Fry Oven", price: 179.99, image: "https://m.media-amazon.com/images/I/71UBgN5nCZL._AC_SL1500_.jpg" },
    { name: "Lodge Cast Iron Skillet 12\"", price: 44.99, image: "https://m.media-amazon.com/images/I/81QJxE+KDsL._AC_SL1500_.jpg" },
    { name: "Zojirushi Rice Cooker 5.5 Cup", price: 189.99, image: "https://m.media-amazon.com/images/I/71APoFq2URL._AC_SL1500_.jpg" },
    { name: "Simplehuman Sensor Trash Can", price: 199.99, image: "https://m.media-amazon.com/images/I/71TY5-J9ZpL._AC_SL1500_.jpg" },
    { name: "Dyson Pure Cool Air Purifier", price: 549.99, image: "https://m.media-amazon.com/images/I/51KChUK+HhL._AC_SL1000_.jpg" },
    { name: "Staub Cast Iron Cocotte 4qt", price: 299.99, image: "https://m.media-amazon.com/images/I/71O7nNxmVvL._AC_SL1500_.jpg" },
    { name: "Beckham Hotel Collection Pillows", price: 49.99, image: "https://m.media-amazon.com/images/I/71yFZ85bTXL._AC_SL1500_.jpg" },
    { name: "Moccamaster Coffee Brewer", price: 349.00, image: "https://m.media-amazon.com/images/I/61WkT-FV1IL._AC_SL1500_.jpg" },
    { name: "Ruggable Washable Rug 5x7", price: 299.00, image: "https://m.media-amazon.com/images/I/91+LnMjLLfL._AC_SL1500_.jpg" },
    { name: "Bissell CrossWave Pet Pro", price: 299.99, image: "https://m.media-amazon.com/images/I/71xmW9OwpmL._AC_SL1500_.jpg" },
  ],
  "Sports & Outdoors": [
    { name: "Yeti Rambler 30oz Tumbler", price: 38.00, image: "https://m.media-amazon.com/images/I/61ImmfE-xbL._AC_SL1500_.jpg" },
    { name: "Coleman Sundome 6-Person Tent", price: 149.99, image: "https://m.media-amazon.com/images/I/81rkQQ2TYTL._AC_SL1500_.jpg" },
    { name: "Fitbit Charge 5", price: 149.95, image: "https://m.media-amazon.com/images/I/71DXTGCRLRL._AC_SL1500_.jpg" },
    { name: "Stanley Adventure Cooler 16qt", price: 89.99, image: "https://m.media-amazon.com/images/I/81nLSqVlKSL._AC_SL1500_.jpg" },
    { name: "Hydro Flask 32oz Wide Mouth", price: 44.95, image: "https://m.media-amazon.com/images/I/61hP4YRs5bL._AC_SL1500_.jpg" },
    { name: "Osprey Atmos AG 65 Backpack", price: 270.00, image: "https://m.media-amazon.com/images/I/81X4j-hk2qL._AC_SL1500_.jpg" },
    { name: "Garmin Forerunner 265", price: 449.99, image: "https://m.media-amazon.com/images/I/61fE8KLGYLL._AC_SL1500_.jpg" },
    { name: "Callaway Strata Complete Golf Set", price: 499.99, image: "https://m.media-amazon.com/images/I/71fyjy9VFKL._AC_SL1500_.jpg" },
    { name: "Bowflex SelectTech 552 Dumbbells", price: 429.00, image: "https://m.media-amazon.com/images/I/71rpctZRJdL._AC_SL1500_.jpg" },
    { name: "Manduka PRO 6mm Yoga Mat", price: 120.00, image: "https://m.media-amazon.com/images/I/71dFMGhz-hL._AC_SL1500_.jpg" },
    { name: "REI Co-op Magma 15 Sleeping Bag", price: 399.00, image: "https://m.media-amazon.com/images/I/71QY3h8k0+L._AC_SL1500_.jpg" },
    { name: "Schwinn Discover Hybrid Bike", price: 399.99, image: "https://m.media-amazon.com/images/I/81uK6dbz7qL._AC_SL1500_.jpg" },
    { name: "Everlast Pro Style Training Gloves", price: 34.99, image: "https://m.media-amazon.com/images/I/81vI-tEO0zL._AC_SL1500_.jpg" },
    { name: "TRX Pro4 Suspension Trainer", price: 229.95, image: "https://m.media-amazon.com/images/I/61jlePn5sJL._AC_SL1500_.jpg" },
    { name: "Patagonia Nano Puff Jacket", price: 199.00, image: "https://m.media-amazon.com/images/I/71i2R+Jk4xL._AC_SL1500_.jpg" },
    { name: "GoPro HERO12 Black", price: 399.99, image: "https://m.media-amazon.com/images/I/61p2fYPHSeL._AC_SL1500_.jpg" },
    { name: "Wilson Evolution Basketball", price: 69.99, image: "https://m.media-amazon.com/images/I/81sGSZNTU8L._AC_SL1500_.jpg" },
    { name: "SKLZ Speed and Agility Ladder", price: 24.99, image: "https://m.media-amazon.com/images/I/61T+CbIoJsL._AC_SL1500_.jpg" },
    { name: "Theragun Mini 2.0", price: 199.00, image: "https://m.media-amazon.com/images/I/61nKX1vEMTL._AC_SL1500_.jpg" },
    { name: "Kelty Lowdown Camp Chair", price: 49.95, image: "https://m.media-amazon.com/images/I/71tLeFN8AGL._AC_SL1500_.jpg" },
    { name: "NordicTrack C 990 Treadmill", price: 1499.00, image: "https://m.media-amazon.com/images/I/71PcZo0LdhL._AC_SL1500_.jpg" },
    { name: "Peloton Bike+", price: 2495.00, image: "https://m.media-amazon.com/images/I/61zAjw4bqPL._AC_SL1500_.jpg" },
    { name: "Hyperice Hypervolt 2 Pro", price: 329.00, image: "https://m.media-amazon.com/images/I/61Uc1CybKNL._AC_SL1500_.jpg" },
    { name: "WHOOP 4.0 Fitness Tracker", price: 239.00, image: "https://m.media-amazon.com/images/I/51x2YpI2fhL._AC_SL1080_.jpg" },
    { name: "Arc'teryx Beta AR Jacket", price: 599.00, image: "https://m.media-amazon.com/images/I/61-k1RhBD-L._AC_SL1500_.jpg" },
    { name: "Black Diamond Spot 400 Headlamp", price: 49.95, image: "https://m.media-amazon.com/images/I/71H7E9d+SSL._AC_SL1500_.jpg" },
    { name: "ENO DoubleNest Hammock", price: 69.95, image: "https://m.media-amazon.com/images/I/81lKz5REOBL._AC_SL1500_.jpg" },
    { name: "MSR PocketRocket 2 Stove", price: 54.95, image: "https://m.media-amazon.com/images/I/61Db+UhSMaL._AC_SL1500_.jpg" },
    { name: "Salomon X Ultra 4 Hiking Shoes", price: 140.00, image: "https://m.media-amazon.com/images/I/71fL0D+2mNL._AC_SL1500_.jpg" },
    { name: "Gregory Baltoro 65 Backpack", price: 320.00, image: "https://m.media-amazon.com/images/I/81sA-L0CKEL._AC_SL1500_.jpg" },
  ],
  "Toys & Games": [
    { name: "LEGO Star Wars Millennium Falcon", price: 169.99, image: "https://m.media-amazon.com/images/I/81Nfhj4gXqL._AC_SL1500_.jpg" },
    { name: "Nintendo Switch Lite Blue", price: 199.99, image: "https://m.media-amazon.com/images/I/61iDumDKRxL._AC_SL1500_.jpg" },
    { name: "Barbie Dreamhouse 2024", price: 199.99, image: "https://m.media-amazon.com/images/I/81-skm0PKKL._AC_SL1500_.jpg" },
    { name: "Hot Wheels Ultimate Garage", price: 89.99, image: "https://m.media-amazon.com/images/I/81KvRCpRzyL._AC_SL1500_.jpg" },
    { name: "Monopoly Classic Board Game", price: 19.99, image: "https://m.media-amazon.com/images/I/81Ul+c-wk0L._AC_SL1500_.jpg" },
    { name: "Nerf Elite 2.0 Commander", price: 29.99, image: "https://m.media-amazon.com/images/I/71GsYnZ3XNL._AC_SL1500_.jpg" },
    { name: "Play-Doh 36-Pack Bundle", price: 24.99, image: "https://m.media-amazon.com/images/I/81+bSGcRGwL._AC_SL1500_.jpg" },
    { name: "Melissa & Doug Wooden Puzzle Set", price: 14.99, image: "https://m.media-amazon.com/images/I/A1p2VCJJFWL._AC_SL1500_.jpg" },
    { name: "Fisher-Price Laugh & Learn Smart Stage", price: 39.99, image: "https://m.media-amazon.com/images/I/81FH29+RfNL._AC_SL1500_.jpg" },
    { name: "Crayola Inspiration Art Set 140pc", price: 34.99, image: "https://m.media-amazon.com/images/I/81pXnJVaYdL._AC_SL1500_.jpg" },
    { name: "UNO Card Game Original", price: 7.99, image: "https://m.media-amazon.com/images/I/81E+0Y8KZ9L._AC_SL1500_.jpg" },
    { name: "Paw Patrol Lookout Tower Playset", price: 69.99, image: "https://m.media-amazon.com/images/I/71pJ8pGJhCL._AC_SL1500_.jpg" },
    { name: "LEGO City Police Station", price: 99.99, image: "https://m.media-amazon.com/images/I/81YQKqGQnCL._AC_SL1500_.jpg" },
    { name: "Razor A5 Lux Scooter", price: 74.99, image: "https://m.media-amazon.com/images/I/61K6sOtFV3L._AC_SL1500_.jpg" },
    { name: "Jenga Classic Block Game", price: 14.99, image: "https://m.media-amazon.com/images/I/71hEXUNBT5L._AC_SL1500_.jpg" },
    { name: "Magna-Tiles Clear Colors 100pc", price: 119.99, image: "https://m.media-amazon.com/images/I/81d5i2D9nYL._AC_SL1500_.jpg" },
    { name: "VTech KidiZoom Creator Cam", price: 49.99, image: "https://m.media-amazon.com/images/I/71Z5DKMZ01L._AC_SL1500_.jpg" },
    { name: "Ticket to Ride Board Game", price: 44.99, image: "https://m.media-amazon.com/images/I/91YNJM4OkmL._AC_SL1500_.jpg" },
    { name: "LOL Surprise OMG Doll", price: 32.99, image: "https://m.media-amazon.com/images/I/81K6w1m8+SL._AC_SL1500_.jpg" },
    { name: "Radio Flyer Classic Red Wagon", price: 119.99, image: "https://m.media-amazon.com/images/I/71Jf4UGSB5L._AC_SL1500_.jpg" },
    { name: "Osmo Genius Starter Kit", price: 99.99, image: "https://m.media-amazon.com/images/I/71A7pEXkxwL._AC_SL1500_.jpg" },
    { name: "Bluey Family House Playset", price: 49.99, image: "https://m.media-amazon.com/images/I/81+n4UHHL4L._AC_SL1500_.jpg" },
    { name: "LEGO Technic Bugatti Chiron", price: 349.99, image: "https://m.media-amazon.com/images/I/81ZpUxFDNDL._AC_SL1500_.jpg" },
    { name: "Risk Global Domination Game", price: 29.99, image: "https://m.media-amazon.com/images/I/91lqD3s1eNL._AC_SL1500_.jpg" },
    { name: "Scrabble Deluxe Edition", price: 34.99, image: "https://m.media-amazon.com/images/I/81L9D9DW+KL._AC_SL1500_.jpg" },
    { name: "Rubik's Cube Original 3x3", price: 12.99, image: "https://m.media-amazon.com/images/I/71YI6+tSqYL._AC_SL1500_.jpg" },
    { name: "Pokemon Trading Card Elite Box", price: 49.99, image: "https://m.media-amazon.com/images/I/81c68lOIp5L._AC_SL1500_.jpg" },
    { name: "Squishmallows 16\" Plush", price: 19.99, image: "https://m.media-amazon.com/images/I/81xh4cp3NHL._AC_SL1500_.jpg" },
    { name: "Catan Board Game", price: 44.99, image: "https://m.media-amazon.com/images/I/81+agFLiB7L._AC_SL1500_.jpg" },
    { name: "Exploding Kittens Card Game", price: 19.99, image: "https://m.media-amazon.com/images/I/91gskC3N2WL._AC_SL1500_.jpg" },
  ],
  "Beauty & Personal Care": [
    { name: "Dyson Airwrap Complete Long", price: 599.99, image: "https://m.media-amazon.com/images/I/61nzJks04QL._SL1500_.jpg" },
    { name: "La Mer Moisturizing Cream 2oz", price: 190.00, image: "https://m.media-amazon.com/images/I/61+P2nv3VIL._SL1500_.jpg" },
    { name: "Olaplex No.3 Hair Perfector", price: 30.00, image: "https://m.media-amazon.com/images/I/71T5zptVpAL._SL1500_.jpg" },
    { name: "Charlotte Tilbury Pillow Talk Palette", price: 75.00, image: "https://m.media-amazon.com/images/I/71hMPkiW6NL._SL1500_.jpg" },
    { name: "Drunk Elephant C-Firma Day Serum", price: 80.00, image: "https://m.media-amazon.com/images/I/61c22lLyC6L._SL1500_.jpg" },
    { name: "Tatcha Dewy Skin Cream", price: 68.00, image: "https://m.media-amazon.com/images/I/51+L4VvmDeL._SL1500_.jpg" },
    { name: "Fenty Beauty Pro Filt'r Foundation", price: 38.00, image: "https://m.media-amazon.com/images/I/51mDpGLbXaL._SL1200_.jpg" },
    { name: "SK-II Facial Treatment Essence 230ml", price: 185.00, image: "https://m.media-amazon.com/images/I/51l6B9mM3ZL._SL1500_.jpg" },
    { name: "ghd Platinum+ Hair Styler", price: 279.00, image: "https://m.media-amazon.com/images/I/61TnXBhdGzL._SL1500_.jpg" },
    { name: "Estee Lauder Advanced Night Repair", price: 75.00, image: "https://m.media-amazon.com/images/I/61iZJVEBLYL._SL1500_.jpg" },
    { name: "MAC Ruby Woo Lipstick", price: 21.00, image: "https://m.media-amazon.com/images/I/61l0bX3xGWL._SL1500_.jpg" },
    { name: "Paula's Choice 2% BHA Exfoliant", price: 32.00, image: "https://m.media-amazon.com/images/I/51FiIPxYbSL._SL1500_.jpg" },
    { name: "Sunday Riley Good Genes Serum", price: 85.00, image: "https://m.media-amazon.com/images/I/51kMNz5y0VL._SL1500_.jpg" },
    { name: "NuFace Trinity Facial Toning Device", price: 339.00, image: "https://m.media-amazon.com/images/I/61XQazlNmjL._SL1500_.jpg" },
    { name: "Ouai Wave Spray", price: 26.00, image: "https://m.media-amazon.com/images/I/51EO0pYYaJL._SL1500_.jpg" },
    { name: "Urban Decay All Nighter Setting Spray", price: 33.00, image: "https://m.media-amazon.com/images/I/61MwJrYuQRL._SL1500_.jpg" },
    { name: "The Ordinary Niacinamide 10%", price: 6.00, image: "https://m.media-amazon.com/images/I/51Z3nVi62ZL._SL1500_.jpg" },
    { name: "Kiehl's Ultra Facial Cream", price: 32.00, image: "https://m.media-amazon.com/images/I/516V8nYL1aL._SL1500_.jpg" },
    { name: "NARS Blush Orgasm", price: 30.00, image: "https://m.media-amazon.com/images/I/61aEsQmfj-L._SL1500_.jpg" },
    { name: "CeraVe Moisturizing Cream 19oz", price: 16.99, image: "https://m.media-amazon.com/images/I/61S7BrCBj7L._SL1500_.jpg" },
    { name: "Dyson Supersonic Hair Dryer", price: 429.99, image: "https://m.media-amazon.com/images/I/61CVoaZCWRL._SL1500_.jpg" },
    { name: "Glossier Boy Brow", price: 17.00, image: "https://m.media-amazon.com/images/I/51hxJGmfqKL._SL1500_.jpg" },
    { name: "Tom Ford Black Orchid Eau de Parfum", price: 150.00, image: "https://m.media-amazon.com/images/I/51k+OujVseL._SL1000_.jpg" },
    { name: "Augustinus Bader The Rich Cream", price: 280.00, image: "https://m.media-amazon.com/images/I/51LH+N0o3vL._SL1500_.jpg" },
    { name: "Rare Beauty Soft Pinch Blush", price: 23.00, image: "https://m.media-amazon.com/images/I/61VLYkVKqZL._SL1500_.jpg" },
    { name: "Oribe Dry Texturizing Spray", price: 49.00, image: "https://m.media-amazon.com/images/I/61KvN8E1K5L._SL1500_.jpg" },
    { name: "Dr. Dennis Gross Peel Pads", price: 88.00, image: "https://m.media-amazon.com/images/I/71-uIqtE-bL._SL1500_.jpg" },
    { name: "Supergoop Unseen Sunscreen SPF 40", price: 38.00, image: "https://m.media-amazon.com/images/I/61RupiB8KNL._SL1500_.jpg" },
    { name: "Chanel No 5 Eau de Parfum", price: 135.00, image: "https://m.media-amazon.com/images/I/61Qj8kkPe0L._SL1500_.jpg" },
    { name: "Tarte Shape Tape Concealer", price: 30.00, image: "https://m.media-amazon.com/images/I/61OKp7MhZ+L._SL1500_.jpg" },
  ],
  "Baby & Kids": [
    { name: "Graco Pack 'n Play Playard", price: 99.99, image: "https://m.media-amazon.com/images/I/71VqXrcNJxL._SL1500_.jpg" },
    { name: "Pampers Swaddlers Size 1 192ct", price: 49.99, image: "https://m.media-amazon.com/images/I/71dKsT3bMFL._SL1500_.jpg" },
    { name: "Ergobaby Omni 360 Carrier", price: 179.00, image: "https://m.media-amazon.com/images/I/71z+I+VlNPL._SL1500_.jpg" },
    { name: "Baby Brezza Formula Pro Advanced", price: 199.99, image: "https://m.media-amazon.com/images/I/71vixMh3TbL._SL1500_.jpg" },
    { name: "UPPAbaby Vista V2 Stroller", price: 969.99, image: "https://m.media-amazon.com/images/I/71RFMnM+tYL._SL1500_.jpg" },
    { name: "Hatch Baby Rest+ Sound Machine", price: 89.99, image: "https://m.media-amazon.com/images/I/61WoZXcYRJL._SL1500_.jpg" },
    { name: "4moms MamaRoo Multi-Motion Swing", price: 219.99, image: "https://m.media-amazon.com/images/I/71d6kJzfuoL._SL1500_.jpg" },
    { name: "Enfamil NeuroPro Infant Formula", price: 39.99, image: "https://m.media-amazon.com/images/I/71tTg4XoeJL._SL1500_.jpg" },
    { name: "Owlet Dream Sock Monitor", price: 299.00, image: "https://m.media-amazon.com/images/I/61m2xTF5roL._SL1500_.jpg" },
    { name: "Skip Hop Explore Activity Center", price: 79.99, image: "https://m.media-amazon.com/images/I/71vSbaqvn4L._SL1500_.jpg" },
    { name: "Nanit Pro Smart Baby Monitor", price: 299.99, image: "https://m.media-amazon.com/images/I/61LMIcuE2qL._SL1500_.jpg" },
    { name: "Chicco KeyFit 35 Car Seat", price: 229.99, image: "https://m.media-amazon.com/images/I/71vhXAqvq1L._SL1500_.jpg" },
    { name: "Huggies Little Snugglers Size 1 198ct", price: 42.99, image: "https://m.media-amazon.com/images/I/81Ueo3C5rkL._SL1500_.jpg" },
    { name: "Baby Jogger City Mini GT2 Stroller", price: 379.99, image: "https://m.media-amazon.com/images/I/71cKVZKiaSL._SL1500_.jpg" },
    { name: "Dr. Brown's Natural Flow Bottle Set", price: 29.99, image: "https://m.media-amazon.com/images/I/71pYk0gWTML._SL1500_.jpg" },
    { name: "Boppy Original Nursing Pillow", price: 39.99, image: "https://m.media-amazon.com/images/I/71ggB2z3ZZL._SL1500_.jpg" },
    { name: "Medela Pump In Style with MaxFlow", price: 299.99, image: "https://m.media-amazon.com/images/I/71MYPzLJoSL._SL1500_.jpg" },
    { name: "Bumbo Multi Seat", price: 54.99, image: "https://m.media-amazon.com/images/I/71U3WPAqbKL._SL1500_.jpg" },
    { name: "Aden + Anais Swaddle Blankets 4-Pack", price: 49.99, image: "https://m.media-amazon.com/images/I/71oU5y3TdRL._SL1500_.jpg" },
    { name: "Fisher-Price Deluxe Kick & Play Gym", price: 54.99, image: "https://m.media-amazon.com/images/I/81I4WM+NSmL._SL1500_.jpg" },
    { name: "Nuna PIPA Lite LX Car Seat", price: 449.95, image: "https://m.media-amazon.com/images/I/61ZLSQ8KWnL._SL1500_.jpg" },
    { name: "Spectra S1 Plus Breast Pump", price: 199.99, image: "https://m.media-amazon.com/images/I/61a9NQDpYvL._SL1200_.jpg" },
    { name: "Doona Car Seat & Stroller", price: 550.00, image: "https://m.media-amazon.com/images/I/71sjfI8lJXL._SL1500_.jpg" },
    { name: "BabyBjorn Bouncer Bliss", price: 229.99, image: "https://m.media-amazon.com/images/I/71mB+vTYkkL._SL1500_.jpg" },
    { name: "Snoo Smart Sleeper Bassinet", price: 1695.00, image: "https://m.media-amazon.com/images/I/71WgjRvl3eL._SL1500_.jpg" },
    { name: "Elvie Double Electric Breast Pump", price: 499.00, image: "https://m.media-amazon.com/images/I/61FyxAejN3L._SL1500_.jpg" },
    { name: "Cybex Sirona S Convertible Car Seat", price: 499.95, image: "https://m.media-amazon.com/images/I/61hpyG2Vy1L._SL1500_.jpg" },
    { name: "Bugaboo Fox 5 Stroller", price: 1449.00, image: "https://m.media-amazon.com/images/I/61I8TyKXV0L._SL1500_.jpg" },
    { name: "Lovevery Play Gym", price: 140.00, image: "https://m.media-amazon.com/images/I/81A6UyPGT0L._SL1500_.jpg" },
    { name: "Newton Baby Crib Mattress", price: 299.99, image: "https://m.media-amazon.com/images/I/81hPd9Y5iIL._SL1500_.jpg" },
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

    // Generate unique products - NO duplicates, each product has unique image
    for (const [categoryName, templates] of Object.entries(productTemplates)) {
      const categoryId = categoryMap.get(categoryName);
      if (!categoryId) continue;

      for (const template of templates) {
        const stock = Math.floor(Math.random() * 150) + 10;
        const rating = 3.5 + Math.random() * 1.5; // 3.5 to 5.0
        const hasDiscount = Math.random() > 0.6; // 40% chance of discount
        
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

    console.log(`Preparing to insert ${productsToInsert.length} unique products`);

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
        message: `Successfully seeded ${inserted} unique products with unique images`,
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
