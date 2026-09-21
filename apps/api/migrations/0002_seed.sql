INSERT OR IGNORE INTO stores (id,name,slug,domain,reliability_score) VALUES
('store_petslike','Petslike','petslike','petslike.ua',94),
('store_foxtrot','Foxtrot','foxtrot','foxtrot.com.ua',92),
('store_varus','VARUS','varus','varus.ua',90),
('store_comfy','COMFY','comfy','comfy.ua',93),
('store_novus','NOVUS','novus','novus.ua',91),
('store_atb','АТБ','atb','atbmarket.com',89);

INSERT OR IGNORE INTO store_locations (id,store_id,name,address,city,lat,lng) VALUES
('loc_petslike_1','store_petslike','Petslike Софіївська Борщагівка','вул. Соборна, 105/2','Київ',50.3202,30.2971),
('loc_foxtrot_1','store_foxtrot','Foxtrot Respublika Park','Кільцева дорога, 1','Київ',50.3188,30.2912),
('loc_varus_1','store_varus','VARUS Кільцева','Кільцева дорога, 12','Київ',50.3230,30.3050),
('loc_comfy_1','store_comfy','COMFY Академмістечко','просп. Академіка Палладіна, 16','Київ',50.3140,30.2880),
('loc_novus_1','store_novus','NOVUS Петропавлівська Борщагівка','вул. Велика Кільцева, 4','Київ',50.3270,30.2980),
('loc_atb_1','store_atb','АТБ Жуляни','вул. Київська, 2','Київ',50.3100,30.3100);

INSERT OR IGNORE INTO products (id,slug,name,brand,model,variant,category,gtin,description) VALUES
('prod_monge_15','monge-puppy-junior-15kg','Monge Puppy & Junior 15 кг','Monge','Puppy & Junior','Duck & Rice','Тварини','8009470011702','Повнораціонний сухий корм для цуценят.'),
('prod_airpods','apple-airpods-pro-usb-c','Apple AirPods Pro','Apple','AirPods Pro','USB-C','Техніка','0195949052651','Бездротові навушники з активним шумозаглушенням.'),
('prod_lavazza','lavazza-crema-e-aroma-1kg','Lavazza Crema e Aroma 1 кг','Lavazza','Crema e Aroma','1 кг','Продукти','8000070024908','Кава в зернах.'),
('prod_roborock','roborock-q8-max','Roborock Q8 Max','Roborock','Q8 Max',NULL,'Дім',NULL,'Робот-пилосос із вологим прибиранням.'),
('prod_cola','coca-cola-original-2l','Coca-Cola 2 л','Coca-Cola','Original Taste','2 л','Продукти','5449000000996','Безалкогольний газований напій.'),
('prod_persil','persil-deep-clean-45kg','Persil Deep Clean 4,5 кг','Persil','Deep Clean','4,5 кг','Дім',NULL,'Пральний порошок для автоматичного прання.');

INSERT OR IGNORE INTO offers (id,product_id,store_id,store_location_id,external_sku,title_raw,external_url,price,old_price,delivery_price,availability,checked_at) VALUES
('offer_monge','prod_monge_15','store_petslike','loc_petslike_1','monge-15','Monge Puppy & Junior Duck & Rice 15 кг','https://petslike.ua/',2690,3340,0,'in_stock',CURRENT_TIMESTAMP),
('offer_airpods','prod_airpods','store_foxtrot','loc_foxtrot_1','airpods-pro-usbc','Apple AirPods Pro USB-C','https://www.foxtrot.com.ua/',6899,8499,0,'in_stock',CURRENT_TIMESTAMP),
('offer_lavazza','prod_lavazza','store_varus','loc_varus_1','lavazza-1kg','Lavazza Crema e Aroma 1 кг','https://varus.ua/',499,729,0,'in_stock',CURRENT_TIMESTAMP),
('offer_roborock','prod_roborock','store_comfy','loc_comfy_1','q8-max','Roborock Q8 Max','https://comfy.ua/',13799,15999,0,'in_stock',CURRENT_TIMESTAMP),
('offer_cola','prod_cola','store_novus','loc_novus_1','cola-2l','Coca-Cola Original Taste 2 л','https://novus.online/',49.9,74.9,0,'in_stock',CURRENT_TIMESTAMP),
('offer_persil','prod_persil','store_atb','loc_atb_1','persil-45','Persil Deep Clean 4,5 кг','https://www.atbmarket.com/',399,589,0,'in_stock',CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO price_history (id,offer_id,price,captured_at) VALUES
(1,'offer_monge',3190,'2026-04-01'),(2,'offer_monge',3099,'2026-05-01'),(3,'offer_monge',2999,'2026-06-01'),(4,'offer_monge',2840,'2026-08-01'),(5,'offer_monge',2690,'2026-09-20'),
(6,'offer_airpods',8999,'2026-04-01'),(7,'offer_airpods',8499,'2026-07-01'),(8,'offer_airpods',7799,'2026-08-15'),(9,'offer_airpods',6899,'2026-09-20'),
(10,'offer_lavazza',749,'2026-06-01'),(11,'offer_lavazza',729,'2026-08-01'),(12,'offer_lavazza',499,'2026-09-20'),
(13,'offer_roborock',16999,'2026-06-01'),(14,'offer_roborock',15999,'2026-08-01'),(15,'offer_roborock',13799,'2026-09-20'),
(16,'offer_cola',79.9,'2026-07-01'),(17,'offer_cola',74.9,'2026-08-01'),(18,'offer_cola',49.9,'2026-09-20'),
(19,'offer_persil',619,'2026-06-01'),(20,'offer_persil',589,'2026-08-01'),(21,'offer_persil',399,'2026-09-20');

INSERT OR REPLACE INTO deal_scores (offer_id,score,avg_30,min_180,real_discount_pct) VALUES
('offer_monge',94,3118,2649,13.7),('offer_airpods',91,7990,6799,13.7),
('offer_lavazza',96,684,489,27.0),('offer_roborock',88,15120,13299,8.7),
('offer_cola',92,69.9,44.9,28.6),('offer_persil',90,535,379,25.4);
