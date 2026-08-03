-- DrukAgriLink demo seed — ALL people, phones, orgs are fictional.
-- Run AFTER 0001_init.sql, in the Supabase SQL editor.
-- Every demo account password is:  Druk@2024
-- Emails: farmer1@druk.demo .. farmer8, buyer1..3, transport1..2, coordinator@druk.demo
--
-- NOTE: seeding auth.users via SQL is Supabase-version dependent. If login fails,
-- create the accounts in Auth > Users (same emails/password) reusing the profile ids
-- below, or register fresh accounts through the app UI.

create or replace function seed_user(uid uuid, mail text) returns void as $$
begin
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change, raw_app_meta_data, raw_user_meta_data)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated','authenticated',
    mail, crypt('Druk@2024', gen_salt('bf')), now(), now(), now(), '', '', '', '',
    '{"provider":"email","providers":["email"]}', '{}')
  on conflict (id) do nothing;
  insert into auth.identities (id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text,
    format('{"sub":"%s","email":"%s"}', uid, mail)::jsonb, 'email', now(), now(), now())
  on conflict do nothing;
end $$ language plpgsql;

-- ids (all valid hex): farmer 1111..0N, buyer 2222..0N, transport 3333..0N,
-- coordinator 4444..01, product 5555..0N, farm 6666..0N, listing 7777..0N,
-- buyer_org 8888..0N, order 9999..0N, vehicle aaaa..0N, proposal bbbb..0N, alloc cccc..0N
select seed_user('11111111-0000-0000-0000-000000000001','farmer1@druk.demo');
select seed_user('11111111-0000-0000-0000-000000000002','farmer2@druk.demo');
select seed_user('11111111-0000-0000-0000-000000000003','farmer3@druk.demo');
select seed_user('11111111-0000-0000-0000-000000000004','farmer4@druk.demo');
select seed_user('11111111-0000-0000-0000-000000000005','farmer5@druk.demo');
select seed_user('11111111-0000-0000-0000-000000000006','farmer6@druk.demo');
select seed_user('11111111-0000-0000-0000-000000000007','farmer7@druk.demo');
select seed_user('11111111-0000-0000-0000-000000000008','farmer8@druk.demo');
select seed_user('22222222-0000-0000-0000-000000000001','buyer1@druk.demo');
select seed_user('22222222-0000-0000-0000-000000000002','buyer2@druk.demo');
select seed_user('22222222-0000-0000-0000-000000000003','buyer3@druk.demo');
select seed_user('33333333-0000-0000-0000-000000000001','transport1@druk.demo');
select seed_user('33333333-0000-0000-0000-000000000002','transport2@druk.demo');
select seed_user('44444444-0000-0000-0000-000000000001','coordinator@druk.demo');

insert into profiles (id, full_name, role, phone, dzongkhag, gewog) values
 ('11111111-0000-0000-0000-000000000001','Dorji Wangchuk','farmer','+975-17-000001','Thimphu','Kawang'),
 ('11111111-0000-0000-0000-000000000002','Pema Lhamo','farmer','+975-17-000002','Paro','Lamgong'),
 ('11111111-0000-0000-0000-000000000003','Sonam Tobgay','farmer','+975-17-000003','Punakha','Guma'),
 ('11111111-0000-0000-0000-000000000004','Kinley Om','farmer','+975-17-000004','Wangdue Phodrang','Phobji'),
 ('11111111-0000-0000-0000-000000000005','Tashi Penjor','farmer','+975-17-000005','Chukha','Bongo'),
 ('11111111-0000-0000-0000-000000000006','Choki Dema','farmer','+975-17-000006','Paro','Doteng'),
 ('11111111-0000-0000-0000-000000000007','Ugyen Dorji','farmer','+975-17-000007','Thimphu','Mewang'),
 ('11111111-0000-0000-0000-000000000008','Yeshey Zangmo','farmer','+975-17-000008','Punakha','Toewang'),
 ('22222222-0000-0000-0000-000000000001','Namgay Retail Buyer','buyer','+975-17-000201','Thimphu','Chang'),
 ('22222222-0000-0000-0000-000000000002','Rinchen Hotel Buyer','buyer','+975-17-000202','Paro','Lango'),
 ('22222222-0000-0000-0000-000000000003','Druk School Kitchen','buyer','+975-17-000203','Thimphu','Chang'),
 ('33333333-0000-0000-0000-000000000001','Sangay Transport','transport','+975-17-000301','Thimphu','Chang'),
 ('33333333-0000-0000-0000-000000000002','Gyeltshen Logistics','transport','+975-17-000302','Wangdue Phodrang','Thedtsho'),
 ('44444444-0000-0000-0000-000000000001','Karma Coordinator','coordinator','+975-17-000401','Thimphu','Chang')
on conflict (id) do nothing;

insert into products (id, name, category, default_unit) values
 ('55555555-0000-0000-0000-000000000001','Potato','vegetable','kg'),
 ('55555555-0000-0000-0000-000000000002','Chilli','vegetable','kg'),
 ('55555555-0000-0000-0000-000000000003','Tomato','vegetable','kg'),
 ('55555555-0000-0000-0000-000000000004','Cabbage','vegetable','kg'),
 ('55555555-0000-0000-0000-000000000005','Apple','fruit','kg')
on conflict (name) do nothing;

-- farms; two are cooperative "groups"
insert into farms (id, farmer_id, name, dzongkhag, gewog, size_acres) values
 ('66666666-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','Kawang Highland Farm','Thimphu','Kawang',3.5),
 ('66666666-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002','Paro Valley Coop (Group A)','Paro','Lamgong',5.0),
 ('66666666-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003','Guma Riverside Farm','Punakha','Guma',4.2),
 ('66666666-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000004','Phobji Meadow Farm','Wangdue Phodrang','Phobji',2.8),
 ('66666666-0000-0000-0000-000000000005','11111111-0000-0000-0000-000000000005','Bongo Hillside Farm','Chukha','Bongo',3.0),
 ('66666666-0000-0000-0000-000000000006','11111111-0000-0000-0000-000000000006','Doteng Apple Coop (Group B)','Paro','Doteng',6.5),
 ('66666666-0000-0000-0000-000000000007','11111111-0000-0000-0000-000000000007','Mewang Family Farm','Thimphu','Mewang',2.0),
 ('66666666-0000-0000-0000-000000000008','11111111-0000-0000-0000-000000000008','Toewang Terrace Farm','Punakha','Toewang',3.3)
on conflict (id) do nothing;

insert into harvest_listings (id, farmer_id, farm_id, product_id, forecast_qty, available_qty, unit, expected_harvest_date, min_price, dzongkhag, gewog, quality_grade, status) values
 ('77777777-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','66666666-0000-0000-0000-000000000001','55555555-0000-0000-0000-000000000001',800,800,'kg', current_date + 10, 32.00,'Thimphu','Kawang','A','available'),
 ('77777777-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002','66666666-0000-0000-0000-000000000002','55555555-0000-0000-0000-000000000001',600,500,'kg', current_date + 8, 30.00,'Paro','Lamgong','A','available'),
 ('77777777-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003','66666666-0000-0000-0000-000000000003','55555555-0000-0000-0000-000000000001',400,400,'kg', current_date + 12, 31.00,'Punakha','Guma','B','available'),
 ('77777777-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000004','66666666-0000-0000-0000-000000000004','55555555-0000-0000-0000-000000000002',300,300,'kg', current_date + 6, 85.00,'Wangdue Phodrang','Phobji','A','available'),
 ('77777777-0000-0000-0000-000000000005','11111111-0000-0000-0000-000000000005','66666666-0000-0000-0000-000000000005','55555555-0000-0000-0000-000000000003',500,450,'kg', current_date + 5, 40.00,'Chukha','Bongo','B','available'),
 ('77777777-0000-0000-0000-000000000006','11111111-0000-0000-0000-000000000006','66666666-0000-0000-0000-000000000006','55555555-0000-0000-0000-000000000005',1000,1000,'kg', current_date + 20, 55.00,'Paro','Doteng','A','available'),
 ('77777777-0000-0000-0000-000000000007','11111111-0000-0000-0000-000000000007','66666666-0000-0000-0000-000000000007','55555555-0000-0000-0000-000000000004',700,700,'kg', current_date + 9, 25.00,'Thimphu','Mewang','A','available'),
 ('77777777-0000-0000-0000-000000000008','11111111-0000-0000-0000-000000000008','66666666-0000-0000-0000-000000000008','55555555-0000-0000-0000-000000000001',350,350,'kg', current_date + 11, 33.00,'Punakha','Toewang','A','draft')
on conflict (id) do nothing;

insert into buyer_organizations (id, owner_id, name, contact_phone, address) values
 ('88888888-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001','Namgay Supermarket','+975-2-000101','Norzin Lam, Thimphu'),
 ('88888888-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000002','Rinchen Resort & Hotel','+975-8-000102','Paro Town'),
 ('88888888-0000-0000-0000-000000000003','22222222-0000-0000-0000-000000000003','Druk Central School','+975-2-000103','Motithang, Thimphu')
on conflict (id) do nothing;

insert into buyer_orders (id, buyer_org_id, product_id, required_qty, unit, offered_price, required_delivery_date, delivery_location, min_quality_grade, status) values
 ('99999999-0000-0000-0000-000000000001','88888888-0000-0000-0000-000000000001','55555555-0000-0000-0000-000000000001',1500,'kg',35.00, current_date + 14,'Namgay Supermarket, Thimphu','B','open'),
 ('99999999-0000-0000-0000-000000000002','88888888-0000-0000-0000-000000000002','55555555-0000-0000-0000-000000000002',250,'kg',95.00, current_date + 7,'Rinchen Resort, Paro','A','open'),
 ('99999999-0000-0000-0000-000000000003','88888888-0000-0000-0000-000000000003','55555555-0000-0000-0000-000000000004',600,'kg',28.00, current_date + 12,'Druk Central School, Thimphu','A','open')
on conflict (id) do nothing;

insert into vehicles (id, provider_id, registration_no, vehicle_type, capacity_kg, refrigerated, service_area, available) values
 ('aaaaaaaa-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','BP-1-A1234','Pickup truck',1500,false,'Thimphu, Paro',true),
 ('aaaaaaaa-0000-0000-0000-000000000002','33333333-0000-0000-0000-000000000001','BP-1-A5678','Refrigerated van',1000,true,'Thimphu, Punakha',true),
 ('aaaaaaaa-0000-0000-0000-000000000003','33333333-0000-0000-0000-000000000002','BP-2-B4321','Light truck',3000,false,'Wangdue, Chukha, Thimphu',true)
on conflict (id) do nothing;

insert into match_proposals (id, coordinator_id, buyer_order_id, status, explanation, buyer_approved) values
 ('bbbbbbbb-0000-0000-0000-000000000001','44444444-0000-0000-0000-000000000001','99999999-0000-0000-0000-000000000001','pending_farmers',
  'This proposal combines potato from three farmers and fulfils 93% of the buyer''s 1500 kg request. All harvests are available before the delivery date and their minimum prices sit within the Nu. 35/kg offer.', false),
 ('bbbbbbbb-0000-0000-0000-000000000002','44444444-0000-0000-0000-000000000001','99999999-0000-0000-0000-000000000002','pending_buyer',
  'A single Phobji chilli harvest covers 250 kg (100%) at grade A, meeting the buyer''s quality requirement and delivery date.', true)
on conflict (id) do nothing;

insert into match_allocations (id, proposal_id, listing_id, farmer_id, allocated_qty, unit_price, status) values
 ('cccccccc-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','77777777-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001',800,33.00,'accepted'),
 ('cccccccc-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000001','77777777-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002',500,33.00,'proposed'),
 ('cccccccc-0000-0000-0000-000000000003','bbbbbbbb-0000-0000-0000-000000000001','77777777-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003',100,33.00,'proposed'),
 ('cccccccc-0000-0000-0000-000000000004','bbbbbbbb-0000-0000-0000-000000000002','77777777-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000004',250,90.00,'accepted')
on conflict (id) do nothing;

insert into notifications (user_id, title, body) values
 ('11111111-0000-0000-0000-000000000001','New match proposal','You have an allocation of 800 kg potato in a new proposal.'),
 ('22222222-0000-0000-0000-000000000001','Proposal ready','A coordinator proposed supply for your 1500 kg potato order.')
on conflict do nothing;

drop function seed_user(uuid, text);
