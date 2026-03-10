create database if not exists flipkart;
use flipkart;

-- Users
create table users (
    id int auto_increment primary key,
    name varchar(100) not null,
    email varchar(100) unique not null,
    password varchar(255) not null,
    phone varchar(15),
    created_at timestamp default current_timestamp
);

-- Categories
create table categories (
    id int auto_increment primary key,
    name varchar(100) not null,
    image_url varchar(500)
);

-- Products
create table products (
    id int auto_increment primary key,
    name varchar(255) not null,
    description text,
    price decimal(10, 2) not null,
    discount_price decimal(10, 2),
    category_id int,
    brand varchar(100),
    image_url varchar(500),
    rating decimal(2, 1) default 0,
    stock int default 0,
    created_at timestamp default current_timestamp,
    foreign key (category_id) references categories(id)
);

-- Cart 
create table cart (
    id int auto_increment primary key,
    user_id int not null,
    product_id int not null,
    quantity int default 1,
    created_at timestamp default current_timestamp,
    foreign key (user_id) references users(id),
    foreign key (product_id) references products(id)
);

-- Orders
create table orders (
    id int auto_increment primary key,
    user_id int not null,
    total_amount decimal(10, 2) not null,
    status enum('pending', 'processing', 'shipped', 'delivered', 'cancelled') default 'pending',
    shipping_address text,
    created_at timestamp default current_timestamp,
    foreign key (user_id) references users(id)
);

-- Order Items
create table order_items (
    id int auto_increment primary key,
    order_id int not null,
    product_id int not null,
    quantity int not null,
    price decimal(10, 2) not null,
    foreign key (order_id) references orders(id),
    foreign key (product_id) references products(id)
);

-- Insert Categories
insert into categories (name, image_url) values
('Electronics', 'https://rukminim1.flixcart.com/flap/80/80/image/69c6589653afdb9a.png?q=100'),
('Men', 'https://rukminim2.flixcart.com/image/612/612/xif0q/shirt/h/c/k/m-dark-lightblue-rodeiz-original-imahjyqpbg3dpuu8.jpeg?q=70'),
('Women', 'https://rukminim2.flixcart.com/image/612/612/xif0q/shirt/z/w/f/m-shirt-butclub-original-imahggr9pvzcykxs.jpeg?q=70'),
('Home & Furniture', 'https://rukminim2.flixcart.com/image/612/612/xif0q/bed-mattress/y/2/v/normal-top-single-5-30-72-smartgrid-orthopedic-aiha-certified-original-imahd63afkhq9fjc.jpeg?q=70'),
('Sports, Fitness & Outdoors', 'https://rukminim2.flixcart.com/image/612/612/xif0q/short/n/e/f/s-men-colourblock-2-in-1-sports-shorts-culish-original-imahhqc3ty2dk8ug.jpeg?q=70'),
('Books', 'https://rukminim2.flixcart.com/image/612/612/xif0q/regionalbooks/6/x/w/psychology-of-money-rich-dad-english-combo-original-imahfzf73vfc7wfu.jpeg?q=70');

-- Insert Products (with Flipkart image URLs)
insert into products (name, description, price, discount_price, category_id, brand, image_url, rating, stock) values
('iPhone 15 Pro Max 256GB', 'Apple iPhone 15 Pro Max with A17 Pro chip, 48MP camera system, titanium design', 159900.00, 144900.00, 1, 'Apple', 'https://rukminim1.flixcart.com/image/312/312/xif0q/mobile/h/d/9/-original-imagtc2qzgnnuhxh.jpeg?q=70', 4.5, 50),
('Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24 Ultra with Galaxy AI, 200MP camera, S Pen included', 134999.00, 119999.00, 1, 'Samsung', 'https://rukminim2.flixcart.com/image/312/312/xif0q/mobile/j/m/z/-original-imahgfmxumntk7sy.jpeg?q=70', 4.4, 45),
('OnePlus 12 5G', 'OnePlus 12 5G with Snapdragon 8 Gen 3, Hasselblad Camera, 100W Fast Charging', 64999.00, 59999.00, 1, 'OnePlus', 'https://rukminim2.flixcart.com/image/312/312/xif0q/mobile/7/z/j/12-cph2573-oneplus-original-imahjngudb3jjkew.jpeg?q=70', 4.3, 100),
('Redmi Note 13 Pro', 'Redmi Note 13 Pro with 200MP camera, 120Hz AMOLED display, 67W turbo charging', 24999.00, 22999.00, 1, 'Redmi', 'https://rukminim2.flixcart.com/image/312/312/xif0q/mobile/p/8/i/-original-imagwu89u7fgsq4b.jpeg?q=70', 4.2, 200),
('Samsung 55" QLED 4K TV', 'Samsung 55 inch QLED 4K Smart TV with Quantum Processor, Tizen OS', 79990.00, 64990.00, 2, 'Samsung', 'https://rukminim2.flixcart.com/image/312/312/xif0q/television/x/6/y/-original-imahj8ydsgh6pmbm.jpeg?q=70', 4.3, 30),
('LG 1.5 Ton Inverter AC', 'LG 1.5 Ton 5 Star Inverter Split AC with Dual Inverter, HD Filter', 45990.00, 39990.00, 2, 'LG', 'https://rukminim2.flixcart.com/image/312/312/xif0q/air-conditioner-new/d/7/f/-original-imahdr4apzpuydyq.jpeg?q=70', 4.4, 25),
('Sony WH-1000XM5 Headphones', 'Sony Wireless Noise Cancelling Headphones with 30hr Battery, Multipoint', 29990.00, 26990.00, 1, 'Sony', 'https://rukminim2.flixcart.com/image/612/612/xif0q/headphone/o/g/7/-original-imahgr29hqgfsmww.jpeg?q=70', 4.6, 60),
('Apple Watch Series 9', 'Apple Watch Series 9 GPS + Cellular, 45mm with new S9 chip', 49900.00, 44900.00, 1, 'Apple', 'https://rukminim2.flixcart.com/image/612/612/xif0q/smartwatch/n/0/b/-original-imagte4szynag8uy.jpeg?q=70', 4.5, 40),
('Men Navy Blue Slim Fit Blazer', 'Men Navy Blue Formal Slim Fit Blazer for weddings and parties', 5999.00, 2999.00, 3, 'Manyavar', 'https://rukminim2.flixcart.com/image/612/612/xif0q/blazer/e/d/p/l-ex-3019-navyblue-showoff-original-imahf3aqzhd5thfg.jpeg?q=70', 4.1, 150),
('Men Casual Tshirt Pack of 3', 'Men Cotton Crew Neck T-Shirt Pack of 3, Comfortable Daily Wear', 1499.00, 899.00, 3, 'Dennis Lingo', 'https://rukminim2.flixcart.com/image/612/612/xif0q/t-shirt/y/r/q/m-tmr-wt-nvrnplaind164-tripr-resized-2-original-imah7usgxhfudvxz.jpeg?q=70', 4.0, 500),
('Women Printed Kurta Set', 'Women Rayon Printed Kurta with Palazzos, Perfect for Festive Season', 2499.00, 1499.00, 4, 'Biba', 'https://rukminim2.flixcart.com/image/612/612/xif0q/salwar-kurta-dupatta/z/o/i/3xl-two-print-kundi-original-imahjmebdqyzhzeg.jpeg?q=70', 4.2, 200),
('Women Embroidered Saree', 'Women Banarasi Silk Embroidered Saree with Blouse Piece', 3999.00, 2499.00, 4, 'Satrani', 'https://rukminim2.flixcart.com/image/612/612/xif0q/sari/4/u/j/free-siya1-siy-silk-unstitched-original-imah2zcpgat2yzms.jpeg?q=70', 4.3, 80),
('Sofa Set 3+2 Seater', 'Premium Fabric Sofa Set 3+2 Seater with Cushions, Modern Design', 45999.00, 35999.00, 5, 'Furny', 'https://rukminim2.flixcart.com/image/612/612/xif0q/sofa-set/f/a/y/45-55-coffee-jute-3-2-1-183-20-45-20-7-183-55022-wooden-original-imah8ud8ezukkyvw.jpeg?q=70', 4.1, 15),
('King Size Bed with Storage', 'Engineered Wood King Size Bed with Hydraulic Storage, Walnut Finish', 32999.00, 27999.00, 5, 'HomeTown', 'https://rukminim2.flixcart.com/image/612/612/xif0q/sofa-sectional/p/f/t/-original-imahggffcwfyvgyy.jpeg?q=70', 4.0, 20),
('Cricket Bat English Willow', 'SG English Willow Cricket Bat with Cover, Full Size Mens', 5999.00, 4499.00, 6, 'SG', 'https://rukminim2.flixcart.com/image/612/612/xif0q/bat/t/d/e/1-gm-diamond-handcrafted-6-na-grade-1-willow-master-original-imah6ehcm7zuhbga.jpeg?q=70', 4.4, 100),
('Yoga Mat Premium', 'Anti-Skid Premium Yoga Mat 6mm Thick with Carry Strap', 1299.00, 799.00, 6, 'Boldfit', 'https://rukminim2.flixcart.com/image/612/612/xif0q/sport-mat/2/d/h/6mm-super-sports-yoga-mat-for-mens-women-kids-6-60-yfmats-180-original-imahfgrz9rpsj6qf.jpeg?q=70', 4.2, 300),
('Laptop HP Pavilion 15', 'HP Pavilion 15 Laptop Intel i5 12th Gen, 8GB RAM, 512GB SSD, Windows 11', 65999.00, 54999.00, 1, 'HP', 'https://rukminim2.flixcart.com/image/312/312/xif0q/computer/t/v/8/-original-imahg5fxfpvjasap.jpeg?q=70', 4.3, 35),
('Boat Airdopes 141', 'Boat Airdopes 141 TWS Earbuds with 42H Playtime, ENx Technology', 2990.00, 1299.00, 1, 'Boat', 'https://rukminim2.flixcart.com/image/612/612/xif0q/headphone/h/z/9/-original-imahgmgzvdgec4ae.jpeg?q=70', 4.0, 1000),
('Realme Pad 2', 'Realme Pad 2 with 11.5 inch display, Helio G99, 4GB RAM, 64GB Storage', 19999.00, 16999.00, 1, 'Realme', 'https://rukminim2.flixcart.com/image/312/312/xif0q/tablet/o/y/8/rmp2204-realme-original-imagrhcqdhdyc9tg.jpeg?q=70', 4.1, 70),
('Dining Table 6 Seater', 'Sheesham Wood 6 Seater Dining Table with Chairs, Modern Design', 35999.00, 28999.00, 5, 'Mudra', 'https://rukminim2.flixcart.com/image/612/612/xif0q/dining-set/l/z/n/144-78-purple-0-144-78-rosewood-sheesham-18-43-18-rectangle-73-original-imagp8q73g3tygsf.jpeg?q=70', 4.2, 12);