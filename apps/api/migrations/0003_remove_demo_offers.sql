-- The original seed used illustrative prices and store homepages, not actual offers.
-- Preserve products, saved items and requests; remove only the six untouched demo offers.
DELETE FROM offers WHERE
  (id='offer_monge' AND external_url='https://petslike.ua/') OR
  (id='offer_airpods' AND external_url='https://www.foxtrot.com.ua/') OR
  (id='offer_lavazza' AND external_url='https://varus.ua/') OR
  (id='offer_roborock' AND external_url='https://comfy.ua/') OR
  (id='offer_cola' AND external_url='https://novus.online/') OR
  (id='offer_persil' AND external_url='https://www.atbmarket.com/');

-- These are verified exact product pages, not price observations or paid offers.
ALTER TABLE products ADD COLUMN reference_url TEXT;
ALTER TABLE products ADD COLUMN reference_store TEXT;
UPDATE products SET reference_url='https://petslike.ua/dog-medium-puppy-junior-sukhii-korm-iz-kurkoiu-ta-risom-dlia-tsutseniat-i-iunioriv-serednikh-porid',reference_store='Petslike' WHERE id='prod_monge_15';
UPDATE products SET reference_url='https://www.foxtrot.com.ua/uk/shop/naushniki_apple_garnitura_apple_airpods_pro_2nd_generation_with_magsafe_charging_case_usb_c.html',reference_store='Foxtrot' WHERE id='prod_airpods';
UPDATE products SET reference_url='https://comfy.ua/ua/robot-pylesos-mojuschij-roborock-vacuum-cleaner-q8-max-black.html',reference_store='COMFY' WHERE id='prod_roborock';
UPDATE products SET reference_url='https://novus.zakaz.ua/uk/products/napii-koka-kola-2000ml--05449000000286/',reference_store='NOVUS' WHERE id='prod_cola';
