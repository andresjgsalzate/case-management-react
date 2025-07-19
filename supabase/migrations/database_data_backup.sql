SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', 'c022f5ee-c7bc-44f5-8aec-2be662821691', '{"action":"user_signedup","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-07-05 14:27:51.986659+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd3cc0853-ede2-471d-9272-9fe11e24febb', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 14:27:51.993683+00', ''),
	('00000000-0000-0000-0000-000000000000', '85ec870b-1062-472b-8f45-c24552dda584', '{"action":"user_signedup","actor_id":"e50d9be4-9278-40ec-934d-e1ce2fcf65d4","actor_username":"test-1751725739147@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-07-05 14:29:00.630952+00', ''),
	('00000000-0000-0000-0000-000000000000', '4eb5b04e-3df8-4bc9-964d-5721a0e13a3e', '{"action":"login","actor_id":"e50d9be4-9278-40ec-934d-e1ce2fcf65d4","actor_username":"test-1751725739147@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 14:29:00.634019+00', ''),
	('00000000-0000-0000-0000-000000000000', '72483c3d-b581-4b4b-8df2-36939f57839e', '{"action":"login","actor_id":"e50d9be4-9278-40ec-934d-e1ce2fcf65d4","actor_username":"test-1751725739147@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 14:29:00.890196+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a77a988a-9189-46e7-9b2d-b0c904a6b817', '{"action":"logout","actor_id":"e50d9be4-9278-40ec-934d-e1ce2fcf65d4","actor_username":"test-1751725739147@example.com","actor_via_sso":false,"log_type":"account"}', '2025-07-05 14:29:01.616594+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c791245e-730e-4316-b9c9-48fa67c5243b', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 14:29:54.975139+00', ''),
	('00000000-0000-0000-0000-000000000000', 'db1d244e-0e18-4a13-b268-9c8e67409c12', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-05 15:34:37.039844+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c2b255ed-5974-42f7-8691-c028861ea9b2', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-05 15:34:37.041305+00', ''),
	('00000000-0000-0000-0000-000000000000', '42159578-5ee7-4680-8f12-8fc8b3a0e1cb', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-05 15:34:42.704331+00', ''),
	('00000000-0000-0000-0000-000000000000', '9a14583d-5d38-4cc0-a138-37a1e8004845', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 15:35:09.294456+00', ''),
	('00000000-0000-0000-0000-000000000000', '4cbf9f41-e695-48cc-83c5-8506c3a9dbfc', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 16:07:38.203251+00', ''),
	('00000000-0000-0000-0000-000000000000', '5068c9f8-516f-456e-811c-f20230bb5a94', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 16:11:50.460164+00', ''),
	('00000000-0000-0000-0000-000000000000', '60f967b2-7de3-41b8-b247-67b49afdeba6', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 16:14:10.73876+00', ''),
	('00000000-0000-0000-0000-000000000000', '679d8874-3755-4c21-8715-607d41c3e6f2', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-05 17:14:24.565382+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cb95c6b8-d321-473a-b3da-9ff122c6a240', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-05 17:14:24.567472+00', ''),
	('00000000-0000-0000-0000-000000000000', '459a6e44-1003-4b4f-a393-908c74b1021e', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-05 18:13:29.693295+00', ''),
	('00000000-0000-0000-0000-000000000000', '41659b5f-625f-4596-a5d8-b3ed4168fa94', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-05 18:13:29.698821+00', ''),
	('00000000-0000-0000-0000-000000000000', '1dc360de-2318-4726-9f5d-446730706572', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 19:12:32.11991+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aa7cf3f2-9204-421e-b497-16920962666c', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-05 20:13:03.526925+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aca9530d-c09a-404f-af96-9a2a1b37fc40', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-05 20:13:03.529255+00', ''),
	('00000000-0000-0000-0000-000000000000', '6550d05d-20bc-420d-8178-e12cbeab282b', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-05 21:13:49.363889+00', ''),
	('00000000-0000-0000-0000-000000000000', '828cebb1-5fa2-4e69-a3b5-c7c20da197d0', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-05 21:13:49.36727+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aa1f0fe3-3715-4e84-86ae-1d612aecfdb0', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-05 22:15:56.62+00', ''),
	('00000000-0000-0000-0000-000000000000', '776061b8-aa5d-49b5-8ee0-caca930a7218', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-05 22:15:56.620778+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c069616-f7ab-4110-9e32-a0330199fcc6', '{"action":"user_signedup","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-07-05 22:48:11.000542+00', ''),
	('00000000-0000-0000-0000-000000000000', '42019d5c-8237-4436-a986-e83aee534015', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 22:48:11.010096+00', ''),
	('00000000-0000-0000-0000-000000000000', '5cd86b89-bb10-44f9-96e9-80e6375be275', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 22:56:51.522146+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b44b5733-d4e6-4547-8109-572eab5f568d', '{"action":"logout","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account"}', '2025-07-05 23:15:40.656868+00', ''),
	('00000000-0000-0000-0000-000000000000', '23c51154-d735-4d04-b2e3-8ffee71bff22', '{"action":"user_signedup","actor_id":"9ca259ad-7e76-4a94-ac6b-f6f58ec2b094","actor_username":"test-usuario-final@test.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-07-05 23:19:31.36229+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd67a6525-87b0-4629-bdf3-a4f0d6a8313d', '{"action":"login","actor_id":"9ca259ad-7e76-4a94-ac6b-f6f58ec2b094","actor_username":"test-usuario-final@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 23:19:31.368359+00', ''),
	('00000000-0000-0000-0000-000000000000', 'de95ba5d-3b87-4bcf-8111-7593cb84f751', '{"action":"logout","actor_id":"9ca259ad-7e76-4a94-ac6b-f6f58ec2b094","actor_username":"test-usuario-final@test.com","actor_via_sso":false,"log_type":"account"}', '2025-07-05 23:19:42.475399+00', ''),
	('00000000-0000-0000-0000-000000000000', '164189ea-6936-48fb-bea7-2ef747fc4e5c', '{"action":"user_signedup","actor_id":"97f97765-71f9-4871-b254-b5e1de37b60f","actor_name":"Juegos Pruebas And","actor_username":"juegosjgsalza@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-07-05 23:37:07.543668+00', ''),
	('00000000-0000-0000-0000-000000000000', '06b8802f-0145-4869-9cd1-068d3f335b83', '{"action":"login","actor_id":"97f97765-71f9-4871-b254-b5e1de37b60f","actor_name":"Juegos Pruebas And","actor_username":"juegosjgsalza@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 23:37:07.547502+00', ''),
	('00000000-0000-0000-0000-000000000000', '29cc0ab5-797c-4f12-8989-8cc9fa13f327', '{"action":"logout","actor_id":"97f97765-71f9-4871-b254-b5e1de37b60f","actor_name":"Juegos Pruebas And","actor_username":"juegosjgsalza@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-05 23:38:18.024836+00', ''),
	('00000000-0000-0000-0000-000000000000', '738c65c6-f5be-4a50-bd4f-1265cfa1175f', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 23:38:26.349928+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f998eed0-8642-49d3-bba4-9c3c0cc5b90d', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-05 23:43:07.350578+00', ''),
	('00000000-0000-0000-0000-000000000000', '4bd6addc-a71f-46c1-a85d-eb9ae446d047', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-06 00:22:06.575919+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b39a4c68-f713-4d77-b0b8-5064c093f7bd', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-06 00:22:06.577363+00', ''),
	('00000000-0000-0000-0000-000000000000', '872829e7-1ce0-4417-a4f9-a735044f120b', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-06 00:22:10.765411+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f8bc0db2-7ec9-498a-84b4-a56f0edeffa5', '{"action":"user_recovery_requested","actor_id":"97f97765-71f9-4871-b254-b5e1de37b60f","actor_name":"Juegos Pruebas And","actor_username":"juegosjgsalza@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-07-06 00:22:34.418632+00', ''),
	('00000000-0000-0000-0000-000000000000', '5daacf39-663f-475d-95d4-4a0613889a9a', '{"action":"login","actor_id":"97f97765-71f9-4871-b254-b5e1de37b60f","actor_name":"Juegos Pruebas And","actor_username":"juegosjgsalza@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-06 00:22:58.636271+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da76e3e5-13dd-4e68-85d5-b6cae09ba6b8', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-06 00:37:05.837941+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bbef14bd-b32c-40b7-b603-6a8c8f5db8dd', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-06 00:37:05.83874+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b9b33bb2-a931-4ff5-8ab1-56a28a1ca5a7', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-06 00:41:16.357493+00', ''),
	('00000000-0000-0000-0000-000000000000', '821f1730-37c7-4676-bec6-31a4377bd21e', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-06 00:41:16.359064+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bb3b20c2-2caa-48a1-8461-42da7791ba1d', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-06 01:16:23.306454+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad1b459b-b8cf-49b7-88ca-63bd9482eedd', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-06 01:18:32.566814+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd405a3f8-97b5-4185-b137-18ecf02a7753', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-06 01:37:14.58924+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cf1aab36-a038-4326-96d1-6b5cfe6e34ad', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-06 01:37:14.590091+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a94c2b54-62d6-4a7c-872b-75d25b56c21e', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-06 02:35:49.889334+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bbae80ae-f2bf-44c3-b1c3-cc02488a31b7', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-06 02:35:49.89329+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd399f560-4f7e-4433-b8a8-98702ca61f4d', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-06 03:18:51.104048+00', ''),
	('00000000-0000-0000-0000-000000000000', '822a6e8a-fa8c-4b38-8f2c-15988dc3f800', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-06 03:18:51.104909+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bfae007a-d8e2-41c6-9250-d58f32936310', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-06 03:34:10.303014+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a2879e44-cc8b-4495-b8d3-108d45617bdd', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-06 03:34:10.304597+00', ''),
	('00000000-0000-0000-0000-000000000000', '13997d86-17a8-45da-aa0f-45b567bd4a2d', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-06 23:43:09.031415+00', ''),
	('00000000-0000-0000-0000-000000000000', 'def48c56-5898-4b1c-9fef-80e60287ba37', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-06 23:43:09.041134+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd3db153a-ae6b-4fd4-baa8-70adad7cfdde', '{"action":"token_refreshed","actor_id":"97f97765-71f9-4871-b254-b5e1de37b60f","actor_name":"Juegos Pruebas And","actor_username":"juegosjgsalza@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 00:04:52.915583+00', ''),
	('00000000-0000-0000-0000-000000000000', '86b94759-647c-4dcf-b5bd-ba24f79bfb9d', '{"action":"token_revoked","actor_id":"97f97765-71f9-4871-b254-b5e1de37b60f","actor_name":"Juegos Pruebas And","actor_username":"juegosjgsalza@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 00:04:52.917127+00', ''),
	('00000000-0000-0000-0000-000000000000', '80d963a4-e55c-4d6d-a2cd-89e554b1d483', '{"action":"logout","actor_id":"97f97765-71f9-4871-b254-b5e1de37b60f","actor_name":"Juegos Pruebas And","actor_username":"juegosjgsalza@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-07 00:08:32.728946+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da05331e-a512-4eb0-98df-f71e63621476', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-07 00:08:53.92711+00', ''),
	('00000000-0000-0000-0000-000000000000', '77454a74-a7e2-40bb-b6f9-6366eeda949f', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 00:42:41.302257+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a977d57a-e9da-49cb-b4fe-00da5aaf7252', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 00:42:41.306032+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ccd2eb12-10f4-4282-9ee1-02a5ca230def', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 01:13:04.687479+00', ''),
	('00000000-0000-0000-0000-000000000000', '11510434-fd35-41c1-a795-5249fae60c1e', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 01:13:04.688801+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd3b9f0bd-f553-4a7b-a70c-73336a7e0e96', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 12:55:02.419681+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b0a3d643-e762-4e52-8ba5-6f259f074298', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 12:55:02.424457+00', ''),
	('00000000-0000-0000-0000-000000000000', '48a3c5c1-b7d6-4063-a8e1-d2ad57aad623', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 13:55:13.348842+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b59d138-b1fd-493d-a11a-f569524c0522', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 13:55:13.350823+00', ''),
	('00000000-0000-0000-0000-000000000000', '1d241117-3dc7-4ac2-9c1e-8b40f457542b', '{"action":"logout","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account"}', '2025-07-07 14:24:00.500345+00', ''),
	('00000000-0000-0000-0000-000000000000', '1c641812-fb08-476b-a102-19b4000fe33d', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-07 14:24:06.105079+00', ''),
	('00000000-0000-0000-0000-000000000000', '604796ea-bfd3-449b-9e5f-f4d079504847', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-07 14:29:08.695378+00', ''),
	('00000000-0000-0000-0000-000000000000', 'df907126-95fe-4b93-96ab-9b1503b88d92', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-07 14:29:28.82765+00', ''),
	('00000000-0000-0000-0000-000000000000', '2db3e48c-e086-43ee-aea7-3e2dde3ef476', '{"action":"logout","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account"}', '2025-07-07 14:33:14.945113+00', ''),
	('00000000-0000-0000-0000-000000000000', '2f44bd53-0ddb-45e2-a940-9aa421c316bf', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-07 14:33:21.721464+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad4bba05-c4b9-450b-977d-f107c4cc3710', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-07 14:33:54.506957+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7bd0436-b093-4687-9a27-08e950f1d03b', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-07 14:33:58.296498+00', ''),
	('00000000-0000-0000-0000-000000000000', '2e8f5b11-cfc8-40c0-81cc-30713cabada7', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 14:34:40.388807+00', ''),
	('00000000-0000-0000-0000-000000000000', '29a272b2-0f49-4a8e-9e3f-7b14ecc94286', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 14:34:40.389363+00', ''),
	('00000000-0000-0000-0000-000000000000', '8e2dc18f-e6d3-4b96-afe1-454662f63cfc', '{"action":"logout","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account"}', '2025-07-07 14:35:07.64561+00', ''),
	('00000000-0000-0000-0000-000000000000', '7d43b75a-1466-4484-b33e-61838a5cf8ea', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-07 14:35:11.942728+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bff04950-64b4-402c-923b-da23763441d3', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-07 14:41:38.409392+00', ''),
	('00000000-0000-0000-0000-000000000000', '69fe1e79-1865-4bde-a74a-194c2aebd142', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-07 14:41:41.616131+00', ''),
	('00000000-0000-0000-0000-000000000000', '53e6e028-b83d-4534-8760-0259cfb586ef', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 15:32:44.649069+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a0cf77d1-81cb-4b2a-98a0-e3bc856d09ed', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 15:32:44.65161+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fb6e879d-3101-458b-b38b-364f1a6cb4c5', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 16:29:19.283883+00', ''),
	('00000000-0000-0000-0000-000000000000', '140f7e02-d2d5-408a-a665-73cbaf4a65af', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 16:29:19.286577+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e126efa6-efc1-43c3-8928-56b2cc21c0f2', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 16:33:59.170815+00', ''),
	('00000000-0000-0000-0000-000000000000', '12ec270d-4784-43bd-988a-06a088956b63', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 16:33:59.173593+00', ''),
	('00000000-0000-0000-0000-000000000000', '2352d2e2-417e-402a-9f73-761e76c87abc', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 17:27:36.489209+00', ''),
	('00000000-0000-0000-0000-000000000000', '5b38d78f-d74f-4346-8eed-065e51e0da94', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 17:27:36.490648+00', ''),
	('00000000-0000-0000-0000-000000000000', '740b23c3-1c0e-44f8-808e-14a9295b8b7d', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 18:25:36.557852+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fdea5bb8-4749-43ad-83f5-b397bba1c6af', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 18:25:36.559406+00', ''),
	('00000000-0000-0000-0000-000000000000', '9bbf180a-6119-4a9a-9d40-eda21a751ea5', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 19:11:03.82499+00', ''),
	('00000000-0000-0000-0000-000000000000', 'beb55edf-3d9d-4736-926b-9af6f5895014', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 19:11:03.828025+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a29eb9b8-9451-4429-b643-f859d45c6db5', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 19:23:36.348614+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd248f4e-eda1-4a87-862d-5364582e6ef4', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 19:23:36.349448+00', ''),
	('00000000-0000-0000-0000-000000000000', '60129613-fc65-4879-a97d-f4b96ac1ed5f', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 20:58:49.933605+00', ''),
	('00000000-0000-0000-0000-000000000000', '5ae97a5b-671b-4a00-9d11-7834081c4b55', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 20:58:49.935546+00', ''),
	('00000000-0000-0000-0000-000000000000', '20eebda2-f3d6-4b4d-8332-41ac1463dc47', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 21:20:30.213478+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dd0ef0e4-9ff8-47af-840d-01deeeb9bd7e', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 21:20:30.216055+00', ''),
	('00000000-0000-0000-0000-000000000000', '28135d28-6a72-4453-9778-53173b5c2f7d', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 22:18:40.752729+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ff14ce4b-8660-43a2-844f-f60502b55ebc', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 22:18:40.755654+00', ''),
	('00000000-0000-0000-0000-000000000000', '4cc95fd3-bf18-4897-b4e7-39f11d55aebf', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 23:16:40.70897+00', ''),
	('00000000-0000-0000-0000-000000000000', '3a7a028d-b1ec-4d4e-9b39-beecd5994501', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-07 23:16:40.710778+00', ''),
	('00000000-0000-0000-0000-000000000000', '7fe412d0-d9b6-4dcc-a698-2dd52a2b62a1', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 23:38:48.782602+00', ''),
	('00000000-0000-0000-0000-000000000000', '5ca4e84d-0db6-4ce3-8beb-52c4095e80f8', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-07 23:38:48.785467+00', ''),
	('00000000-0000-0000-0000-000000000000', '18b1ca69-41ef-4781-a5cc-023603d9dfb7', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 00:14:40.655298+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e8d63571-0f12-4624-b472-8c52d2eac867', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 00:14:40.668236+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ccd6e66f-5b7d-487f-9e85-55a60686de7f', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-08 00:37:19.036703+00', ''),
	('00000000-0000-0000-0000-000000000000', 'acbe741b-048c-4284-b082-e6e2bfa748f2', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-08 00:37:19.046139+00', ''),
	('00000000-0000-0000-0000-000000000000', '75085dc7-a76b-4606-aac0-bcc27b0df70c', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-08 01:35:50.116726+00', ''),
	('00000000-0000-0000-0000-000000000000', '62147040-c671-4dff-8f99-936932d4ec6a', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-08 01:35:50.121741+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e258312a-1c12-43a6-9e4f-bd2ef9267ba1', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-08 02:02:46.340835+00', ''),
	('00000000-0000-0000-0000-000000000000', '504b7738-7863-4943-a088-37acc5eed702', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-08 02:34:22.28292+00', ''),
	('00000000-0000-0000-0000-000000000000', '6a67d415-cc24-4cbf-84d4-8659a778aad9', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-08 02:34:22.291964+00', ''),
	('00000000-0000-0000-0000-000000000000', '800f30ba-5e83-4943-8b8a-110e3fa2d7a6', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 02:43:08.422475+00', ''),
	('00000000-0000-0000-0000-000000000000', '6e40179a-2682-4837-a556-9c8af64daed7', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 02:43:08.426304+00', ''),
	('00000000-0000-0000-0000-000000000000', '694727d1-135b-43da-90ca-8cf80a83f263', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-08 03:35:47.672031+00', ''),
	('00000000-0000-0000-0000-000000000000', '1091aacd-1241-46c1-99e8-2be2cbbd6591', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-08 03:35:47.685171+00', ''),
	('00000000-0000-0000-0000-000000000000', '015c605d-3293-4f07-a9ee-578afc85ed47', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-08 04:34:19.160751+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fc933040-a6f6-46e8-9e34-8e6e77484c9f', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-08 04:34:19.165483+00', ''),
	('00000000-0000-0000-0000-000000000000', '53891652-4ef1-4231-aade-5a35a53f40fe', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 04:44:46.362212+00', ''),
	('00000000-0000-0000-0000-000000000000', '862dabb4-b5ff-49f9-bf8e-575b162da3af', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 04:44:46.365174+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f8612482-b14e-43ef-a8da-dff09cc7d699', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 12:43:33.747476+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dc14ae7d-3682-4a05-9d8d-689be6bfd621', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 12:43:33.752766+00', ''),
	('00000000-0000-0000-0000-000000000000', '3d8b086a-1d7e-40ad-8d49-2ed11bd1b2c5', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-08 12:53:43.897236+00', ''),
	('00000000-0000-0000-0000-000000000000', '52df47c1-e4e7-44da-9b5c-9ec8ed7a509d', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-08 12:53:43.898976+00', ''),
	('00000000-0000-0000-0000-000000000000', '634369f4-675a-4f9e-8a2e-f569a7940c4b', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 13:46:03.578722+00', ''),
	('00000000-0000-0000-0000-000000000000', '786d049c-9ddd-4aef-b3aa-294adf431bf1', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 13:46:03.584637+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fe1f0801-dc6c-48e8-9dab-6bc13af2ec48', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 14:44:46.590424+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bbba143c-a6ed-4ca2-961c-123392256e3a', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 14:44:46.59326+00', ''),
	('00000000-0000-0000-0000-000000000000', '6fa11030-c640-428f-8294-12de85bcadd5', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 15:42:55.672069+00', ''),
	('00000000-0000-0000-0000-000000000000', '407b3a99-9c18-4005-938d-f2dec83f58a7', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 15:42:55.674011+00', ''),
	('00000000-0000-0000-0000-000000000000', '1ecfb985-394e-491c-9d92-81f1913e1582', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 18:11:59.478646+00', ''),
	('00000000-0000-0000-0000-000000000000', '8668036d-c75a-48e9-8127-eadeb375b68d', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 18:11:59.481216+00', ''),
	('00000000-0000-0000-0000-000000000000', '21412551-fd47-46c5-90a8-c04f27418664', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 19:10:18.123896+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eaea1c4b-9d43-413d-bc14-5c1dc7ebf3dc', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-08 19:10:18.125853+00', ''),
	('00000000-0000-0000-0000-000000000000', '49552db7-d8d5-4eed-9212-79b256e2b476', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-09 12:50:21.711188+00', ''),
	('00000000-0000-0000-0000-000000000000', '48ae7da6-6b31-481c-a164-3520781ad98c', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-09 12:50:21.717446+00', ''),
	('00000000-0000-0000-0000-000000000000', '32997cca-fd54-4b73-bd30-92e76b5f060d', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-09 14:01:27.530225+00', ''),
	('00000000-0000-0000-0000-000000000000', '6810f288-0731-4fa5-9056-bf2f8f177838', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-09 14:01:27.5349+00', ''),
	('00000000-0000-0000-0000-000000000000', '325ca3bb-3e9d-4548-8bd1-103c987502dc', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-09 16:31:04.683228+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b019f097-0850-4986-9174-61a1ae176817', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-09 16:31:04.685927+00', ''),
	('00000000-0000-0000-0000-000000000000', '7e2afe20-6415-481e-8279-f3e9101d19be', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-09 20:02:28.695257+00', ''),
	('00000000-0000-0000-0000-000000000000', '6009fc14-22a8-4347-a664-0476eb6fb3f9', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-09 20:02:28.697296+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c8e577a6-2f1f-47bf-96e0-df38e010b4f2', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-09 20:21:20.613242+00', ''),
	('00000000-0000-0000-0000-000000000000', '00763e51-abe8-4fb7-800b-0f8cce32b458', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-09 20:21:20.615251+00', ''),
	('00000000-0000-0000-0000-000000000000', '54ecda7f-c7c8-4aa7-8921-45a9dd6826cd', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-09 23:19:13.781708+00', ''),
	('00000000-0000-0000-0000-000000000000', '19257b94-16e4-4ddb-b512-04619e2b2853', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-09 23:19:13.789742+00', ''),
	('00000000-0000-0000-0000-000000000000', '8d0fd83e-6dac-4c67-83c3-a89cfe6b97a4', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 13:03:29.646632+00', ''),
	('00000000-0000-0000-0000-000000000000', '13c98aed-a524-4a2e-b9a4-bd2959460d56', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 13:03:29.656397+00', ''),
	('00000000-0000-0000-0000-000000000000', '2acd37cd-ce5f-4150-90c0-cc5d35637019', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-10 13:14:29.117864+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f00d1b47-0433-4382-9238-e9bae3378ffa', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-10 13:14:29.122962+00', ''),
	('00000000-0000-0000-0000-000000000000', '31158877-1bea-4384-af1f-83389fcdf129', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-10 13:25:56.946525+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e4cdc529-0b29-4dbe-85f9-f7499d968abe', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-10 13:25:56.949737+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eb0b6e9c-ac0c-4cbd-a99d-95ee4415fce5', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 14:01:48.237604+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a6e4485d-f30c-4937-bb45-ef79d727edf5', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 14:01:48.240359+00', ''),
	('00000000-0000-0000-0000-000000000000', '9cb36ccb-7b17-4323-ab68-820ad1d0aa39', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 15:09:38.505686+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ed034cdd-cbe3-4cbc-a8d5-c9b155631052', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 15:09:38.507701+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aa0b6aba-bb97-4104-9f4c-c7f5b1a5f8a3', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 16:14:53.170988+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fe5f9b70-f997-4626-b831-2f497e40fc6d', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 16:14:53.173477+00', ''),
	('00000000-0000-0000-0000-000000000000', '5b6e4a8e-789c-46ea-865d-bf329c53b7ec', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 17:13:21.883382+00', ''),
	('00000000-0000-0000-0000-000000000000', '4146971d-13b5-48e4-b99f-29c5fd4ad5a6', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 17:13:21.885329+00', ''),
	('00000000-0000-0000-0000-000000000000', '4a9bc4f9-2702-45ec-8cc9-5b9e326a909e', '{"action":"logout","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account"}', '2025-07-10 18:00:03.172864+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e7a11cb7-311f-49ac-906a-f8dcede17b11', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-10 18:00:06.424322+00', ''),
	('00000000-0000-0000-0000-000000000000', '14a8168d-bd8b-48f8-ad91-03098b442807', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-10 18:00:56.25657+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f482f285-d6f2-4e10-8ef3-bacc08e12c55', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-10 18:00:59.891447+00', ''),
	('00000000-0000-0000-0000-000000000000', '9d8c552b-e708-4017-abe7-6cb31bd205ca', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 18:59:21.910556+00', ''),
	('00000000-0000-0000-0000-000000000000', '0b401288-a30f-45fd-8f67-163a908e8136', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 18:59:21.913151+00', ''),
	('00000000-0000-0000-0000-000000000000', '87cb741a-fc28-4ff4-a53f-c35cca44bf18', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 19:57:43.397708+00', ''),
	('00000000-0000-0000-0000-000000000000', '852f3bd2-34a5-48d8-9e29-5b326309c865', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 19:57:43.400176+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd12b5bc5-583b-4712-94b6-ba4e49146584', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 20:56:13.402769+00', ''),
	('00000000-0000-0000-0000-000000000000', '74b0b6d6-90cb-4c86-8dac-5dfa418ceb00', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-10 20:56:13.405405+00', ''),
	('00000000-0000-0000-0000-000000000000', '6c28acbc-a289-4131-b03e-7f84365e5b3e', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-11 00:21:26.554799+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b38800f9-3e65-4f0f-91a6-b9c29a60a3aa', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-11 00:21:26.558406+00', ''),
	('00000000-0000-0000-0000-000000000000', 'efb6ff4f-ac3f-4db1-883e-b1724b60abeb', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-11 12:51:14.014849+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e1eeb2ae-a2ed-4320-ba20-5091bb2db1cd', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-11 12:51:14.020196+00', ''),
	('00000000-0000-0000-0000-000000000000', '8cf1348c-5e4c-47ad-b344-0103b7546baf', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-11 13:49:18.485095+00', ''),
	('00000000-0000-0000-0000-000000000000', '82e3e7ad-7d95-4a36-a025-970e689b8d1d', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-11 13:49:18.494508+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aed268dc-139b-4854-8d59-c9d56f0a954b', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-11 17:42:06.694778+00', ''),
	('00000000-0000-0000-0000-000000000000', '9f9829ae-a2a0-401a-bcd7-5ca953f2de18', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-11 17:42:06.699181+00', ''),
	('00000000-0000-0000-0000-000000000000', '91aded12-a00c-4f44-9791-4ed422b1e29a', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-11 18:40:36.663067+00', ''),
	('00000000-0000-0000-0000-000000000000', '7469a73e-3549-42ac-bb06-304c5b03f932', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-11 18:40:36.666029+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ccd5dd42-e379-4cb8-ae6a-d62877fdf877', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-11 20:10:03.95699+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ab05388c-be26-44f1-a5e6-b5ea186853c9', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-11 20:10:03.959508+00', ''),
	('00000000-0000-0000-0000-000000000000', '37e0f068-db6d-4589-9cf5-11fb0cffe8e1', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-11 21:08:12.457033+00', ''),
	('00000000-0000-0000-0000-000000000000', '005fa6e0-2709-4ac4-85f0-6f4bcc1a474a', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-11 21:08:12.459861+00', ''),
	('00000000-0000-0000-0000-000000000000', '84e5a728-b8d5-4345-a21e-cdf60e4eaabb', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-14 12:39:58.729575+00', ''),
	('00000000-0000-0000-0000-000000000000', '95aecf54-4418-4da0-a339-8bd691939cc6', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-14 12:39:58.748741+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ee01044d-614a-434f-8593-9618ed1dede6', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-14 13:38:24.393544+00', ''),
	('00000000-0000-0000-0000-000000000000', '7199b5e2-b174-4038-b7db-e9ba9bb7abae', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-14 13:38:24.398112+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f4a00f72-5ee1-45ac-b3a9-9d187b302605', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-14 15:57:05.500837+00', ''),
	('00000000-0000-0000-0000-000000000000', '698ba34b-bd0a-4a7b-8bea-624dba361fb4', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-14 15:57:05.50341+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b93f8fcc-7ca6-4e30-b9fa-d9cae0bfcfdd', '{"action":"logout","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account"}', '2025-07-14 16:01:45.909366+00', ''),
	('00000000-0000-0000-0000-000000000000', '48db8fdb-d303-4653-9be0-778a38dd4f0e', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-14 16:01:48.9486+00', ''),
	('00000000-0000-0000-0000-000000000000', '93d54ee7-9baa-4940-8f55-911c0725c524', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-14 16:02:26.444435+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ef743620-2a9d-47b3-9cb5-a833e1064bf3', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-14 16:02:30.958134+00', ''),
	('00000000-0000-0000-0000-000000000000', '99a3d650-5ea7-42bd-ad51-e1bcc011dbf7', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-14 16:14:56.878437+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f8530c6f-025e-4be0-83d2-99284cdf99a7', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-14 16:14:56.881479+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd37872ff-9024-4a3d-b2de-fc9774b3a00a', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-14 17:40:24.257204+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c0f10570-7690-43f9-8d49-e4324b5ca5ff', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-14 17:40:24.260324+00', ''),
	('00000000-0000-0000-0000-000000000000', '1a167b7a-b6b4-4eb5-9002-6c7dd537d575', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 12:25:08.156368+00', ''),
	('00000000-0000-0000-0000-000000000000', '81be2ba7-a4a1-4bbf-881e-723c29edf05c', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 12:25:08.165816+00', ''),
	('00000000-0000-0000-0000-000000000000', '4ab68063-a08a-4168-9fa5-73c8d3b23e40', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 14:47:33.941997+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f312cbb1-8fef-49a1-937c-e413a84b9987', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 14:47:33.944478+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e3ac99c5-8403-4c99-a254-2d64e0f2f0ed', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 15:45:34.733477+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a43bf747-6f3e-4856-9fa7-7df861832b76', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 15:45:34.736578+00', ''),
	('00000000-0000-0000-0000-000000000000', '44c0d085-a84f-4a7c-b166-5afc778e4eac', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 18:19:47.976101+00', ''),
	('00000000-0000-0000-0000-000000000000', '9beeaef6-7a9f-4be1-b19b-71bce036ccf2', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 18:19:47.980587+00', ''),
	('00000000-0000-0000-0000-000000000000', '9e640201-88f2-4fcf-99bd-e8ac696db9d7', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 19:17:52.343829+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e30179cc-6e90-4491-af39-420f8ac02595', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 19:17:52.347402+00', ''),
	('00000000-0000-0000-0000-000000000000', '3345f21b-fa6c-4d5e-9bf9-dbd92e0f2f78', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 20:16:19.87999+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a7265440-cc28-404d-89b7-4b49873256e8', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 20:16:19.883656+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b3b02867-643c-49b0-b7fc-c163627a1e17', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-15 22:33:42.863691+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f4de48f9-4f8e-4e42-9070-eae3b38c11ad', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-15 22:33:42.865583+00', ''),
	('00000000-0000-0000-0000-000000000000', '9dcb1eb9-239e-40e6-9bd1-af1d712ff1bd', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 22:39:05.745155+00', ''),
	('00000000-0000-0000-0000-000000000000', '8549dab3-8aa6-4517-9b23-0b0c80a0b1af', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 22:39:05.746648+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cf30dfe7-9a7a-48dc-a2c0-691636b4fea4', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-15 23:38:42.553444+00', ''),
	('00000000-0000-0000-0000-000000000000', '46e0053e-08fb-404f-8a9d-de3408f9bb21', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-15 23:38:42.560893+00', ''),
	('00000000-0000-0000-0000-000000000000', '5021ec18-cee0-43a9-b51f-69bad11f497d', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-15 23:39:27.409855+00', ''),
	('00000000-0000-0000-0000-000000000000', '9bc13d3d-2aa9-45a9-8dcd-ad15573bcc13', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-15 23:39:27.410443+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b187f46a-0424-4ea7-9322-79231b846651', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 23:48:40.300309+00', ''),
	('00000000-0000-0000-0000-000000000000', '1e2270a3-73a7-46e3-a5ca-53979298204b', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-15 23:48:40.302921+00', ''),
	('00000000-0000-0000-0000-000000000000', '10b01d8d-0cef-43b1-aaaf-8bc018b1a926', '{"action":"logout","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account"}', '2025-07-16 00:28:58.792928+00', ''),
	('00000000-0000-0000-0000-000000000000', '129442d0-a739-4bf0-8ad6-3ed7270e3a12', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-16 00:33:55.326145+00', ''),
	('00000000-0000-0000-0000-000000000000', '68120cd8-ed83-4574-8b9a-f87da689a230', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 01:31:57.838614+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ae209319-3f82-40cf-84bc-93cd3feabf45', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 01:31:57.840514+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c60288f3-77f1-4d00-8ed6-b09c214121f6', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 02:29:59.168502+00', ''),
	('00000000-0000-0000-0000-000000000000', 'be2453f6-fecc-42c4-90f3-fca886ea0e30', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 02:29:59.171558+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7119d53-82bc-40ac-a130-bd2e28eeb58a', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 03:28:29.196979+00', ''),
	('00000000-0000-0000-0000-000000000000', '3d1139f3-3054-42b1-94ec-9e0f5d610a9b', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 03:28:29.199596+00', ''),
	('00000000-0000-0000-0000-000000000000', '65b6e2fe-08cc-4e9f-a211-8c13101a2c02', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 04:26:59.14778+00', ''),
	('00000000-0000-0000-0000-000000000000', '0e5b871c-3663-405f-9ad0-f079d09d3bf7', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 04:26:59.149972+00', ''),
	('00000000-0000-0000-0000-000000000000', '464cce45-d5c8-4ad7-819f-27e8586497dd', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-16 04:52:44.044499+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd5e89f76-3ebe-4175-a68c-ea21616bf3c5', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-16 04:55:08.362569+00', ''),
	('00000000-0000-0000-0000-000000000000', '23cb2923-8f0e-4aac-a557-dab991d53462', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-16 04:55:08.365936+00', ''),
	('00000000-0000-0000-0000-000000000000', '30a6df03-6212-4276-80cd-49c282d2137a', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-16 05:03:56.31092+00', ''),
	('00000000-0000-0000-0000-000000000000', '476bf386-b585-463e-96bc-b9d5ba23d0b1', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-16 05:03:56.314491+00', ''),
	('00000000-0000-0000-0000-000000000000', '8345491a-08ec-4fc1-8c60-c0271c3eae37', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 05:25:35.567736+00', ''),
	('00000000-0000-0000-0000-000000000000', '3a9b0aff-9b89-4bbd-9212-caa15d02ef2e', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 05:25:35.572633+00', ''),
	('00000000-0000-0000-0000-000000000000', '4fc83922-1e87-4bc3-ae3e-cc842f3c1bb2', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 12:54:37.721242+00', ''),
	('00000000-0000-0000-0000-000000000000', 'beaff420-34fc-4e21-94da-55c006b798a8', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 12:54:37.732735+00', ''),
	('00000000-0000-0000-0000-000000000000', '19aa22b4-e804-4b23-9e01-c83446df47a0', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-16 12:59:28.135724+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd02b3abc-8a19-4681-907d-09db959b8119', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-16 12:59:28.139955+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c6a29eaa-ad65-417b-a051-ed48fe84efc0', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-16 12:59:32.253211+00', ''),
	('00000000-0000-0000-0000-000000000000', '9c977343-9900-463b-918a-f519bcf3be44', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-16 12:59:47.946358+00', ''),
	('00000000-0000-0000-0000-000000000000', '8563c44e-b3c7-446e-8326-f66bad0e764a', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-16 12:59:57.528292+00', ''),
	('00000000-0000-0000-0000-000000000000', '5a04fe3d-9f2c-4c88-9ace-4401d60608bb', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-16 13:00:10.289764+00', ''),
	('00000000-0000-0000-0000-000000000000', '98b32f19-7c16-41d9-a25d-e104659b6e28', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-16 13:00:16.802528+00', ''),
	('00000000-0000-0000-0000-000000000000', '458b921f-fad5-4798-8ff1-355e90747662', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-16 13:00:16.803147+00', ''),
	('00000000-0000-0000-0000-000000000000', '899fd00a-cfc1-43da-b427-18125e7834e7', '{"action":"logout","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account"}', '2025-07-16 13:06:50.224542+00', ''),
	('00000000-0000-0000-0000-000000000000', '3cc0878c-72b3-42a7-9a54-0230f0c48ab7', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-16 13:06:53.148182+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c5a30ce0-c91b-4e65-b419-4e90a2113ce6', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-16 13:47:29.945508+00', ''),
	('00000000-0000-0000-0000-000000000000', '71f898d8-af2b-4299-8ed5-63fe9c801412', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-16 13:47:35.462068+00', ''),
	('00000000-0000-0000-0000-000000000000', '23b38198-f38e-4b0b-bedb-56f2add4277c', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-16 13:48:01.732586+00', ''),
	('00000000-0000-0000-0000-000000000000', '7f75f71e-5250-427d-bc94-91e09df76794', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-16 13:48:11.029311+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd288791a-a14b-4c5c-84d8-ffc3d0e6683c', '{"action":"logout","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account"}', '2025-07-16 13:48:17.313577+00', ''),
	('00000000-0000-0000-0000-000000000000', '42004588-679a-49ea-8b2d-57f31edaea2d', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-16 13:48:21.349971+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b4d965de-ff98-4651-ae8b-69447be0bb8f', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-16 13:52:50.595423+00', ''),
	('00000000-0000-0000-0000-000000000000', '3f33dc53-7f8b-4bf9-b63d-25730cea129f', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 13:52:53.145238+00', ''),
	('00000000-0000-0000-0000-000000000000', '475794d1-121c-412f-a2d3-3a195128b5f0', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 13:52:53.145785+00', ''),
	('00000000-0000-0000-0000-000000000000', '8e2347ec-b0d4-44a9-9bea-316f227d14ca', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-16 13:52:56.894994+00', ''),
	('00000000-0000-0000-0000-000000000000', '38aea80b-2075-4d03-b527-62944e8b0110', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-16 13:53:12.969774+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b6b927ec-7dd4-475e-a77b-324f4a8c5dca', '{"action":"logout","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account"}', '2025-07-16 14:05:55.451312+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ebf67470-cc23-46ce-94bf-8a5c875cce10', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-16 14:05:59.45707+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ecefd2d0-1d0a-4114-8f17-450010c45a34', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 16:01:16.77218+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bad241ce-030e-43fd-b05b-3acbed651028', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 16:01:16.775614+00', ''),
	('00000000-0000-0000-0000-000000000000', '6d3510b7-03c8-4c0a-9049-242a0ea48ac7', '{"action":"logout","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account"}', '2025-07-16 16:01:21.842413+00', ''),
	('00000000-0000-0000-0000-000000000000', '20897965-16b3-4330-a9de-47e1ab437ef9', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-16 16:01:25.501469+00', ''),
	('00000000-0000-0000-0000-000000000000', '75300965-8abb-4a06-83c0-4682247f0eed', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-16 16:03:45.922747+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c19ec607-a21f-42a8-8ab2-045dbcf75cd4', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-16 16:03:51.716228+00', ''),
	('00000000-0000-0000-0000-000000000000', '48cf1604-f1a3-4368-a8f5-c2282c48872f', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 18:39:02.5447+00', ''),
	('00000000-0000-0000-0000-000000000000', '416c4a50-16d7-4225-b300-3a0e8aacc337', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 18:39:02.548396+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f9fe7dfb-d820-41ed-8845-3fafa04e887b', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 19:37:17.619863+00', ''),
	('00000000-0000-0000-0000-000000000000', '17a7bea4-880e-489b-96f3-5681b1aea88d', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-16 19:37:17.624012+00', ''),
	('00000000-0000-0000-0000-000000000000', '3dd01325-64b0-4b93-865f-4236b3d13541', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 12:38:01.370713+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c5171c63-d2e0-4c9d-93dd-a0b8c6abc92c', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 12:38:01.378289+00', ''),
	('00000000-0000-0000-0000-000000000000', '2cd9938b-0bc4-4d95-b29e-0e7d60c320dd', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 14:01:30.081362+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f97ae6af-ec10-4192-a4a9-6008b28e65ee', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 14:01:30.084401+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f846a5cc-331c-44fa-9104-6ace59e8ed72', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 14:59:45.893326+00', ''),
	('00000000-0000-0000-0000-000000000000', '925696d5-3204-4b3f-8625-38b469e9cfbe', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 14:59:45.897103+00', ''),
	('00000000-0000-0000-0000-000000000000', '6deeca43-ed6b-49fc-837a-cfbd48a79d51', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 15:58:16.144883+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b6149b1-710b-4733-9ae4-f26a9e5c8a47', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 15:58:16.148719+00', ''),
	('00000000-0000-0000-0000-000000000000', '986aed1a-acf5-4ecc-87ea-8ef696878977', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 16:56:46.130926+00', ''),
	('00000000-0000-0000-0000-000000000000', '424d33ed-89d0-4af4-85fe-2ff4ec3f97b7', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 16:56:46.133149+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fccad123-d227-47be-96ed-6cb9e2a2b1de', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 17:55:16.073549+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ebf2f6d8-8604-4c21-a8ea-f179a26be929', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 17:55:16.078453+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ba7fd226-520f-4478-a02c-8b5e8e240f84', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-17 17:55:38.402523+00', ''),
	('00000000-0000-0000-0000-000000000000', '63960203-3733-4241-a422-6ed68c0988b7', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-17 17:55:38.403092+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd631747-4521-40a5-9c5c-4eadcb70a5e0', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-17 18:54:10.411244+00', ''),
	('00000000-0000-0000-0000-000000000000', '93f45a81-97c7-471a-a0dd-bb3f1a977a2e', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-17 18:54:10.42104+00', ''),
	('00000000-0000-0000-0000-000000000000', '6b17b846-7437-41c3-ba7c-bf8c038e54a6', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 19:08:42.5187+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a066a720-26d3-4ca9-a580-518d1691e9a0', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 19:08:42.520784+00', ''),
	('00000000-0000-0000-0000-000000000000', '5e3626e3-021b-4c86-8b11-dec88a8e4c52', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 20:06:57.011142+00', ''),
	('00000000-0000-0000-0000-000000000000', '04c5e622-1b88-4a32-b628-571dca195dbf', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 20:06:57.015581+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cc2d5281-82e5-4a93-81d7-c86d33da964f', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 21:05:27.06088+00', ''),
	('00000000-0000-0000-0000-000000000000', '956f1be9-3c86-44cd-93b4-94d1985b8583', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 21:05:27.065447+00', ''),
	('00000000-0000-0000-0000-000000000000', '3855666d-14c5-4bc0-98e3-bde634edb01d', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 22:03:43.253669+00', ''),
	('00000000-0000-0000-0000-000000000000', '9e82a504-2b1b-46b3-91da-df800d5e182d', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 22:03:43.255397+00', ''),
	('00000000-0000-0000-0000-000000000000', '4bf071c3-95f2-4a3c-86fa-930f856e16b3', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 23:02:12.805177+00', ''),
	('00000000-0000-0000-0000-000000000000', '556cfb42-9bf9-464b-bc90-3e661368348f', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-17 23:02:12.80869+00', ''),
	('00000000-0000-0000-0000-000000000000', '93c16e89-136a-4830-bb5c-93eef5fa416f', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 00:00:43.000126+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b9be783-2309-435a-b623-3a69ff3f83a4', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 00:00:43.002141+00', ''),
	('00000000-0000-0000-0000-000000000000', '34a4ff70-fcdc-4cd6-88ec-76cd913cd5ec', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 00:59:12.993283+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a97cd39e-0cf5-412a-9718-6a3adf3a42fa', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 00:59:12.995799+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fe8a77d5-94ef-4fbe-96b7-138d91b77b43', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 12:54:59.848212+00', ''),
	('00000000-0000-0000-0000-000000000000', '3dad5b72-0cae-4d9d-b0c9-dd980993a323', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 12:54:59.858052+00', ''),
	('00000000-0000-0000-0000-000000000000', '46cbc0d4-994b-4952-982a-bad5be6fc56e', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 13:53:07.146953+00', ''),
	('00000000-0000-0000-0000-000000000000', '0f1ec377-f039-40eb-8c0c-7814aa1ea84c', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 13:53:07.150024+00', ''),
	('00000000-0000-0000-0000-000000000000', '64c13ca5-8b45-4e86-9f92-ae9d9f8bf792', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 14:51:20.848091+00', ''),
	('00000000-0000-0000-0000-000000000000', '5ee1ec19-6791-427d-afac-9a6fc372ce6b', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 14:51:20.849467+00', ''),
	('00000000-0000-0000-0000-000000000000', '6a0bd703-1592-45ae-a088-2a3515df842b', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 15:49:20.84053+00', ''),
	('00000000-0000-0000-0000-000000000000', '702d2580-3fbe-4392-b2fc-79c8f470402e', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 15:49:20.844103+00', ''),
	('00000000-0000-0000-0000-000000000000', '14f8ac83-5c9c-4fee-a7e2-4cd99b72cd59', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 16:47:20.841145+00', ''),
	('00000000-0000-0000-0000-000000000000', '62e705a7-ec68-4239-b8a6-8e9df994c50a', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 16:47:20.844416+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b1490c9a-eae6-486a-8bd2-dd9a12f4b90f', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 19:49:51.034295+00', ''),
	('00000000-0000-0000-0000-000000000000', '4930c0f2-4721-4685-ba6b-f927670c75cb', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 19:49:51.036313+00', ''),
	('00000000-0000-0000-0000-000000000000', '57758709-a54e-4407-b97b-643ed52fbdf6', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 21:29:27.265193+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a5587b67-7719-433a-9fbf-6a8159c03f64', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-18 21:29:27.267204+00', ''),
	('00000000-0000-0000-0000-000000000000', '4e4b1466-687f-4d87-8b4b-b9921e3bb7cb', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-18 22:03:41.71357+00', ''),
	('00000000-0000-0000-0000-000000000000', '936097a8-d67a-4e58-b154-c102ad751982', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-18 22:03:41.716257+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e4827c20-caa5-49d6-b28d-fd2830181893', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-18 23:09:00.030381+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd4fb19fc-a8cd-4620-a550-e412a3bf789b', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-18 23:09:00.031885+00', ''),
	('00000000-0000-0000-0000-000000000000', '044afdbf-187e-472c-bb23-17a0b4320c65', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-18 23:19:09.184362+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f82b7215-4bf6-4be0-9600-14fde6c2fc7b', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-18 23:19:09.185938+00', ''),
	('00000000-0000-0000-0000-000000000000', '66b822a3-8e7f-4139-814e-4a709cbf6d51', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-19 00:07:33.686433+00', ''),
	('00000000-0000-0000-0000-000000000000', '717b0725-d88c-4035-9766-52258cbd8c99', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-19 00:07:33.687831+00', ''),
	('00000000-0000-0000-0000-000000000000', '840b5cd7-3a17-4978-9977-5891f2ed8620', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-19 00:17:16.1372+00', ''),
	('00000000-0000-0000-0000-000000000000', '5601ef80-eb65-4f23-927f-99bad35062f1', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-19 00:17:16.139393+00', ''),
	('00000000-0000-0000-0000-000000000000', '14c7c855-37bc-402e-bc0a-97b7e92582b4', '{"action":"token_refreshed","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-19 00:56:24.98349+00', ''),
	('00000000-0000-0000-0000-000000000000', '2b7f22af-6df6-4a32-9e09-59717eacc1e9', '{"action":"token_revoked","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"token"}', '2025-07-19 00:56:24.984315+00', ''),
	('00000000-0000-0000-0000-000000000000', '4734e7b7-a99e-4bdc-abb6-c2f4d74c3ad0', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-19 01:05:23.423322+00', ''),
	('00000000-0000-0000-0000-000000000000', '7e239628-67c2-4692-a5db-22670a6194d1', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-19 01:05:35.524875+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c547ba88-f0bd-48db-811b-60d3fb911cf1', '{"action":"logout","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account"}', '2025-07-19 01:13:57.740471+00', ''),
	('00000000-0000-0000-0000-000000000000', '03ce8c13-6757-490b-9395-1e622debb899', '{"action":"login","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-19 01:14:01.06334+00', ''),
	('00000000-0000-0000-0000-000000000000', '946f2054-2e53-4a76-9aa7-ed60c5c29e06', '{"action":"logout","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-19 01:14:06.646448+00', ''),
	('00000000-0000-0000-0000-000000000000', '4afa9e53-8312-466b-9f0a-79907c74eef7', '{"action":"login","actor_id":"079c1a87-1851-479c-a58a-4d8c636d0c6a","actor_username":"hjurgensen@todosistemassti.co","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-19 01:14:09.787271+00', ''),
	('00000000-0000-0000-0000-000000000000', '9bd97020-54c5-4a6d-88a9-38a2ecbcfae2', '{"action":"token_refreshed","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-19 01:26:42.94868+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b3e15901-405e-4537-8225-7e59b2df262e', '{"action":"token_revoked","actor_id":"5413c98b-df84-41ec-bd77-5ea321bc6922","actor_username":"andresjgsalzate@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-07-19 01:26:42.951344+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '079c1a87-1851-479c-a58a-4d8c636d0c6a', 'authenticated', 'authenticated', 'hjurgensen@todosistemassti.co', '$2a$10$WBwfx1v/NR76MJrgwLT0vegl88SWCm/DjTw2zIXnyMj0PKSMzIv7q', '2025-07-05 22:48:11.004343+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-07-19 01:14:09.787947+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "079c1a87-1851-479c-a58a-4d8c636d0c6a", "name": "Andres Jurgensen Alzate", "email": "hjurgensen@todosistemassti.co", "email_verified": true, "phone_verified": false}', NULL, '2025-07-05 22:48:10.988106+00', '2025-07-19 01:14:09.789518+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e50d9be4-9278-40ec-934d-e1ce2fcf65d4', 'authenticated', 'authenticated', 'test-1751725739147@example.com', '$2a$10$k7dkBOfWpkbJZQ3.Y70C7eYsJ8g7.tObamQlol6Y/ENrM5j47Cbj2', '2025-07-05 14:29:00.631496+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-07-05 14:29:00.890866+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "e50d9be4-9278-40ec-934d-e1ce2fcf65d4", "email": "test-1751725739147@example.com", "email_verified": true, "phone_verified": false}', NULL, '2025-07-05 14:29:00.625363+00', '2025-07-05 14:29:00.892489+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '97f97765-71f9-4871-b254-b5e1de37b60f', 'authenticated', 'authenticated', 'juegosjgsalza@gmail.com', '$2a$10$uIO9tZmWOFz0KzVwnCRdn.DPiy4l7B1nlUOQDPeGPfIF4vJDQ3yka', '2025-07-05 23:37:07.544329+00', NULL, '', NULL, '', '2025-07-06 00:22:34.420417+00', '', '', NULL, '2025-07-06 00:22:58.638441+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "97f97765-71f9-4871-b254-b5e1de37b60f", "email": "juegosjgsalza@gmail.com", "role_id": "47d60588-411c-4bbe-a710-e0895cebde9f", "full_name": "Juegos Pruebas And", "is_active": true, "email_verified": true, "phone_verified": false, "invited_by_admin": true}', NULL, '2025-07-05 23:37:07.537832+00', '2025-07-07 00:04:52.922324+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5413c98b-df84-41ec-bd77-5ea321bc6922', 'authenticated', 'authenticated', 'andresjgsalzate@gmail.com', '$2a$10$7G0XK6D92H8ytw3kpow9GeGPz69.KOkOFy1xN0Hsq4Ju/13/F.WVG', '2025-07-05 14:27:51.988721+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-07-19 01:14:01.064756+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "5413c98b-df84-41ec-bd77-5ea321bc6922", "name": "Andres Alzate Admin", "email": "andresjgsalzate@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-07-05 14:27:51.96295+00', '2025-07-19 01:26:42.955279+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9ca259ad-7e76-4a94-ac6b-f6f58ec2b094', 'authenticated', 'authenticated', 'test-usuario-final@test.com', '$2a$10$oo8JqRAHKr9LveZnSsN2Ge.7mZyfS.czwbGr8V5Pc.peaXJhDWUV.', '2025-07-05 23:19:31.36295+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-07-05 23:19:31.368869+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "9ca259ad-7e76-4a94-ac6b-f6f58ec2b094", "name": "test-usuario-final@test.com", "email": "test-usuario-final@test.com", "email_verified": true, "phone_verified": false}', NULL, '2025-07-05 23:19:31.353924+00', '2025-07-05 23:19:31.373163+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('5413c98b-df84-41ec-bd77-5ea321bc6922', '5413c98b-df84-41ec-bd77-5ea321bc6922', '{"sub": "5413c98b-df84-41ec-bd77-5ea321bc6922", "name": "Andres Alzate Admin", "email": "andresjgsalzate@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-07-05 14:27:51.984036+00', '2025-07-05 14:27:51.984088+00', '2025-07-05 14:27:51.984088+00', 'e5b7fb66-edbc-45ca-b5aa-8803413970e6'),
	('e50d9be4-9278-40ec-934d-e1ce2fcf65d4', 'e50d9be4-9278-40ec-934d-e1ce2fcf65d4', '{"sub": "e50d9be4-9278-40ec-934d-e1ce2fcf65d4", "email": "test-1751725739147@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-07-05 14:29:00.62892+00', '2025-07-05 14:29:00.628969+00', '2025-07-05 14:29:00.628969+00', 'b64bd83a-8c66-487c-9a47-10748810aa65'),
	('079c1a87-1851-479c-a58a-4d8c636d0c6a', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '{"sub": "079c1a87-1851-479c-a58a-4d8c636d0c6a", "name": "Andres Jurgensen Alzate", "email": "hjurgensen@todosistemassti.co", "email_verified": false, "phone_verified": false}', 'email', '2025-07-05 22:48:10.995653+00', '2025-07-05 22:48:10.995712+00', '2025-07-05 22:48:10.995712+00', '6f063ea5-e3a8-4bd3-ad74-8c9eb11d01e0'),
	('9ca259ad-7e76-4a94-ac6b-f6f58ec2b094', '9ca259ad-7e76-4a94-ac6b-f6f58ec2b094', '{"sub": "9ca259ad-7e76-4a94-ac6b-f6f58ec2b094", "name": "test-usuario-final@test.com", "email": "test-usuario-final@test.com", "email_verified": false, "phone_verified": false}', 'email', '2025-07-05 23:19:31.358666+00', '2025-07-05 23:19:31.358712+00', '2025-07-05 23:19:31.358712+00', '21f12d30-54ee-4597-952e-313cc38bf08c'),
	('97f97765-71f9-4871-b254-b5e1de37b60f', '97f97765-71f9-4871-b254-b5e1de37b60f', '{"sub": "97f97765-71f9-4871-b254-b5e1de37b60f", "email": "juegosjgsalza@gmail.com", "role_id": "47d60588-411c-4bbe-a710-e0895cebde9f", "full_name": "Juegos Pruebas And", "is_active": true, "email_verified": false, "phone_verified": false, "invited_by_admin": true}', 'email', '2025-07-05 23:37:07.541179+00', '2025-07-05 23:37:07.541228+00', '2025-07-05 23:37:07.541228+00', 'b20e9521-8fa6-46fa-8028-0b306844ae84');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('40086308-7648-457d-9df5-53887e8219ab', '5413c98b-df84-41ec-bd77-5ea321bc6922', '2025-07-05 16:07:38.209131+00', '2025-07-05 16:07:38.209131+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '186.28.106.124', NULL),
	('6681c0a3-7301-40ac-828c-e5cb63a29e2a', '5413c98b-df84-41ec-bd77-5ea321bc6922', '2025-07-05 16:11:50.461193+00', '2025-07-05 16:11:50.461193+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '186.28.106.124', NULL),
	('409d6257-f66f-4528-acf5-e1ce25671deb', '5413c98b-df84-41ec-bd77-5ea321bc6922', '2025-07-05 16:14:10.740502+00', '2025-07-05 18:13:29.707787+00', NULL, 'aal1', NULL, '2025-07-05 18:13:29.707718', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '186.28.106.124', NULL),
	('315cb448-aeac-4538-8f50-b26d2b5e382f', '5413c98b-df84-41ec-bd77-5ea321bc6922', '2025-07-16 04:52:44.04858+00', '2025-07-16 04:52:44.04858+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.102.0 Chrome/134.0.6998.205 Electron/35.6.0 Safari/537.36', '186.28.106.124', NULL),
	('ff212a88-6770-49c9-8e44-955a8f5230c4', '5413c98b-df84-41ec-bd77-5ea321bc6922', '2025-07-05 19:12:32.122769+00', '2025-07-05 22:15:56.626839+00', NULL, 'aal1', NULL, '2025-07-05 22:15:56.62677', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '186.28.106.124', NULL),
	('2465f996-9af2-42c9-8b86-dbb01326c2fe', '5413c98b-df84-41ec-bd77-5ea321bc6922', '2025-07-05 22:56:51.5232+00', '2025-07-05 22:56:51.5232+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '186.28.106.124', NULL),
	('0742c5b5-9d3b-4917-95ec-50294d2cf800', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-05 23:43:07.351632+00', '2025-07-06 00:41:16.362975+00', NULL, 'aal1', NULL, '2025-07-06 00:41:16.362904', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '186.28.106.124', NULL),
	('88bebafd-043d-4707-ad02-4d8ab22e19bf', '5413c98b-df84-41ec-bd77-5ea321bc6922', '2025-07-06 01:16:23.307509+00', '2025-07-06 01:16:23.307509+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.101.2 Chrome/134.0.6998.205 Electron/35.5.1 Safari/537.36', '186.28.106.124', NULL),
	('b7ef8808-7e51-4017-a6fb-f51fb71b1c32', '5413c98b-df84-41ec-bd77-5ea321bc6922', '2025-07-05 23:38:26.352061+00', '2025-07-06 03:34:10.310094+00', NULL, 'aal1', NULL, '2025-07-06 03:34:10.310024', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '186.28.106.124', NULL),
	('703bb8d4-0666-4262-a592-e4b9f0672e2b', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-16 13:52:56.895768+00', '2025-07-16 13:52:56.895768+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0', '186.28.106.124', NULL),
	('b493d120-ff91-48ae-a578-bc2cd9ed61c7', '5413c98b-df84-41ec-bd77-5ea321bc6922', '2025-07-19 01:05:35.529772+00', '2025-07-19 01:05:35.529772+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0', '186.28.106.124', NULL),
	('2ac5bbfe-93e5-4ae2-bdaf-0e7c4bb69630', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-19 01:14:09.788019+00', '2025-07-19 01:14:09.788019+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '186.28.106.124', NULL),
	('a1d3388d-1909-499b-97b2-4f88b2906332', '5413c98b-df84-41ec-bd77-5ea321bc6922', '2025-07-08 02:02:46.355291+00', '2025-07-19 01:26:42.957658+00', NULL, 'aal1', NULL, '2025-07-19 01:26:42.957589', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.102.0 Chrome/134.0.6998.205 Electron/35.6.0 Safari/537.36', '186.28.106.124', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('40086308-7648-457d-9df5-53887e8219ab', '2025-07-05 16:07:38.218955+00', '2025-07-05 16:07:38.218955+00', 'password', 'cbf2978d-5eae-4ba6-8c8a-40d977ad8c24'),
	('6681c0a3-7301-40ac-828c-e5cb63a29e2a', '2025-07-05 16:11:50.465772+00', '2025-07-05 16:11:50.465772+00', 'password', 'f5853861-d64a-44c6-ac08-4b1704d4fb9e'),
	('409d6257-f66f-4528-acf5-e1ce25671deb', '2025-07-05 16:14:10.745193+00', '2025-07-05 16:14:10.745193+00', 'password', 'a16bff15-ff5b-40e9-82cd-694ff28d7e73'),
	('ff212a88-6770-49c9-8e44-955a8f5230c4', '2025-07-05 19:12:32.131553+00', '2025-07-05 19:12:32.131553+00', 'password', '57147ca2-15ef-4749-9a8d-e2960b1d4081'),
	('2465f996-9af2-42c9-8b86-dbb01326c2fe', '2025-07-05 22:56:51.526692+00', '2025-07-05 22:56:51.526692+00', 'password', '4baba173-90e1-4109-8f2e-0cf8d7879491'),
	('b7ef8808-7e51-4017-a6fb-f51fb71b1c32', '2025-07-05 23:38:26.355924+00', '2025-07-05 23:38:26.355924+00', 'password', '994aca19-c47d-486f-af38-cf6936c70fce'),
	('0742c5b5-9d3b-4917-95ec-50294d2cf800', '2025-07-05 23:43:07.355923+00', '2025-07-05 23:43:07.355923+00', 'password', '5601d537-675d-435d-bd47-1e3f71fe0144'),
	('88bebafd-043d-4707-ad02-4d8ab22e19bf', '2025-07-06 01:16:23.311151+00', '2025-07-06 01:16:23.311151+00', 'password', 'cf31e57b-4ddd-47bc-8b2f-c6a644ebbde3'),
	('a1d3388d-1909-499b-97b2-4f88b2906332', '2025-07-08 02:02:46.368943+00', '2025-07-08 02:02:46.368943+00', 'password', '1e15a65f-b254-4685-89b5-d14533ddb968'),
	('315cb448-aeac-4538-8f50-b26d2b5e382f', '2025-07-16 04:52:44.058614+00', '2025-07-16 04:52:44.058614+00', 'password', '729de50f-2636-4cc1-8f91-270c77000c9b'),
	('703bb8d4-0666-4262-a592-e4b9f0672e2b', '2025-07-16 13:52:56.899903+00', '2025-07-16 13:52:56.899903+00', 'password', '0dbcf03d-1ce9-4e76-b58e-bff4aa86de89'),
	('b493d120-ff91-48ae-a578-bc2cd9ed61c7', '2025-07-19 01:05:35.539272+00', '2025-07-19 01:05:35.539272+00', 'password', 'ac9a3e87-4f60-415f-a142-5003dd5ba331'),
	('2ac5bbfe-93e5-4ae2-bdaf-0e7c4bb69630', '2025-07-19 01:14:09.789795+00', '2025-07-19 01:14:09.789795+00', 'password', 'b51b414e-fe3b-47f7-aabc-4b36ac5fd129');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 175, 'br6mcjh4vgaf', '5413c98b-df84-41ec-bd77-5ea321bc6922', false, '2025-07-19 01:26:42.953593+00', '2025-07-19 01:26:42.953593+00', 'ioxoslqcruqn', 'a1d3388d-1909-499b-97b2-4f88b2906332'),
	('00000000-0000-0000-0000-000000000000', 136, 'xh7kalxe6b6g', '079c1a87-1851-479c-a58a-4d8c636d0c6a', false, '2025-07-16 13:52:56.896582+00', '2025-07-16 13:52:56.896582+00', NULL, '703bb8d4-0666-4262-a592-e4b9f0672e2b'),
	('00000000-0000-0000-0000-000000000000', 7, 'h7lh7tze6cus', '5413c98b-df84-41ec-bd77-5ea321bc6922', false, '2025-07-05 16:07:38.213503+00', '2025-07-05 16:07:38.213503+00', NULL, '40086308-7648-457d-9df5-53887e8219ab'),
	('00000000-0000-0000-0000-000000000000', 8, 'cptrisko54hp', '5413c98b-df84-41ec-bd77-5ea321bc6922', false, '2025-07-05 16:11:50.462641+00', '2025-07-05 16:11:50.462641+00', NULL, '6681c0a3-7301-40ac-828c-e5cb63a29e2a'),
	('00000000-0000-0000-0000-000000000000', 9, 'xzpqcdxdxl6l', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-05 16:14:10.742096+00', '2025-07-05 17:14:24.567967+00', NULL, '409d6257-f66f-4528-acf5-e1ce25671deb'),
	('00000000-0000-0000-0000-000000000000', 10, '355cfptxw6uz', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-05 17:14:24.572636+00', '2025-07-05 18:13:29.699369+00', 'xzpqcdxdxl6l', '409d6257-f66f-4528-acf5-e1ce25671deb'),
	('00000000-0000-0000-0000-000000000000', 11, 'mc4damhianjs', '5413c98b-df84-41ec-bd77-5ea321bc6922', false, '2025-07-05 18:13:29.701694+00', '2025-07-05 18:13:29.701694+00', '355cfptxw6uz', '409d6257-f66f-4528-acf5-e1ce25671deb'),
	('00000000-0000-0000-0000-000000000000', 12, '3rlito2zetar', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-05 19:12:32.127721+00', '2025-07-05 20:13:03.52981+00', NULL, 'ff212a88-6770-49c9-8e44-955a8f5230c4'),
	('00000000-0000-0000-0000-000000000000', 13, '3xjqim4jw7jh', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-05 20:13:03.531007+00', '2025-07-05 21:13:49.367817+00', '3rlito2zetar', 'ff212a88-6770-49c9-8e44-955a8f5230c4'),
	('00000000-0000-0000-0000-000000000000', 14, 'odvmnwnhxmuz', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-05 21:13:49.370674+00', '2025-07-05 22:15:56.622321+00', '3xjqim4jw7jh', 'ff212a88-6770-49c9-8e44-955a8f5230c4'),
	('00000000-0000-0000-0000-000000000000', 15, 'up4op36vtwbv', '5413c98b-df84-41ec-bd77-5ea321bc6922', false, '2025-07-05 22:15:56.62354+00', '2025-07-05 22:15:56.62354+00', 'odvmnwnhxmuz', 'ff212a88-6770-49c9-8e44-955a8f5230c4'),
	('00000000-0000-0000-0000-000000000000', 17, 'xnrwdolpjrxo', '5413c98b-df84-41ec-bd77-5ea321bc6922', false, '2025-07-05 22:56:51.524752+00', '2025-07-05 22:56:51.524752+00', NULL, '2465f996-9af2-42c9-8b86-dbb01326c2fe'),
	('00000000-0000-0000-0000-000000000000', 20, 'icrwoweri47z', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-05 23:38:26.352748+00', '2025-07-06 00:37:05.839237+00', NULL, 'b7ef8808-7e51-4017-a6fb-f51fb71b1c32'),
	('00000000-0000-0000-0000-000000000000', 21, 'ajqjmfbboxxz', '079c1a87-1851-479c-a58a-4d8c636d0c6a', true, '2025-07-05 23:43:07.353375+00', '2025-07-06 00:41:16.359619+00', NULL, '0742c5b5-9d3b-4917-95ec-50294d2cf800'),
	('00000000-0000-0000-0000-000000000000', 25, 'a6ikpap5eak7', '079c1a87-1851-479c-a58a-4d8c636d0c6a', false, '2025-07-06 00:41:16.360206+00', '2025-07-06 00:41:16.360206+00', 'ajqjmfbboxxz', '0742c5b5-9d3b-4917-95ec-50294d2cf800'),
	('00000000-0000-0000-0000-000000000000', 26, '44ko3h7dk6h3', '5413c98b-df84-41ec-bd77-5ea321bc6922', false, '2025-07-06 01:16:23.308391+00', '2025-07-06 01:16:23.308391+00', NULL, '88bebafd-043d-4707-ad02-4d8ab22e19bf'),
	('00000000-0000-0000-0000-000000000000', 24, 'pbobiujo4wtg', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-06 00:37:05.839867+00', '2025-07-06 01:37:14.590611+00', 'icrwoweri47z', 'b7ef8808-7e51-4017-a6fb-f51fb71b1c32'),
	('00000000-0000-0000-0000-000000000000', 28, 'atjg6etrr7hg', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-06 01:37:14.591674+00', '2025-07-06 02:35:49.893793+00', 'pbobiujo4wtg', 'b7ef8808-7e51-4017-a6fb-f51fb71b1c32'),
	('00000000-0000-0000-0000-000000000000', 29, 'wbvpbm4nodx6', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-06 02:35:49.896301+00', '2025-07-06 03:34:10.305146+00', 'atjg6etrr7hg', 'b7ef8808-7e51-4017-a6fb-f51fb71b1c32'),
	('00000000-0000-0000-0000-000000000000', 31, 'gox5bumrupcn', '5413c98b-df84-41ec-bd77-5ea321bc6922', false, '2025-07-06 03:34:10.306443+00', '2025-07-06 03:34:10.306443+00', 'wbvpbm4nodx6', 'b7ef8808-7e51-4017-a6fb-f51fb71b1c32'),
	('00000000-0000-0000-0000-000000000000', 61, 'q73t6ij3d24w', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-08 02:02:46.362584+00', '2025-07-10 13:25:56.95025+00', NULL, 'a1d3388d-1909-499b-97b2-4f88b2906332'),
	('00000000-0000-0000-0000-000000000000', 115, 'fi6grovy2z4q', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-15 23:39:27.41394+00', '2025-07-16 05:03:56.315027+00', 'vv3ogerrbcoy', 'a1d3388d-1909-499b-97b2-4f88b2906332'),
	('00000000-0000-0000-0000-000000000000', 130, 'zvgekysihwbp', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-16 13:00:16.804603+00', '2025-07-18 23:19:09.18715+00', 'vnmap7z5yun2', 'a1d3388d-1909-499b-97b2-4f88b2906332'),
	('00000000-0000-0000-0000-000000000000', 174, 'lefwwgvvuqpc', '079c1a87-1851-479c-a58a-4d8c636d0c6a', false, '2025-07-19 01:14:09.788676+00', '2025-07-19 01:14:09.788676+00', NULL, '2ac5bbfe-93e5-4ae2-bdaf-0e7c4bb69630'),
	('00000000-0000-0000-0000-000000000000', 170, 'ioxoslqcruqn', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-19 00:17:16.142962+00', '2025-07-19 01:26:42.951831+00', 'fuc2bsszewvq', 'a1d3388d-1909-499b-97b2-4f88b2906332'),
	('00000000-0000-0000-0000-000000000000', 82, 'vv3ogerrbcoy', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-10 13:25:56.952418+00', '2025-07-15 23:39:27.412931+00', 'q73t6ij3d24w', 'a1d3388d-1909-499b-97b2-4f88b2906332'),
	('00000000-0000-0000-0000-000000000000', 122, '54whwdjsbrx2', '5413c98b-df84-41ec-bd77-5ea321bc6922', false, '2025-07-16 04:52:44.052957+00', '2025-07-16 04:52:44.052957+00', NULL, '315cb448-aeac-4538-8f50-b26d2b5e382f'),
	('00000000-0000-0000-0000-000000000000', 124, 'vnmap7z5yun2', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-16 05:03:56.318655+00', '2025-07-16 13:00:16.804251+00', 'fi6grovy2z4q', 'a1d3388d-1909-499b-97b2-4f88b2906332'),
	('00000000-0000-0000-0000-000000000000', 168, 'fuc2bsszewvq', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-18 23:19:09.188541+00', '2025-07-19 00:17:16.13994+00', 'zvgekysihwbp', 'a1d3388d-1909-499b-97b2-4f88b2906332'),
	('00000000-0000-0000-0000-000000000000', 172, 'ng4yxc67qsg3', '5413c98b-df84-41ec-bd77-5ea321bc6922', false, '2025-07-19 01:05:35.536234+00', '2025-07-19 01:05:35.536234+00', NULL, 'b493d120-ff91-48ae-a578-bc2cd9ed61c7');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: aplicaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."aplicaciones" ("id", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES
	('a7ec90ed-40ba-40ad-a874-3ab0382cfc02', 'SISLOG', 'Sistema de logística', true, '2025-07-05 13:38:04.388486+00', '2025-07-05 13:38:04.388486+00'),
	('6e371913-5870-41c1-9031-d311195a1121', 'SIGLA', 'Sistema de gestión legal y administrativa', true, '2025-07-05 13:38:04.388486+00', '2025-07-05 13:38:04.388486+00'),
	('72dcc839-ba3b-41b0-9bfa-2928c76cea70', 'GARANTIAS', 'Sistema de garantías', true, '2025-07-05 13:38:04.388486+00', '2025-07-05 13:38:04.388486+00'),
	('2138e072-d44f-4b37-b00a-2cb94bf14f85', 'KOMPENDIUM', 'Base de conocimientos Kompendium', true, '2025-07-05 13:38:04.388486+00', '2025-07-05 13:38:04.388486+00'),
	('6d8c3e6c-6eaa-4334-8f73-977952e5193b', 'SYON', 'Sistema SYON', true, '2025-07-05 13:38:04.388486+00', '2025-07-05 13:38:04.388486+00'),
	('67085cda-c0ff-47d1-9b30-50bc4f6c13aa', 'WSM LAB', 'Laboratorio WSM', true, '2025-07-05 13:38:04.388486+00', '2025-07-05 13:38:04.388486+00'),
	('eee3488f-cdec-477e-b04c-dc0127cd79d7', 'AGD', 'Archivo General de Datos.', true, '2025-07-05 13:38:04.388486+00', '2025-07-05 19:15:39.192387+00'),
	('16880bf1-3795-4fef-85bd-b6867a32b641', 'ACTIVIDAD', 'Procesos de actividad.', true, '2025-07-05 13:38:04.388486+00', '2025-07-16 13:39:39.781666+00'),
	('f78cdc96-1f44-45e0-b708-d65849f29a69', 'FALLO', 'Registro para fallos que se generen sobre el equipo', true, '2025-07-16 16:03:21.323705+00', '2025-07-16 16:03:21.323705+00');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."roles" ("id", "name", "description", "is_active", "created_at", "updated_at") VALUES
	('f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'admin', 'Administrador del sistema con acceso completo', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('2a856663-444a-42b3-bd9e-b428cd3308dc', 'user', 'Usuario sin acceso - requiere activación por administrador', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 22:23:48.172067+00'),
	('2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'supervisor', 'Supervisor con acceso de solo lectura a todo el sistema', true, '2025-07-05 22:23:48.172067+00', '2025-07-06 01:57:39.544937+00'),
	('47d60588-411c-4bbe-a710-e0895cebde9f', 'analista', 'Analista con acceso limitado a sus propios casos sin permisos de eliminación', true, '2025-07-05 22:23:48.172067+00', '2025-07-16 13:47:54.002309+00'),
	('12d689a6-c834-4e7b-92a3-8f5891a853ec', 'auditor', 'Auditor del Sistema - Solo lectura para supervisión y control', true, '2025-07-17 18:53:09.481896+00', '2025-07-17 18:53:09.481896+00');


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_profiles" ("id", "email", "full_name", "role_id", "is_active", "last_login_at", "created_at", "updated_at") VALUES
	('97f97765-71f9-4871-b254-b5e1de37b60f', 'juegosjgsalza@gmail.com', 'Supervisor Del Sistema J', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', true, NULL, '2025-07-05 23:37:08.413368+00', '2025-07-16 13:46:03.996652+00'),
	('5413c98b-df84-41ec-bd77-5ea321bc6922', 'andresjgsalzate@gmail.com', 'Andres Alzate Admin', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', true, NULL, '2025-07-05 15:33:56.849469+00', '2025-07-19 01:02:53.569792+00'),
	('079c1a87-1851-479c-a58a-4d8c636d0c6a', 'hjurgensen@todosistemassti.co', 'Andres Jurgensen Alzate', '47d60588-411c-4bbe-a710-e0895cebde9f', true, NULL, '2025-07-05 23:04:00.309199+00', '2025-07-19 01:33:20.602046+00');


--
-- Data for Name: archive_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."archive_audit_log" ("id", "action_type", "item_type", "item_id", "user_id", "reason", "created_at") VALUES
	('1c4dc86f-4af7-472a-b07b-dd427d27de9b', 'ARCHIVE', 'TODO', '14fb795c-6a93-402f-9235-25dd29ef5285', '5413c98b-df84-41ec-bd77-5ea321bc6922', NULL, '2025-07-08 04:19:01.527072+00'),
	('dd42772a-8f46-4c0c-a853-70f01587a610', 'RESTORE', 'TODO', '14fb795c-6a93-402f-9235-25dd29ef5285', '5413c98b-df84-41ec-bd77-5ea321bc6922', NULL, '2025-07-08 04:19:54.183344+00'),
	('ec8375d8-45e4-467e-88ab-880096444eb2', 'ARCHIVE', 'CASE', '437fd286-f7fa-419e-ac2f-fda709d2f536', '5413c98b-df84-41ec-bd77-5ea321bc6922', NULL, '2025-07-08 04:22:49.045711+00'),
	('687c1af6-9e8f-420c-b241-9fe05b012229', 'ARCHIVE', 'TODO', '14fb795c-6a93-402f-9235-25dd29ef5285', '5413c98b-df84-41ec-bd77-5ea321bc6922', NULL, '2025-07-08 04:46:17.566687+00'),
	('5f653d09-6393-40e1-bc4c-95fcaa1980f9', 'ARCHIVE', 'CASE', '92acd39a-bb94-46e2-b11a-012df1c6d408', '5413c98b-df84-41ec-bd77-5ea321bc6922', NULL, '2025-07-08 04:47:17.044058+00'),
	('493a8689-c13a-49cc-8cd2-c8547c91b9c4', 'RESTORE', 'TODO', '14fb795c-6a93-402f-9235-25dd29ef5285', '5413c98b-df84-41ec-bd77-5ea321bc6922', NULL, '2025-07-08 05:03:29.133319+00'),
	('633e5f35-1d10-4435-b741-fdbe2cefff5d', 'RESTORE', 'CASE', '92acd39a-bb94-46e2-b11a-012df1c6d408', '5413c98b-df84-41ec-bd77-5ea321bc6922', NULL, '2025-07-08 05:03:45.789078+00'),
	('d13a2148-2e92-4256-9b51-cdaacaa9e160', 'ARCHIVE', 'CASE', 'befff2ed-6435-4c28-9ab1-dc663b0a90db', '5413c98b-df84-41ec-bd77-5ea321bc6922', NULL, '2025-07-08 12:55:16.653518+00'),
	('d3e075cd-f7cf-471d-9b65-eebd484c6017', 'RESTORE', 'CASE', 'befff2ed-6435-4c28-9ab1-dc663b0a90db', '5413c98b-df84-41ec-bd77-5ea321bc6922', NULL, '2025-07-08 12:55:55.538929+00'),
	('22a095ed-6d06-4de5-9a2c-52256aed445e', 'ARCHIVE', 'CASE', 'befff2ed-6435-4c28-9ab1-dc663b0a90db', '5413c98b-df84-41ec-bd77-5ea321bc6922', NULL, '2025-07-08 13:12:35.791464+00'),
	('b19fc7d2-5ab8-489a-96f1-9d50f6150586', 'RESTORE', 'CASE', 'befff2ed-6435-4c28-9ab1-dc663b0a90db', '5413c98b-df84-41ec-bd77-5ea321bc6922', NULL, '2025-07-08 13:17:14.569833+00'),
	('b9691933-66c3-429b-9f63-c05cfe3cdc13', 'ARCHIVE', 'CASE', 'befff2ed-6435-4c28-9ab1-dc663b0a90db', '5413c98b-df84-41ec-bd77-5ea321bc6922', NULL, '2025-07-08 13:17:54.535498+00'),
	('0af66bd9-456a-4358-9478-3734c1552176', 'RESTORE', 'CASE', 'befff2ed-6435-4c28-9ab1-dc663b0a90db', '5413c98b-df84-41ec-bd77-5ea321bc6922', NULL, '2025-07-08 13:18:15.120183+00');


--
-- Data for Name: archive_deletion_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."archive_deletion_log" ("id", "item_type", "item_id", "item_identifier", "deleted_by", "deleted_at", "deletion_reason", "created_at") VALUES
	('d0234077-fdc9-47aa-9917-b0ad7adfa4d2', 'case', '78b7359e-f558-46f2-b7fb-cd90bc928941', 'Prueba para archivar', '5413c98b-df84-41ec-bd77-5ea321bc6922', '2025-07-08 04:37:26.997486+00', 'Eliminación permanente solicitada por administrador', '2025-07-08 04:37:26.997486+00');


--
-- Data for Name: archived_cases; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."archived_cases" ("id", "original_case_id", "case_number", "description", "classification", "total_time_minutes", "completed_at", "archived_at", "archived_by", "original_data", "control_data", "restored_at", "restored_by", "is_restored", "created_at", "updated_at", "archive_reason") VALUES
	('4c4f2bed-eec7-456d-ac64-970c5bbf540c', '92acd39a-bb94-46e2-b11a-012df1c6d408', 'Pruebas', 'Pruebas de Archivo', 'Baja Complejidad', 60, '2025-07-08 04:46:59.851+00', '2025-07-08 04:47:17.044058+00', '5413c98b-df84-41ec-bd77-5ea321bc6922', '{"id": "92acd39a-bb94-46e2-b11a-012df1c6d408", "fecha": "2025-07-07", "user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "origen_id": "97cd25f1-a921-49e7-b62f-2539880ad5b2", "created_at": "2025-07-08T04:46:52.928668+00:00", "puntuacion": 5, "updated_at": "2025-07-08T04:46:52.928668+00:00", "causa_fallo": 1, "descripcion": "Pruebas de Archivo", "numero_caso": "Pruebas", "aplicacion_id": "16880bf1-3795-4fef-85bd-b6867a32b641", "clasificacion": "Baja Complejidad", "historial_caso": 1, "manipulacion_datos": 1, "conocimiento_modulo": 1, "claridad_descripcion": 1}', '{"id": "7ba2041f-1820-42b5-9647-9ce235ba3f6a", "case_id": "92acd39a-bb94-46e2-b11a-012df1c6d408", "user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "status_id": "6d371a8f-52cd-48fa-9576-1e978ce2ef29", "created_at": "2025-07-08T04:46:58.667484+00:00", "started_at": null, "updated_at": "2025-07-08T04:47:09.51744+00:00", "assigned_at": "2025-07-08T04:46:58.667484+00:00", "completed_at": "2025-07-08T04:46:59.851+00:00", "timer_start_at": null, "is_timer_active": false, "total_time_minutes": 60}', '2025-07-08 05:03:45.789078+00', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-08 04:47:17.044058+00', '2025-07-08 05:03:45.789078+00', NULL),
	('df8b1259-1add-40c7-8352-70c48a58b1c3', 'befff2ed-6435-4c28-9ab1-dc663b0a90db', 'pruebas', 'Pruebas', 'Baja Complejidad', 60, '2025-07-08 12:55:07.465+00', '2025-07-08 12:55:16.653518+00', '5413c98b-df84-41ec-bd77-5ea321bc6922', '{"id": "befff2ed-6435-4c28-9ab1-dc663b0a90db", "fecha": "2025-07-08", "user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "origen_id": "97cd25f1-a921-49e7-b62f-2539880ad5b2", "created_at": "2025-07-08T05:04:50.25238+00:00", "puntuacion": 5, "updated_at": "2025-07-08T05:04:50.25238+00:00", "causa_fallo": 1, "descripcion": "Pruebas", "numero_caso": "pruebas", "aplicacion_id": "16880bf1-3795-4fef-85bd-b6867a32b641", "clasificacion": "Baja Complejidad", "historial_caso": 1, "manipulacion_datos": 1, "conocimiento_modulo": 1, "claridad_descripcion": 1}', '{"id": "44050969-284e-450d-a246-43e9c0cd28d8", "case_id": "befff2ed-6435-4c28-9ab1-dc663b0a90db", "user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "status_id": "6d371a8f-52cd-48fa-9576-1e978ce2ef29", "created_at": "2025-07-08T12:54:18.733923+00:00", "started_at": "2025-07-08T12:54:20.389+00:00", "updated_at": "2025-07-08T12:55:09.091743+00:00", "assigned_at": "2025-07-08T12:54:18.733923+00:00", "completed_at": "2025-07-08T12:55:07.465+00:00", "timer_start_at": null, "is_timer_active": false, "total_time_minutes": 60}', '2025-07-08 12:55:55.538929+00', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-08 12:55:16.653518+00', '2025-07-08 12:55:55.538929+00', NULL),
	('7721666c-1527-481a-bdbe-d31f8ff03ea3', 'befff2ed-6435-4c28-9ab1-dc663b0a90db', 'pruebas', 'Pruebas', 'Baja Complejidad', 60, '2025-07-08 13:06:04.427+00', '2025-07-08 13:12:35.791464+00', '5413c98b-df84-41ec-bd77-5ea321bc6922', '{"id": "befff2ed-6435-4c28-9ab1-dc663b0a90db", "fecha": "2025-07-08", "user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "origen_id": "97cd25f1-a921-49e7-b62f-2539880ad5b2", "created_at": "2025-07-08T05:04:50.25238+00:00", "puntuacion": 5, "updated_at": "2025-07-08T12:55:55.538929+00:00", "causa_fallo": 1, "descripcion": "Pruebas", "numero_caso": "pruebas", "aplicacion_id": "16880bf1-3795-4fef-85bd-b6867a32b641", "clasificacion": "Baja Complejidad", "historial_caso": 1, "manipulacion_datos": 1, "conocimiento_modulo": 1, "claridad_descripcion": 1}', '{"id": "9897444d-29fe-484b-a1e5-3eee75e075c8", "case_id": "befff2ed-6435-4c28-9ab1-dc663b0a90db", "user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "status_id": "6d371a8f-52cd-48fa-9576-1e978ce2ef29", "created_at": "2025-07-08T12:55:55.538929+00:00", "started_at": null, "updated_at": "2025-07-08T13:06:06.078166+00:00", "assigned_at": "2025-07-08T12:55:55.538929+00:00", "completed_at": "2025-07-08T13:06:04.427+00:00", "time_entries": [], "timer_start_at": null, "is_timer_active": false, "total_time_minutes": 60, "manual_time_entries": [{"id": "ce15169b-b2c6-48ed-882e-21c1422ba2d0", "date": "2025-07-08", "user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "created_at": "2025-07-08T13:05:59.71803+00:00", "created_by": "5413c98b-df84-41ec-bd77-5ea321bc6922", "description": "Prueba", "case_control_id": "9897444d-29fe-484b-a1e5-3eee75e075c8", "duration_minutes": 60}]}', '2025-07-08 13:17:14.569833+00', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-08 13:12:35.791464+00', '2025-07-08 13:17:14.569833+00', 'prueba'),
	('a089e401-f763-4af4-bfbc-cc0d4a397bf5', 'befff2ed-6435-4c28-9ab1-dc663b0a90db', 'pruebas', 'Pruebas', 'Baja Complejidad', 120, '2025-07-08 13:17:44.377+00', '2025-07-08 13:17:54.535498+00', '5413c98b-df84-41ec-bd77-5ea321bc6922', '{"id": "befff2ed-6435-4c28-9ab1-dc663b0a90db", "fecha": "2025-07-08", "user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "origen_id": "97cd25f1-a921-49e7-b62f-2539880ad5b2", "created_at": "2025-07-08T05:04:50.25238+00:00", "puntuacion": 5, "updated_at": "2025-07-08T13:17:14.569833+00:00", "causa_fallo": 1, "descripcion": "Pruebas", "numero_caso": "pruebas", "aplicacion_id": "16880bf1-3795-4fef-85bd-b6867a32b641", "clasificacion": "Baja Complejidad", "historial_caso": 1, "manipulacion_datos": 1, "conocimiento_modulo": 1, "claridad_descripcion": 1}', '{"id": "fda7b967-48e7-406f-8799-8d555dc05486", "case_id": "befff2ed-6435-4c28-9ab1-dc663b0a90db", "user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "status_id": "6d371a8f-52cd-48fa-9576-1e978ce2ef29", "created_at": "2025-07-08T13:17:14.569833+00:00", "started_at": null, "updated_at": "2025-07-08T13:17:46.017891+00:00", "assigned_at": "2025-07-08T13:17:14.569833+00:00", "completed_at": "2025-07-08T13:17:44.377+00:00", "time_entries": [], "timer_start_at": null, "is_timer_active": false, "total_time_minutes": 120, "manual_time_entries": [{"id": "3818ea8e-5d85-48cf-a84c-a9e7e1673e47", "date": "2025-07-08", "user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "created_at": "2025-07-08T13:05:59.71803+00:00", "created_by": "5413c98b-df84-41ec-bd77-5ea321bc6922", "description": "Prueba", "case_control_id": "fda7b967-48e7-406f-8799-8d555dc05486", "duration_minutes": 60}, {"id": "7a840e3c-7f95-4ca7-abb3-cbf7105c8128", "date": "2025-07-08", "user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "created_at": "2025-07-08T13:17:37.251389+00:00", "created_by": "5413c98b-df84-41ec-bd77-5ea321bc6922", "description": "Pruebas 2", "case_control_id": "fda7b967-48e7-406f-8799-8d555dc05486", "duration_minutes": 60}]}', '2025-07-08 13:18:15.120183+00', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-08 13:17:54.535498+00', '2025-07-08 13:18:15.120183+00', 'prueba de archivo');


--
-- Data for Name: archived_todos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."archived_todos" ("id", "original_todo_id", "title", "description", "priority", "total_time_minutes", "completed_at", "archived_at", "archived_by", "original_data", "control_data", "restored_at", "restored_by", "is_restored", "created_at", "updated_at", "archive_reason") VALUES
	('191e9daa-587f-4f75-a8ad-7eeea80d659c', '14fb795c-6a93-402f-9235-25dd29ef5285', 'Todo de pruebas', 'Todo de prueba para archivo', 'Muy Baja', 0, '2025-07-08 04:18:37.354+00', '2025-07-08 04:19:01.527072+00', '5413c98b-df84-41ec-bd77-5ea321bc6922', '{"id": "14fb795c-6a93-402f-9235-25dd29ef5285", "title": "Todo de pruebas", "due_date": "2025-07-07", "created_at": "2025-07-08T04:18:10.590802+00:00", "updated_at": "2025-07-08T04:18:10.590802+00:00", "description": "Todo de prueba para archivo", "priority_id": "511e006a-68c1-4a93-9ae3-803ab13991d9", "completed_at": null, "is_completed": false, "assigned_user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "estimated_minutes": 10, "created_by_user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922"}', '{"id": "f5ab5993-ff07-4267-9031-10665ababc4b", "todo_id": "14fb795c-6a93-402f-9235-25dd29ef5285", "user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "status_id": "6d371a8f-52cd-48fa-9576-1e978ce2ef29", "created_at": "2025-07-08T04:18:13.733032+00:00", "started_at": "2025-07-08T04:18:13.368+00:00", "updated_at": "2025-07-08T04:18:38.28547+00:00", "assigned_at": "2025-07-08T04:18:12.765+00:00", "completed_at": "2025-07-08T04:18:37.354+00:00", "timer_start_at": null, "is_timer_active": false, "total_time_minutes": 0}', '2025-07-08 04:19:54.183344+00', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-08 04:19:01.527072+00', '2025-07-08 04:19:54.183344+00', NULL),
	('e40fc3cd-55b2-4421-9627-14f75d5b417b', '14fb795c-6a93-402f-9235-25dd29ef5285', 'Todo de pruebas', 'Todo de prueba para archivo', 'Muy Baja', 0, NULL, '2025-07-08 04:46:17.566687+00', '5413c98b-df84-41ec-bd77-5ea321bc6922', '{"id": "14fb795c-6a93-402f-9235-25dd29ef5285", "title": "Todo de pruebas", "due_date": "2025-07-07", "created_at": "2025-07-08T04:18:10.590802+00:00", "updated_at": "2025-07-08T04:20:06.805962+00:00", "description": "Todo de prueba para archivo", "priority_id": "511e006a-68c1-4a93-9ae3-803ab13991d9", "completed_at": null, "is_completed": false, "assigned_user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "estimated_minutes": 10, "created_by_user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922"}', '{"id": "f5ab5993-ff07-4267-9031-10665ababc4b", "todo_id": "14fb795c-6a93-402f-9235-25dd29ef5285", "user_id": "5413c98b-df84-41ec-bd77-5ea321bc6922", "status_id": "6d371a8f-52cd-48fa-9576-1e978ce2ef29", "created_at": "2025-07-08T04:18:13.733032+00:00", "started_at": "2025-07-08T04:18:13.368+00:00", "updated_at": "2025-07-08T04:19:54.183344+00:00", "assigned_at": "2025-07-08T04:18:12.765+00:00", "completed_at": null, "timer_start_at": null, "is_timer_active": false, "total_time_minutes": 0}', '2025-07-08 05:03:29.133319+00', '5413c98b-df84-41ec-bd77-5ea321bc6922', true, '2025-07-08 04:46:17.566687+00', '2025-07-08 05:03:29.133319+00', 'prueba');


--
-- Data for Name: case_status_control; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."case_status_control" ("id", "name", "description", "color", "is_active", "display_order", "created_at", "updated_at") VALUES
	('a25d089f-d69e-4dce-bf70-a2c1528a6bd2', 'EN CURSO', 'Caso en proceso de resolución', '#3B82F6', true, 2, '2025-07-05 16:46:01.165043+00', '2025-07-05 16:46:01.165043+00'),
	('67166b33-b7c2-41d3-bff7-cb1c6a0f6707', 'ESCALADA', 'Caso escalado a nivel superior', '#F59E0B', true, 3, '2025-07-05 16:46:01.165043+00', '2025-07-05 16:46:01.165043+00'),
	('6d371a8f-52cd-48fa-9576-1e978ce2ef29', 'TERMINADA', 'Caso completado y cerrado.', '#10B981', true, 4, '2025-07-05 16:46:01.165043+00', '2025-07-05 19:34:43.886471+00'),
	('c743231b-ebed-4534-a74e-1b94e69353a5', 'PENDIENTE', 'Caso asignado pero no iniciado.', '#EF4444', true, 1, '2025-07-05 16:46:01.165043+00', '2025-07-16 13:39:46.439333+00');


--
-- Data for Name: origenes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."origenes" ("id", "nombre", "descripcion", "activo", "created_at", "updated_at") VALUES
	('8d232238-d629-4890-b7c1-8e12447e1566', 'BACKLOG', 'Casos provenientes del backlog', true, '2025-07-05 13:38:04.388486+00', '2025-07-05 13:38:04.388486+00'),
	('000c1ec0-2cc4-4edb-b5dd-9b56e2126ece', 'PRIORIZADA', 'Casos con priorización establecida', true, '2025-07-05 13:38:04.388486+00', '2025-07-05 13:38:04.388486+00'),
	('5b95f1ce-e5a0-45e9-92f3-c6f32397b544', 'CON_CAMBIOS', 'Casos que requieren cambios', true, '2025-07-05 13:38:04.388486+00', '2025-07-05 13:38:04.388486+00'),
	('97cd25f1-a921-49e7-b62f-2539880ad5b2', 'ACTIVIDAD', 'Casos de actividades regulares.', true, '2025-07-05 13:38:04.388486+00', '2025-07-16 13:39:30.150837+00'),
	('5326dfbb-4221-42fe-a5fd-c82638d0a70c', 'FALLO', 'Casos de fallos sobre el equipo personal', true, '2025-07-16 16:02:42.320174+00', '2025-07-16 16:02:42.320174+00');


--
-- Data for Name: cases; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."cases" ("id", "numero_caso", "descripcion", "fecha", "origen_id", "aplicacion_id", "historial_caso", "conocimiento_modulo", "manipulacion_datos", "claridad_descripcion", "causa_fallo", "puntuacion", "clasificacion", "created_at", "updated_at", "user_id") VALUES
	('090703d2-de3a-4db0-9a9e-488aff56facd', 'IN528951', 'TERMINAL EDA
Proceso que estaba realizando: PROCESAR RECORRIDO
Modulo: EDA
Descripción de la falla: SE INGRESA USUARIO Y CONTRASEÑA, MUESTRA MENSAJE DE QUE NO HAY RECORRIDOS PENDIENTES, NO PERMITE VISUALIZAR EL RECORRIDO', '2025-07-02', '000c1ec0-2cc4-4edb-b5dd-9b56e2126ece', '6e371913-5870-41c1-9031-d311195a1121', 2, 2, 2, 3, 3, 12, 'Alta Complejidad', '2025-07-07 00:23:16.447796+00', '2025-07-07 00:40:00.676982+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('809748ed-35da-451c-bda4-57c5280dc66d', 'SR2060241', 'asignar tamaño a UDS SOLICITUD 173339', '2025-07-02', '000c1ec0-2cc4-4edb-b5dd-9b56e2126ece', '6e371913-5870-41c1-9031-d311195a1121', 2, 2, 2, 2, 2, 10, 'Media Complejidad', '2025-07-07 00:21:08.945047+00', '2025-07-07 00:40:05.5342+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('838aa1b4-9c01-4879-bd8c-ef70782432be', 'SR2064814', 'Reporte de Cambio de Tamaño
Descripción de la solicitud: Se requiere la colaboración nos puedan suministrar con un reporte desde el 1ro de mayo hasta el 6 de junio para los movimientos de cambio de tamaño con el usuario y la fecha del movimiento que realizo el cambio a las cajas que se encontraban en plataforma BODEGA PRINCIPAL MEDELLIN, debido a que se evidenció un movimiento masivo de cambio de tamaños sin justificación.', '2025-07-02', '000c1ec0-2cc4-4edb-b5dd-9b56e2126ece', '6e371913-5870-41c1-9031-d311195a1121', 1, 1, 1, 2, 2, 7, 'Media Complejidad', '2025-07-07 00:20:16.803996+00', '2025-07-07 00:40:10.070345+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('f3eab828-1152-4cef-8378-a0e651050e0c', 'SR2065632', 'Solicitamos su colaboración para extraer de la aplicación de Sigla un listado de los puntos de atención de todos los clientes que se encuentren activos, a continuación campos requeridos para validación:

CLIENTE
NIT
SUCURSAL (CIUDAD)
ZONA
ZONA DE TRANSPORTE
DIRECCION
TELEFONO
INICIO ATENCIÓN
FIN ATENCIÓN
CONDICIONES
PISO
NOTA
ACTIVO (SI)', '2025-07-07', '000c1ec0-2cc4-4edb-b5dd-9b56e2126ece', '6e371913-5870-41c1-9031-d311195a1121', 1, 1, 1, 1, 1, 5, 'Baja Complejidad', '2025-07-07 13:34:43.312789+00', '2025-07-07 13:34:43.312789+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('2150969a-2c5c-42ba-aa83-2168ddd4f5f7', 'SR2052628', 'Reporte de datos sigla, reporte de datos sigla CARLOS.SALAZAR', '2025-07-08', '000c1ec0-2cc4-4edb-b5dd-9b56e2126ece', '6e371913-5870-41c1-9031-d311195a1121', 1, 1, 1, 1, 1, 5, 'Baja Complejidad', '2025-07-08 15:59:20.112759+00', '2025-07-08 15:59:20.112759+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('c4e1884b-c9b2-4894-8401-3b3a11fb3610', 'SR2062407', 'Buenas tardes, señor Jaime,

Adjunto archivo que contiene relacionados 120 etiquetas de caja, pero no registran asignados en sigla al cliente Comfenalco quien los tiene físicamente. Corresponden al departamento de Educación.
¿Por favor me indica como podemos proceder?
Muchas gracias.', '2025-07-10', '000c1ec0-2cc4-4edb-b5dd-9b56e2126ece', '6e371913-5870-41c1-9031-d311195a1121', 3, 2, 3, 2, 3, 13, 'Alta Complejidad', '2025-07-10 13:44:42.874263+00', '2025-07-10 13:44:42.874263+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('c7534c1f-2f37-472e-98f0-b0dc5cd8896e', 'SR2064209', 'Dejando los pedidos 236049023- 236048194 en SIGLA en estado FACTURADO

', '2025-07-10', '000c1ec0-2cc4-4edb-b5dd-9b56e2126ece', '6e371913-5870-41c1-9031-d311195a1121', 1, 1, 2, 1, 1, 6, 'Media Complejidad', '2025-07-10 13:52:07.562217+00', '2025-07-10 13:52:07.562217+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('726a02b6-0a6a-49d3-9bfe-4941696bb0e2', 'SR2064451', 'eliminar el proceso físico foliación', '2025-07-10', '000c1ec0-2cc4-4edb-b5dd-9b56e2126ece', '6e371913-5870-41c1-9031-d311195a1121', 1, 1, 2, 1, 1, 6, 'Media Complejidad', '2025-07-10 13:53:40.895433+00', '2025-07-10 13:53:40.895433+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('3a9e9f41-4f48-4e82-9f72-1e3006585ec2', 'SR2061868', 'Buen día
Creo caso para el despliegue del paquete PQCS_CARGUE_CSV de acuerdo con los compromisos del acta 7824_27052025
Se adjunta lista de Chequeo que comprende del despliegue del paquete PQCS_CARGUE_CSV, la creación de la tabla tcs_log_carga_csv y la secuancia log_carga_seq en el esquema alpopudb', '2025-07-11', '000c1ec0-2cc4-4edb-b5dd-9b56e2126ece', '6e371913-5870-41c1-9031-d311195a1121', 3, 3, 3, 1, 2, 12, 'Alta Complejidad', '2025-07-11 13:07:32.338867+00', '2025-07-11 13:07:32.338867+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('2a8221e2-08eb-427a-b9b5-9d55cf712531', 'IN520564', 'Quitar el bloqueo de cargue de un FD al detalle de un inventario, cuando el FD se encuentre con movimiento de salida.  El sistema debe mostrar el mensaje “el fondo documental se encuentra fuera de la bodega” y cargar el FD al detalle del inventario.', '2025-07-14', '000c1ec0-2cc4-4edb-b5dd-9b56e2126ece', '6e371913-5870-41c1-9031-d311195a1121', 2, 2, 3, 2, 3, 12, 'Alta Complejidad', '2025-07-14 15:58:47.148544+00', '2025-07-14 15:58:47.148544+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('cdb7353d-79ac-485c-ae81-d4c105c6fd1d', 'SR2067838', 'Trazabilidad en Traslado de Fondos Documentales
Descripción de la solicitud: se requiere identificar usuario que realizo el traslado del FD del opción donde se encuentra la información Trazabilidad en Traslado de Fondos Documentales  Cliente : INVERSIONES MEDICAS DE ANTIOQUIA S.A. Solicitud: 63791 Fecha Traslado: 2025-06-25 realizado por la forma del sistema "Traslado de Fondos Documentales" de igual forma se requiere extraer la información a un reporte en excel
', '2025-07-15', '000c1ec0-2cc4-4edb-b5dd-9b56e2126ece', '6e371913-5870-41c1-9031-d311195a1121', 2, 2, 1, 1, 2, 8, 'Media Complejidad', '2025-07-15 18:21:54.544087+00', '2025-07-15 18:21:54.544087+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('06a2faa8-585b-483f-8af4-27901b920366', 'SR2049322', 'Se requiere ajustar todos los valores del campo “fecha Hora” en la “tabla Histórico de Movimientos de Fondos Documentales” todos aquellos que no corresponda a un valor de dato de fecha en formato “AAAA-MM-DD” Año-mes-día “HH:mm:ss” hora/minutos/segundo', '2025-07-15', '000c1ec0-2cc4-4edb-b5dd-9b56e2126ece', '6e371913-5870-41c1-9031-d311195a1121', 3, 3, 2, 1, 3, 12, 'Alta Complejidad', '2025-07-15 23:53:58.043267+00', '2025-07-15 23:53:58.043267+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('6c69208d-c6a2-40cd-b0d4-7b663f45d0d9', 'IN530114', 'Se reporta fallo sobre acceso al equipo, se crea caso para llevar el conteo de tiempo perdido', '2025-07-16', '5326dfbb-4221-42fe-a5fd-c82638d0a70c', 'f78cdc96-1f44-45e0-b708-d65849f29a69', 1, 1, 1, 1, 1, 5, 'Baja Complejidad', '2025-07-16 16:04:50.929263+00', '2025-07-16 16:04:50.929263+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('a2562ffa-36d6-4149-ad57-6063475947ba', 'SR2067614', 'Registro del Fallo de perdida del acceso al disco duro', '2025-07-14', '5326dfbb-4221-42fe-a5fd-c82638d0a70c', 'f78cdc96-1f44-45e0-b708-d65849f29a69', 1, 1, 1, 1, 1, 5, 'Baja Complejidad', '2025-07-16 16:06:15.990594+00', '2025-07-16 16:06:15.990594+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('d79faa64-f3d1-416a-b522-9b5b2612dabf', 'SR2060770', ' Con base en el PROYECTO DE AJUSTES COLIBRÍ-BCO POPULAR, se debe realizar el 2do proceso de MIGRACIÓN de GARANTÍAS a COLIBRÍ', '2025-07-04', '000c1ec0-2cc4-4edb-b5dd-9b56e2126ece', '6e371913-5870-41c1-9031-d311195a1121', 1, 1, 2, 1, 1, 6, 'Media Complejidad', '2025-07-18 21:30:40.593071+00', '2025-07-18 21:30:40.593071+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a');


--
-- Data for Name: case_control; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."case_control" ("id", "case_id", "user_id", "status_id", "total_time_minutes", "timer_start_at", "is_timer_active", "assigned_at", "started_at", "completed_at", "created_at", "updated_at") VALUES
	('8333de8a-0620-48e0-94d6-d418de3dd88b', '838aa1b4-9c01-4879-bd8c-ef70782432be', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '67166b33-b7c2-41d3-bff7-cb1c6a0f6707', 817, NULL, false, '2025-07-07 00:42:58.040961+00', '2025-07-07 01:12:49.655+00', NULL, '2025-07-07 00:42:58.040961+00', '2025-07-18 14:46:35.292485+00'),
	('12ef6fa9-ed46-47e5-8e65-7a05a1f44e20', '809748ed-35da-451c-bda4-57c5280dc66d', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '67166b33-b7c2-41d3-bff7-cb1c6a0f6707', 360, NULL, false, '2025-07-07 00:42:54.343077+00', '2025-07-07 01:12:50.938+00', NULL, '2025-07-07 00:42:54.343077+00', '2025-07-09 13:01:44.739014+00'),
	('eeb705dd-f60c-43e7-8ff0-646f9db14e17', 'cdb7353d-79ac-485c-ae81-d4c105c6fd1d', '079c1a87-1851-479c-a58a-4d8c636d0c6a', 'a25d089f-d69e-4dce-bf70-a2c1528a6bd2', 537, NULL, false, '2025-07-15 18:22:05.681723+00', NULL, NULL, '2025-07-15 18:22:05.681723+00', '2025-07-18 17:03:04.933303+00'),
	('d402fdd2-dbb8-45df-85a6-44732c82a29d', '2150969a-2c5c-42ba-aa83-2168ddd4f5f7', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '67166b33-b7c2-41d3-bff7-cb1c6a0f6707', 1071, NULL, false, '2025-07-08 15:59:48.678336+00', NULL, NULL, '2025-07-08 15:59:48.678336+00', '2025-07-18 19:49:58.014084+00'),
	('f767e6d3-55eb-4d9a-96c7-5eb41d60057d', 'f3eab828-1152-4cef-8378-a0e651050e0c', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '67166b33-b7c2-41d3-bff7-cb1c6a0f6707', 352, NULL, false, '2025-07-07 17:08:55.75074+00', '2025-07-08 12:53:59.665+00', NULL, '2025-07-07 17:08:55.75074+00', '2025-07-10 13:05:39.582359+00'),
	('899c1c95-285a-4bb1-936f-afb087175d7e', 'd79faa64-f3d1-416a-b522-9b5b2612dabf', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '6d371a8f-52cd-48fa-9576-1e978ce2ef29', 30, NULL, false, '2025-07-18 21:30:48.266879+00', NULL, '2025-07-18 21:32:24.435+00', '2025-07-18 21:30:48.266879+00', '2025-07-18 21:32:24.892745+00'),
	('04cd43e1-505c-4c07-a75f-ff430d226080', 'c4e1884b-c9b2-4894-8401-3b3a11fb3610', '079c1a87-1851-479c-a58a-4d8c636d0c6a', 'a25d089f-d69e-4dce-bf70-a2c1528a6bd2', 609, NULL, false, '2025-07-10 13:48:13.259616+00', NULL, NULL, '2025-07-10 13:48:13.259616+00', '2025-07-11 00:21:28.636051+00'),
	('3767247f-83f0-4e0f-943a-9e8540754a65', '3a9e9f41-4f48-4e82-9f72-1e3006585ec2', '079c1a87-1851-479c-a58a-4d8c636d0c6a', 'a25d089f-d69e-4dce-bf70-a2c1528a6bd2', 422, NULL, false, '2025-07-11 13:07:40.642242+00', NULL, NULL, '2025-07-11 13:07:40.642242+00', '2025-07-11 20:10:13.021556+00'),
	('67e74560-e359-4180-a843-69b522ecc400', 'a2562ffa-36d6-4149-ad57-6063475947ba', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '6d371a8f-52cd-48fa-9576-1e978ce2ef29', 480, NULL, false, '2025-07-16 16:06:23.582912+00', NULL, '2025-07-16 16:07:06.351+00', '2025-07-16 16:06:23.582912+00', '2025-07-16 16:07:07.859781+00'),
	('a0d10fb4-9a37-473b-9b13-d35958867ba8', '6c69208d-c6a2-40cd-b0d4-7b663f45d0d9', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '6d371a8f-52cd-48fa-9576-1e978ce2ef29', 240, NULL, false, '2025-07-16 16:04:56.182592+00', NULL, '2025-07-17 14:46:16.19+00', '2025-07-16 16:04:56.182592+00', '2025-07-17 14:46:18.544588+00'),
	('76b2b9dc-c38f-46a6-86dc-3b21adcec2c3', '090703d2-de3a-4db0-9a9e-488aff56facd', '079c1a87-1851-479c-a58a-4d8c636d0c6a', 'a25d089f-d69e-4dce-bf70-a2c1528a6bd2', 960, NULL, false, '2025-07-07 00:42:51.11048+00', '2025-07-07 01:12:47.948+00', NULL, '2025-07-07 00:42:51.11048+00', '2025-07-07 01:12:48.615024+00'),
	('d8c2d20b-11b0-4d15-96b8-4aa7ffd7e3ca', '2a8221e2-08eb-427a-b9b5-9d55cf712531', '079c1a87-1851-479c-a58a-4d8c636d0c6a', 'a25d089f-d69e-4dce-bf70-a2c1528a6bd2', 263, NULL, false, '2025-07-14 15:59:50.998564+00', NULL, NULL, '2025-07-14 15:59:50.998564+00', '2025-07-17 17:25:05.209187+00');


--
-- Data for Name: manual_time_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."manual_time_entries" ("id", "case_control_id", "user_id", "date", "duration_minutes", "description", "created_at", "created_by") VALUES
	('2349ecf9-fb07-41f7-80a3-5ea377989b01', '76b2b9dc-c38f-46a6-86dc-3b21adcec2c3', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-02', 480, 'Ajuste de tiempo por migración', '2025-07-07 00:43:45.263341+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('f3476f51-f3f2-4e5a-a858-1a5045570e67', '12ef6fa9-ed46-47e5-8e65-7a05a1f44e20', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-03', 240, 'Ajuste de tiempo por migración', '2025-07-07 00:44:26.02174+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('1f38f353-ae9e-453f-9220-3a236e55c2a9', '8333de8a-0620-48e0-94d6-d418de3dd88b', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-03', 240, 'Ajuste de tiempo por migración', '2025-07-07 00:44:38.863296+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('8bf96346-ec95-4eb3-9b50-0673bda586eb', '76b2b9dc-c38f-46a6-86dc-3b21adcec2c3', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-01', 480, 'Ajuste de tiempo por migración', '2025-07-07 00:45:11.858627+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('dc276b55-b051-40d4-a0e2-925f31163514', '8333de8a-0620-48e0-94d6-d418de3dd88b', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-04', 360, 'Ajuste de tiempos por migración', '2025-07-07 01:11:08.654169+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('8794882d-47c8-41b7-8965-3dc2c2c55b5f', '12ef6fa9-ed46-47e5-8e65-7a05a1f44e20', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-04', 120, 'Ajuste por migración', '2025-07-07 01:12:20.01811+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('5a767fca-c8b0-4de4-a4d3-31306466ede4', '8333de8a-0620-48e0-94d6-d418de3dd88b', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-07', 60, 'Ajuste del dia', '2025-07-07 17:08:40.594796+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('6041d05b-bd3a-4252-940e-6c230540ff9c', 'f767e6d3-55eb-4d9a-96c7-5eb41d60057d', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-07', 150, 'Ajuste manual', '2025-07-07 17:09:47.667819+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('215b6b66-476a-4ad9-be1a-3340d22af123', '8333de8a-0620-48e0-94d6-d418de3dd88b', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-09', 30, 'Escalamiento del caso', '2025-07-09 12:59:25.013319+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('bff194b8-76a6-440a-84ba-304399ad465b', 'eeb705dd-f60c-43e7-8ff0-646f9db14e17', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-15', 180, 'ajuste', '2025-07-15 20:03:34.487764+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('212b2477-9d81-498c-ab4e-8610852d247f', 'eeb705dd-f60c-43e7-8ff0-646f9db14e17', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-15', 40, 'Ajuste manual de tiempo del día 15/07/2025', '2025-07-15 23:58:39.557004+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('9af5c6c3-6d8b-4b01-982b-c66cf767e946', 'a0d10fb4-9a37-473b-9b13-d35958867ba8', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-16', 120, 'registro de tiempo transcurrido del fallo', '2025-07-16 16:05:20.174831+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('c1de9af2-e281-4a94-8b35-f351810893c9', '67e74560-e359-4180-a843-69b522ecc400', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-15', 480, 'Registro de tiempo del fallo que genero la perdida de acceso al Disco Duro', '2025-07-16 16:06:57.326275+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('a00c7a4b-5365-4256-a62a-1d96bae63131', 'a0d10fb4-9a37-473b-9b13-d35958867ba8', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-16', 120, ' Registro de tiempo transcurrido del fallo', '2025-07-17 14:46:13.724875+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('15cd23db-57e4-4179-8774-3a6964a95e4a', 'd8c2d20b-11b0-4d15-96b8-4aa7ffd7e3ca', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-17', 150, 'IN520564', '2025-07-17 15:32:10.238311+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('2f4548ec-3140-4681-8d8a-f0f3689e3f94', '8333de8a-0620-48e0-94d6-d418de3dd88b', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-18', 40, ' Detalles de Tiempo - Caso #SR2064814', '2025-07-18 14:36:19.917267+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('cf58a5d7-4ee4-4d5d-8ff1-387ac41dd9c2', 'eeb705dd-f60c-43e7-8ff0-646f9db14e17', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-18', 60, 'Caso #SR2067838', '2025-07-18 17:03:04.933303+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a'),
	('9b4ac84e-25c3-40ba-88f0-fcdf9c53bd22', '899c1c95-285a-4bb1-936f-afb087175d7e', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-18', 30, 'Ajuste manual de tiempo', '2025-07-18 21:32:21.284581+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a');


--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."notes" ("id", "title", "content", "tags", "case_id", "created_by", "assigned_to", "is_important", "is_archived", "archived_at", "archived_by", "reminder_date", "is_reminder_sent", "created_at", "updated_at") VALUES
	('96f5d750-b1f2-4dbf-8322-97af00e0c30a', 'Pruebas', 'Pruebas', '{Pruebas}', NULL, '5413c98b-df84-41ec-bd77-5ea321bc6922', '5413c98b-df84-41ec-bd77-5ea321bc6922', false, false, NULL, NULL, NULL, false, '2025-07-17 18:32:34.158936+00', '2025-07-17 18:32:34.158936+00'),
	('17e744d6-28c7-4176-8684-86fe45f07ec8', 'Fallo desconexión - 17/07/2025 11:59 AM', 'Se presentó fallo de desconexión del equipo, al consultar con soporte en sitio, indican que sufrieron un apagón por lo cual se presentó reinicio del equipo.', '{Apagón,Desconexión}', NULL, '079c1a87-1851-479c-a58a-4d8c636d0c6a', NULL, true, false, NULL, NULL, NULL, false, '2025-07-17 19:15:12.387471+00', '2025-07-17 19:15:51.449154+00'),
	('25bfec54-bc73-490b-85f6-b0fbe06f0ca1', 'Fallo desconexión - 17/07/2025 2:48PM', 'Se presentó fallo de desconexión del equipo, al consultar con soporte en sitio, indican que sufrieron un apagón por lo cual se presentó reinicio del equipo.', '{Apagón,Desconexión}', NULL, '079c1a87-1851-479c-a58a-4d8c636d0c6a', NULL, true, false, NULL, NULL, NULL, false, '2025-07-17 19:48:28.303364+00', '2025-07-17 19:48:28.303364+00'),
	('3c5af63b-f604-4401-9211-1bc44e26ce08', 'Falla desconexión - 17/07/2025 3:00 PM', 'Se presentó fallo de desconexión del equipo, al consultar con soporte en sitio, indican que sufrieron un apagón por lo cual se presentó reinicio del equipo.', '{Desconexión,Apagón}', NULL, '079c1a87-1851-479c-a58a-4d8c636d0c6a', NULL, true, false, NULL, NULL, NULL, false, '2025-07-17 20:10:09.445242+00', '2025-07-17 20:10:09.445242+00');


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."permissions" ("id", "name", "description", "resource", "action", "is_active", "created_at", "updated_at") VALUES
	('51465ad8-c9bf-4016-a1af-c8bca337919e', 'cases.create', 'Crear nuevos casos', 'cases', 'create', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('1ddd24f6-8b78-4afb-934f-9442cb598bc5', 'cases.read.own', 'Ver propios casos', 'cases', 'read', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('818550b9-b1dd-4c32-95f6-98466202dfde', 'cases.read.all', 'Ver todos los casos', 'cases', 'read', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('01be3d4f-3a4c-4934-8254-f6f841cfba73', 'cases.update.own', 'Actualizar propios casos', 'cases', 'update', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('6981fcce-55b3-41d4-b658-be3ce04d3db3', 'cases.update.all', 'Actualizar todos los casos', 'cases', 'update', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('5913429b-d29b-427b-8694-7d1ea3a38ee9', 'cases.delete.own', 'Eliminar propios casos', 'cases', 'delete', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('c3c6d0bc-f612-4458-9799-64f4b3899e2b', 'cases.delete.all', 'Eliminar todos los casos', 'cases', 'delete', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('90216016-e01b-4394-8b3f-ff21df74fa94', 'users.create', 'Crear nuevos usuarios', 'users', 'create', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('a5973838-f713-4af0-8569-8dc41561b284', 'users.read', 'Ver usuarios', 'users', 'read', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('434a8159-fd83-42b2-a2a5-44a535bbde4a', 'users.update', 'Actualizar usuarios', 'users', 'update', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('2d2328e6-d610-4996-91f3-d11789e2e70f', 'users.delete', 'Eliminar usuarios', 'users', 'delete', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('e8c2aff2-3473-4ddb-8e96-a5a6b701b6a0', 'users.manage', 'Gestión completa de usuarios', 'users', 'manage', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('b2415721-850b-4ffd-97f1-71fea5cd8567', 'origenes.create', 'Crear nuevos orígenes', 'origenes', 'create', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('863a8b7d-96f2-4ab8-83cc-f87dc6f68674', 'origenes.read', 'Ver orígenes', 'origenes', 'read', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('5e1007b9-3c18-450b-8bd8-abeb30e09c3b', 'origenes.update', 'Actualizar orígenes', 'origenes', 'update', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('93172f15-0779-4263-bed7-a981965a50a0', 'origenes.delete', 'Eliminar orígenes', 'origenes', 'delete', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('0db0ee15-bffa-4df4-8c58-1d62342e112a', 'origenes.manage', 'Gestión completa de orígenes', 'origenes', 'manage', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('52685709-5a78-4721-bbc6-d42ccb5c0e52', 'aplicaciones.create', 'Crear nuevas aplicaciones', 'aplicaciones', 'create', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('3fd5c4fd-25c5-472e-9a39-13d9344ca3d4', 'aplicaciones.read', 'Ver aplicaciones', 'aplicaciones', 'read', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('2e70fc8a-8108-48bb-b40b-ff6d3de321da', 'aplicaciones.update', 'Actualizar aplicaciones', 'aplicaciones', 'update', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('8d2a65a5-6bdb-4b1d-8505-c1c63cb1e895', 'aplicaciones.delete', 'Eliminar aplicaciones', 'aplicaciones', 'delete', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('c3e28838-a6a8-4f95-851d-70396c619662', 'aplicaciones.manage', 'Gestión completa de aplicaciones', 'aplicaciones', 'manage', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('34bbdab3-0b05-4847-a291-d65e6c550f09', 'roles.create', 'Crear nuevos roles', 'roles', 'create', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('99c7eda3-0313-49c0-8791-5181747f7bd9', 'roles.read', 'Ver roles', 'roles', 'read', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('ca959e9b-73ac-44f8-a3be-9b01d4b4673f', 'roles.update', 'Actualizar roles', 'roles', 'update', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('dc9e7239-4c03-4913-a9c7-ab493a3c97a0', 'roles.delete', 'Eliminar roles', 'roles', 'delete', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('64262e94-57b9-4dc6-a1a5-56e4786131a4', 'roles.manage', 'Gestión completa de roles', 'roles', 'manage', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('95b5c5f6-b1d2-4b3b-a410-e298e9cbacae', 'permissions.create', 'Crear nuevos permisos', 'permissions', 'create', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('2605051b-ddb8-4ab8-9414-14d9c37801b2', 'permissions.read', 'Ver permisos', 'permissions', 'read', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('f8e381ff-83c6-486a-9b33-07da32aba59f', 'permissions.update', 'Actualizar permisos', 'permissions', 'update', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('d8fe1a6b-af99-443f-b398-335d1d087c63', 'permissions.delete', 'Eliminar permisos', 'permissions', 'delete', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('306099d3-7785-4b43-888e-05be1f45cb78', 'permissions.manage', 'Gestión completa de permisos', 'permissions', 'manage', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('67c071fb-21cb-4f96-947a-5ea69d45cc27', 'admin.access', 'Acceso al panel de administración', 'admin', 'access', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('51a8bd7e-3548-4138-b410-c94b62978caf', 'admin.dashboard', 'Ver dashboard administrativo', 'admin', 'read', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('5814faef-6843-427d-92d9-723502a9a7a7', 'admin.tests', 'Acceso a herramientas de testing', 'admin', 'access', true, '2025-07-05 15:31:17.868429+00', '2025-07-05 15:31:17.868429+00'),
	('5a4d550f-b29b-4eda-b5bc-05f6198689d4', 'case_control.view', 'Ver módulo de control de casos', 'case_control', 'read', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('1236ab5f-e06e-497d-9734-e62ac8a7aff4', 'case_control.view_all', 'Ver todos los controles de casos (admin)', 'case_control', 'read', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('92f4a6c5-db72-4457-bc44-f35d8701ba7b', 'case_control.view_own', 'Ver solo sus propios controles de casos', 'case_control', 'read', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('ac2492f6-999b-4341-b54f-3a3c887c321d', 'case_control.manage_status', 'Gestionar estados de casos en control', 'case_control', 'manage', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('f12d7050-3cad-45a7-b1b9-7b53a996cfc9', 'case_control.update_status', 'Actualizar estado de casos', 'case_control', 'update', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('0ea6a6ee-1089-461a-9990-da22480adc26', 'case_control.start_timer', 'Iniciar/pausar timer de casos', 'case_control', 'create', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('91fb9bd3-e746-4ae6-801e-4659b29d5238', 'case_control.add_manual_time', 'Agregar tiempo manual a casos', 'case_control', 'create', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('e44744f5-f136-4e78-9767-8ee474c2ee3c', 'case_control.edit_time', 'Editar entradas de tiempo', 'case_control', 'update', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('7f9ef342-34b0-44af-921e-3c047b7b7a12', 'case_control.delete_time', 'Eliminar entradas de tiempo', 'case_control', 'delete', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('81c9455f-423d-43ed-b35f-6617da92f183', 'case_control.assign_cases', 'Asignar casos a usuarios', 'case_control', 'create', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('6a96dd7d-e218-4888-a52f-30f5af8f8333', 'case_control.reassign_cases', 'Reasignar casos entre usuarios', 'case_control', 'update', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('d9bdd7bb-f754-4380-9fb7-f7e78303b079', 'case_control.view_reports', 'Ver reportes de tiempo', 'case_control', 'read', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('963ef9e9-b912-4ff1-8fe2-c92bc4ca0a9d', 'case_control.export_reports', 'Exportar reportes de tiempo', 'case_control', 'read', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('b6417618-cdc7-46ba-837f-3de74fde62eb', 'case_control.view_team_reports', 'Ver reportes del equipo', 'case_control', 'read', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('c2efe52b-2ea8-440f-b817-1eb2793b1da7', 'case_control.view_dashboard', 'Ver dashboard de control de casos', 'case_control', 'read', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('49e6f2d7-422f-47a3-aa9d-26d2d813473b', 'case_control.view_team_stats', 'Ver estadísticas del equipo', 'case_control', 'read', true, '2025-07-05 17:04:55.210826+00', '2025-07-05 17:04:55.210826+00'),
	('7d68558d-063b-4df4-84d0-cf78cd0937e9', 'system.access', 'Acceso básico al sistema', 'system', 'access', true, '2025-07-05 22:23:48.172067+00', '2025-07-05 22:23:48.172067+00'),
	('9354de6d-0089-4c7c-985a-755a75b9f720', 'view_todos', 'Ver lista de TODOs', 'todos', 'view', true, '2025-07-06 01:52:27.580606+00', '2025-07-06 01:52:27.580606+00'),
	('8850ecfb-ffe8-4f78-b7f4-01922fc2ac8a', 'create_todos', 'Crear nuevos TODOs', 'todos', 'create', true, '2025-07-06 01:52:27.580606+00', '2025-07-06 01:52:27.580606+00'),
	('65572ca1-d61c-42be-a34a-742de7a3b892', 'edit_todos', 'Editar TODOs existentes', 'todos', 'edit', true, '2025-07-06 01:52:27.580606+00', '2025-07-06 01:52:27.580606+00'),
	('08ef5e44-480b-43de-85f4-6aca582b7712', 'delete_todos', 'Eliminar TODOs', 'todos', 'delete', true, '2025-07-06 01:52:27.580606+00', '2025-07-06 01:52:27.580606+00'),
	('8cfc582f-619b-4e59-9122-30b44c14383c', 'assign_todos', 'Asignar TODOs a usuarios', 'todos', 'assign', true, '2025-07-06 01:52:27.580606+00', '2025-07-06 01:52:27.580606+00'),
	('74bc37d1-665c-45f9-9bdf-78ba2df4b283', 'manage_todo_priorities', 'Gestionar prioridades de TODO', 'todo_priorities', 'manage', true, '2025-07-06 01:52:27.580606+00', '2025-07-06 01:52:27.580606+00'),
	('f6bf011b-51b1-43f7-a1d8-469d13d278da', 'view_all_todos', 'Ver todos los TODOs del sistema', 'todos', 'view_all', true, '2025-07-06 01:52:27.580606+00', '2025-07-06 01:52:27.580606+00'),
	('c7dd4ab9-9ec0-4e53-8eb4-ddd984d91ee3', 'todo_time_tracking', 'Usar timer y seguimiento de tiempo en TODOs', 'todo_control', 'time_tracking', true, '2025-07-06 01:52:27.580606+00', '2025-07-06 01:52:27.580606+00'),
	('7999b742-73ef-41ba-b072-c22b9144dc72', 'export_todos', 'Exportar datos de TODOs', 'todos', 'export', true, '2025-07-06 01:52:27.580606+00', '2025-07-06 01:52:27.580606+00'),
	('fe07dec4-ad56-4cce-ac5d-0858506fabae', 'notifications.view', 'Ver notificaciones', 'notifications', 'read', true, '2025-07-08 00:19:38.10605+00', '2025-07-08 00:19:38.10605+00'),
	('a4704da6-deb3-4b85-a2c5-2823c6bc2b86', 'notifications.manage', 'Gestionar notificaciones', 'notifications', 'write', true, '2025-07-08 00:19:38.10605+00', '2025-07-08 00:19:38.10605+00'),
	('c71ba7f2-0297-43e7-98e5-4fb51c006fa2', 'notes.view', 'Ver notas propias', 'notes', 'view', true, '2025-07-17 17:54:54.009297+00', '2025-07-17 17:54:54.009297+00'),
	('07975354-5dbd-4607-859a-7d7dc031406a', 'notes.view_all', 'Ver todas las notas del sistema', 'notes', 'view_all', true, '2025-07-17 17:54:54.009297+00', '2025-07-17 17:54:54.009297+00'),
	('9ecb1e74-a50d-45c7-9e95-f3837aa5596e', 'notes.create', 'Crear nuevas notas', 'notes', 'create', true, '2025-07-17 17:54:54.009297+00', '2025-07-17 17:54:54.009297+00'),
	('002486eb-5bde-41d2-9b00-a75b613fda4f', 'notes.edit', 'Editar notas propias', 'notes', 'edit', true, '2025-07-17 17:54:54.009297+00', '2025-07-17 17:54:54.009297+00'),
	('3f0ba790-4330-47a8-8d2f-feeace44b6a9', 'notes.edit_all', 'Editar todas las notas', 'notes', 'edit_all', true, '2025-07-17 17:54:54.009297+00', '2025-07-17 17:54:54.009297+00'),
	('9816c91b-e9d9-44df-922d-9bd5817f6a2c', 'notes.delete', 'Eliminar notas propias', 'notes', 'delete', true, '2025-07-17 17:54:54.009297+00', '2025-07-17 17:54:54.009297+00'),
	('2b734a8b-638b-43ed-a9eb-4d186a5164b4', 'notes.delete_all', 'Eliminar todas las notas', 'notes', 'delete_all', true, '2025-07-17 17:54:54.009297+00', '2025-07-17 17:54:54.009297+00'),
	('1b75509f-f065-4ba5-883e-0a18dfbafc80', 'notes.assign', 'Asignar notas a otros usuarios', 'notes', 'assign', true, '2025-07-17 17:54:54.009297+00', '2025-07-17 17:54:54.009297+00'),
	('6031359f-d2c5-4ba2-b4d4-b451d1063e0f', 'notes.archive', 'Archivar notas', 'notes', 'archive', true, '2025-07-17 17:54:54.009297+00', '2025-07-17 17:54:54.009297+00'),
	('4004d4ba-adf7-4b25-952c-6ba0a489b9ce', 'notes.manage_tags', 'Gestionar tags del sistema', 'notes', 'manage_tags', true, '2025-07-17 17:54:54.009297+00', '2025-07-17 17:54:54.009297+00'),
	('c180de80-c2d6-4222-ae07-7f72d9a1b04f', 'notes.associate_cases', 'Asociar notas con casos', 'notes', 'associate_cases', true, '2025-07-17 17:54:54.009297+00', '2025-07-17 17:54:54.009297+00'),
	('28386642-6b09-4f13-9489-841aa512323c', 'notes.view_team', 'Ver notas del equipo', 'notes', 'view_team', true, '2025-07-17 17:54:54.009297+00', '2025-07-17 17:54:54.009297+00'),
	('a1cb6d76-690a-4248-9080-f81ac2283a5a', 'notes.export', 'Exportar notas', 'notes', 'export', true, '2025-07-17 17:54:54.009297+00', '2025-07-17 17:54:54.009297+00');


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."role_permissions" ("id", "role_id", "permission_id", "created_at") VALUES
	('32bd34af-9915-47fb-aecd-4f5ded3ab76a', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '51465ad8-c9bf-4016-a1af-c8bca337919e', '2025-07-05 15:31:17.868429+00'),
	('352b92ad-e1d6-4f7d-9bab-ff10b1f9ab9c', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '1ddd24f6-8b78-4afb-934f-9442cb598bc5', '2025-07-05 15:31:17.868429+00'),
	('db65b03f-534f-4319-bcc3-2cdbee5e6f00', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '818550b9-b1dd-4c32-95f6-98466202dfde', '2025-07-05 15:31:17.868429+00'),
	('29fd50b3-2489-4e82-9fec-f9813d185773', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '01be3d4f-3a4c-4934-8254-f6f841cfba73', '2025-07-05 15:31:17.868429+00'),
	('43692b1b-a823-4fc9-80ce-8a67b18e02da', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '6981fcce-55b3-41d4-b658-be3ce04d3db3', '2025-07-05 15:31:17.868429+00'),
	('ebb57abb-6cdd-47aa-8028-592ed5aaafda', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '5913429b-d29b-427b-8694-7d1ea3a38ee9', '2025-07-05 15:31:17.868429+00'),
	('6f670c55-9cd6-45c6-b91f-050f27b7883b', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'c3c6d0bc-f612-4458-9799-64f4b3899e2b', '2025-07-05 15:31:17.868429+00'),
	('2c01ffb3-6162-41b1-ba5e-32a1c7ebbb28', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '90216016-e01b-4394-8b3f-ff21df74fa94', '2025-07-05 15:31:17.868429+00'),
	('3a1fe384-c8d2-4f6b-8982-be75b2614737', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'a5973838-f713-4af0-8569-8dc41561b284', '2025-07-05 15:31:17.868429+00'),
	('755f6f67-96ad-46c8-93df-2553e93eca71', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '434a8159-fd83-42b2-a2a5-44a535bbde4a', '2025-07-05 15:31:17.868429+00'),
	('3a0ee614-15d4-42af-bb72-c5fbcd2e35ff', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '2d2328e6-d610-4996-91f3-d11789e2e70f', '2025-07-05 15:31:17.868429+00'),
	('74348b5a-7717-4952-9d94-7e8fa3fbdb70', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'e8c2aff2-3473-4ddb-8e96-a5a6b701b6a0', '2025-07-05 15:31:17.868429+00'),
	('0a822078-82d2-4300-acab-64cf89603417', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'b2415721-850b-4ffd-97f1-71fea5cd8567', '2025-07-05 15:31:17.868429+00'),
	('e08524dc-9cdc-49eb-a308-85527c02f86a', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '863a8b7d-96f2-4ab8-83cc-f87dc6f68674', '2025-07-05 15:31:17.868429+00'),
	('6391cdde-5cd6-44c9-afbd-9437dbf98444', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '5e1007b9-3c18-450b-8bd8-abeb30e09c3b', '2025-07-05 15:31:17.868429+00'),
	('6f43d0c7-9ee1-4237-85d4-d74ad74ae0b9', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '93172f15-0779-4263-bed7-a981965a50a0', '2025-07-05 15:31:17.868429+00'),
	('be6513b3-34e2-4348-8f88-3664601d0770', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '0db0ee15-bffa-4df4-8c58-1d62342e112a', '2025-07-05 15:31:17.868429+00'),
	('840b01b8-425a-4642-bd28-ada0cb033afa', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '52685709-5a78-4721-bbc6-d42ccb5c0e52', '2025-07-05 15:31:17.868429+00'),
	('05f47ba2-4467-4523-a17a-331629f2c33b', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '3fd5c4fd-25c5-472e-9a39-13d9344ca3d4', '2025-07-05 15:31:17.868429+00'),
	('4ba3864a-ba90-4eb4-9dbf-e33851a09019', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '2e70fc8a-8108-48bb-b40b-ff6d3de321da', '2025-07-05 15:31:17.868429+00'),
	('79423cae-983e-461b-8900-3a30ee68eba8', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '8d2a65a5-6bdb-4b1d-8505-c1c63cb1e895', '2025-07-05 15:31:17.868429+00'),
	('c262db62-2e06-4cee-ae9d-e41131604acb', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'c3e28838-a6a8-4f95-851d-70396c619662', '2025-07-05 15:31:17.868429+00'),
	('8a078f99-1857-4302-ab95-9d5a7a7d5565', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '34bbdab3-0b05-4847-a291-d65e6c550f09', '2025-07-05 15:31:17.868429+00'),
	('5b6e0159-2182-466a-820e-d23aa48d9c61', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '99c7eda3-0313-49c0-8791-5181747f7bd9', '2025-07-05 15:31:17.868429+00'),
	('fdce663e-9b13-4471-b0cc-9c01021081fd', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'ca959e9b-73ac-44f8-a3be-9b01d4b4673f', '2025-07-05 15:31:17.868429+00'),
	('d6461f7a-dac5-4008-8494-c135b62aec2a', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'dc9e7239-4c03-4913-a9c7-ab493a3c97a0', '2025-07-05 15:31:17.868429+00'),
	('f80b3fa0-5ad6-4238-94b2-e4efe2c299d9', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '64262e94-57b9-4dc6-a1a5-56e4786131a4', '2025-07-05 15:31:17.868429+00'),
	('18311c81-f11a-4e68-8aa2-3ea42af03aec', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '95b5c5f6-b1d2-4b3b-a410-e298e9cbacae', '2025-07-05 15:31:17.868429+00'),
	('c45b9b22-910b-4d48-b7bc-bbf3b16e2599', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '2605051b-ddb8-4ab8-9414-14d9c37801b2', '2025-07-05 15:31:17.868429+00'),
	('c0edbc0e-4575-42f9-8c0c-44d2cc87ceb4', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'f8e381ff-83c6-486a-9b33-07da32aba59f', '2025-07-05 15:31:17.868429+00'),
	('bf5ebef8-e009-432f-82b9-0fb016420c31', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'd8fe1a6b-af99-443f-b398-335d1d087c63', '2025-07-05 15:31:17.868429+00'),
	('72ed8e41-7ebb-40bd-a91e-96ebede8726b', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '306099d3-7785-4b43-888e-05be1f45cb78', '2025-07-05 15:31:17.868429+00'),
	('1ba4e4ee-7a14-408c-9ec9-dfcaac54b9d3', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '67c071fb-21cb-4f96-947a-5ea69d45cc27', '2025-07-05 15:31:17.868429+00'),
	('75c7d803-34bb-4a92-aaf1-e52ad893da3d', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '51a8bd7e-3548-4138-b410-c94b62978caf', '2025-07-05 15:31:17.868429+00'),
	('6befba03-9995-49d5-9240-b75b0c216b26', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '5814faef-6843-427d-92d9-723502a9a7a7', '2025-07-05 15:31:17.868429+00'),
	('1ebe5a4c-2018-4e06-a239-f424ad8b0931', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'fe07dec4-ad56-4cce-ac5d-0858506fabae', '2025-07-08 00:19:38.10605+00'),
	('3c2c76a0-15cf-4e76-aff2-b15b7ab966fd', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'a4704da6-deb3-4b85-a2c5-2823c6bc2b86', '2025-07-08 00:19:38.10605+00'),
	('2743fdb7-8e16-491e-968a-969119883b9d', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '0ea6a6ee-1089-461a-9990-da22480adc26', '2025-07-05 17:04:55.210826+00'),
	('ec2ff7e4-0786-499e-b5b4-e800b70c2c9f', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '91fb9bd3-e746-4ae6-801e-4659b29d5238', '2025-07-05 17:04:55.210826+00'),
	('f89d3fb9-fb96-4f2e-af15-e1de010698f8', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '81c9455f-423d-43ed-b35f-6617da92f183', '2025-07-05 17:04:55.210826+00'),
	('2618d101-3899-4edd-9428-18f0453f021f', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '7f9ef342-34b0-44af-921e-3c047b7b7a12', '2025-07-05 17:04:55.210826+00'),
	('01b42048-d51d-42bd-9278-fd525f797e35', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'ac2492f6-999b-4341-b54f-3a3c887c321d', '2025-07-05 17:04:55.210826+00'),
	('2e878ac9-a26b-4f13-9b1d-2f3a8df92692', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '5a4d550f-b29b-4eda-b5bc-05f6198689d4', '2025-07-05 17:04:55.210826+00'),
	('e56c305d-ce20-4936-a0e8-8d5bc9d74862', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '1236ab5f-e06e-497d-9734-e62ac8a7aff4', '2025-07-05 17:04:55.210826+00'),
	('a332e381-845a-438c-a3a5-ba36154d16fa', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '92f4a6c5-db72-4457-bc44-f35d8701ba7b', '2025-07-05 17:04:55.210826+00'),
	('af49b78e-257b-4048-93d6-de97ef4b1e97', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'd9bdd7bb-f754-4380-9fb7-f7e78303b079', '2025-07-05 17:04:55.210826+00'),
	('e478e289-4691-44f7-8a83-3a8c04753e48', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '963ef9e9-b912-4ff1-8fe2-c92bc4ca0a9d', '2025-07-05 17:04:55.210826+00'),
	('eac29078-f3c9-44e7-a564-d103b6a7fcea', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'b6417618-cdc7-46ba-837f-3de74fde62eb', '2025-07-05 17:04:55.210826+00'),
	('6faba921-d7fb-4cf0-91d2-fba0989f64d4', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'c2efe52b-2ea8-440f-b817-1eb2793b1da7', '2025-07-05 17:04:55.210826+00'),
	('f5d7ca5e-f35d-4ffc-a730-36a7a458743c', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '49e6f2d7-422f-47a3-aa9d-26d2d813473b', '2025-07-05 17:04:55.210826+00'),
	('3ca54c19-40e2-4267-a7eb-fae3f3972949', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'f12d7050-3cad-45a7-b1b9-7b53a996cfc9', '2025-07-05 17:04:55.210826+00'),
	('3ea5cd85-9441-4238-a794-9a0fb06d3988', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'e44744f5-f136-4e78-9767-8ee474c2ee3c', '2025-07-05 17:04:55.210826+00'),
	('926ccdec-bea1-4150-9ea6-9c8a9dd710c3', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '6a96dd7d-e218-4888-a52f-30f5af8f8333', '2025-07-05 17:04:55.210826+00'),
	('bcf33ec5-ab4a-41e9-92ba-6d4382c9958e', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'fe07dec4-ad56-4cce-ac5d-0858506fabae', '2025-07-08 00:19:38.10605+00'),
	('2ae59d4e-95ba-4a1e-a05f-ab24dc25776d', '47d60588-411c-4bbe-a710-e0895cebde9f', '01be3d4f-3a4c-4934-8254-f6f841cfba73', '2025-07-16 13:47:54.002309+00'),
	('669fdeb6-0b67-4435-b732-5d5c168b738e', '47d60588-411c-4bbe-a710-e0895cebde9f', '08ef5e44-480b-43de-85f4-6aca582b7712', '2025-07-16 13:47:54.002309+00'),
	('d74dea92-ec5b-441a-9a3b-a17dde9c1146', '47d60588-411c-4bbe-a710-e0895cebde9f', '0ea6a6ee-1089-461a-9990-da22480adc26', '2025-07-16 13:47:54.002309+00'),
	('b1f316a9-9128-472f-8e14-78255efb3b0b', '47d60588-411c-4bbe-a710-e0895cebde9f', '1ddd24f6-8b78-4afb-934f-9442cb598bc5', '2025-07-16 13:47:54.002309+00'),
	('e8ca5154-1c9a-4e93-b567-20b657d0f980', '47d60588-411c-4bbe-a710-e0895cebde9f', '49e6f2d7-422f-47a3-aa9d-26d2d813473b', '2025-07-16 13:47:54.002309+00'),
	('3dead551-062d-44bc-9c33-ef752525a4a9', '47d60588-411c-4bbe-a710-e0895cebde9f', '51465ad8-c9bf-4016-a1af-c8bca337919e', '2025-07-16 13:47:54.002309+00'),
	('7185c998-9a8a-4d59-aba7-951f06ef63b1', '47d60588-411c-4bbe-a710-e0895cebde9f', '5913429b-d29b-427b-8694-7d1ea3a38ee9', '2025-07-16 13:47:54.002309+00'),
	('ba11ee39-43de-4089-af62-a5b0181a9ce0', '47d60588-411c-4bbe-a710-e0895cebde9f', '5a4d550f-b29b-4eda-b5bc-05f6198689d4', '2025-07-16 13:47:54.002309+00'),
	('7b651519-0c58-4a2f-9127-ef67a13c49aa', '47d60588-411c-4bbe-a710-e0895cebde9f', '65572ca1-d61c-42be-a34a-742de7a3b892', '2025-07-16 13:47:54.002309+00'),
	('abefd83f-8198-42e4-92a5-9a6f6c316a49', '47d60588-411c-4bbe-a710-e0895cebde9f', '6a96dd7d-e218-4888-a52f-30f5af8f8333', '2025-07-16 13:47:54.002309+00'),
	('2c7b36ae-313d-4bd1-8586-5c19cf8c817c', '47d60588-411c-4bbe-a710-e0895cebde9f', '7999b742-73ef-41ba-b072-c22b9144dc72', '2025-07-16 13:47:54.002309+00'),
	('9b495456-17b1-4805-9e89-eac9339c9c7e', '47d60588-411c-4bbe-a710-e0895cebde9f', '7d68558d-063b-4df4-84d0-cf78cd0937e9', '2025-07-16 13:47:54.002309+00'),
	('fdf18862-2ec3-4efa-ae7d-906efb94150d', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '9354de6d-0089-4c7c-985a-755a75b9f720', '2025-07-06 01:57:39.936365+00'),
	('98d2f24d-2a93-4462-87ed-2cc64322b2c6', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '8850ecfb-ffe8-4f78-b7f4-01922fc2ac8a', '2025-07-06 01:57:39.936365+00'),
	('bdd3e036-7f05-4b5a-97ec-a7de9b68a4bd', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '65572ca1-d61c-42be-a34a-742de7a3b892', '2025-07-06 01:57:39.936365+00'),
	('ffbeda67-00de-459d-824a-fd8ed7048a8d', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '8cfc582f-619b-4e59-9122-30b44c14383c', '2025-07-06 01:57:39.936365+00'),
	('c27ef5e9-15b3-4a36-94ad-f51bb2475513', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'f6bf011b-51b1-43f7-a1d8-469d13d278da', '2025-07-06 01:57:39.936365+00'),
	('1fe3df39-ae7a-4fcb-a7a7-ddc7e860362a', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'c7dd4ab9-9ec0-4e53-8eb4-ddd984d91ee3', '2025-07-06 01:57:39.936365+00'),
	('7377689e-eaec-4571-b597-dccb16412d1f', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '7999b742-73ef-41ba-b072-c22b9144dc72', '2025-07-06 01:57:39.936365+00'),
	('74b9a4a7-07c9-4b7c-890e-de509db96993', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '51465ad8-c9bf-4016-a1af-c8bca337919e', '2025-07-06 01:57:39.936365+00'),
	('ec22e2f5-5578-4897-a87d-e6e32a9fd652', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '818550b9-b1dd-4c32-95f6-98466202dfde', '2025-07-06 01:57:39.936365+00'),
	('7b331329-c4e2-4a3f-a18f-0161a6c4fd6b', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '6981fcce-55b3-41d4-b658-be3ce04d3db3', '2025-07-06 01:57:39.936365+00'),
	('6b248390-a5c9-4c6e-be07-be5d028087b1', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'a5973838-f713-4af0-8569-8dc41561b284', '2025-07-06 01:57:39.936365+00'),
	('4d032607-3cc3-4311-891b-479e17459efb', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'b2415721-850b-4ffd-97f1-71fea5cd8567', '2025-07-06 01:57:39.936365+00'),
	('a0d0dbfe-0625-47d0-994e-dcf112c3bbae', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '863a8b7d-96f2-4ab8-83cc-f87dc6f68674', '2025-07-06 01:57:39.936365+00'),
	('082ebbfc-f0f4-4cc2-ae0a-632b37df426b', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '5e1007b9-3c18-450b-8bd8-abeb30e09c3b', '2025-07-06 01:57:39.936365+00'),
	('ed77df6b-13aa-4276-80cf-bc4db786e119', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '52685709-5a78-4721-bbc6-d42ccb5c0e52', '2025-07-06 01:57:39.936365+00'),
	('00723725-06a9-41a8-b103-21fcc3601265', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '3fd5c4fd-25c5-472e-9a39-13d9344ca3d4', '2025-07-06 01:57:39.936365+00'),
	('b4972441-ef30-4c84-88bd-d7aa70d9a5cf', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '2e70fc8a-8108-48bb-b40b-ff6d3de321da', '2025-07-06 01:57:39.936365+00'),
	('ec0a7c4c-2409-446a-803e-8627ffdc8563', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '99c7eda3-0313-49c0-8791-5181747f7bd9', '2025-07-06 01:57:39.936365+00'),
	('fdff430a-043f-43f1-965f-82553b606f2d', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '2605051b-ddb8-4ab8-9414-14d9c37801b2', '2025-07-06 01:57:39.936365+00'),
	('01e19c9f-b9a4-46c6-aab4-f11f3e5aa348', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '5a4d550f-b29b-4eda-b5bc-05f6198689d4', '2025-07-06 01:57:39.936365+00'),
	('f5bac8b4-0d1a-4083-bebc-33ab5c4b3f44', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '1236ab5f-e06e-497d-9734-e62ac8a7aff4', '2025-07-06 01:57:39.936365+00'),
	('eb87ede4-05e1-40cb-b84d-47a766f6d34c', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '7d68558d-063b-4df4-84d0-cf78cd0937e9', '2025-07-05 22:23:48.172067+00'),
	('7e3f4859-729e-419e-bf84-7f59d26bbd80', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '9354de6d-0089-4c7c-985a-755a75b9f720', '2025-07-06 01:52:27.580606+00'),
	('b32ba1d2-551d-430b-bff0-20e49e94f99e', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '8850ecfb-ffe8-4f78-b7f4-01922fc2ac8a', '2025-07-06 01:52:27.580606+00'),
	('a6629351-e199-499c-b0fb-21448187a41b', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '65572ca1-d61c-42be-a34a-742de7a3b892', '2025-07-06 01:52:27.580606+00'),
	('4ef77a1a-4571-424c-8be5-9c742744a0ea', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '08ef5e44-480b-43de-85f4-6aca582b7712', '2025-07-06 01:52:27.580606+00'),
	('e85b87f9-0966-44dc-b778-4c1694737d71', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '8cfc582f-619b-4e59-9122-30b44c14383c', '2025-07-06 01:52:27.580606+00'),
	('104a37f5-8b0d-4bca-905e-350d3d9872fa', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '74bc37d1-665c-45f9-9bdf-78ba2df4b283', '2025-07-06 01:52:27.580606+00'),
	('0521b8fe-a713-44ef-8d90-b9c55fadd62e', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'f6bf011b-51b1-43f7-a1d8-469d13d278da', '2025-07-06 01:52:27.580606+00'),
	('0291dcef-7ed4-4786-81d4-e7f0a552f4ae', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'c7dd4ab9-9ec0-4e53-8eb4-ddd984d91ee3', '2025-07-06 01:52:27.580606+00'),
	('e6b2a0e4-534d-4ae0-af7e-7cd60cbbad2a', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '7999b742-73ef-41ba-b072-c22b9144dc72', '2025-07-06 01:52:27.580606+00'),
	('dda741e2-e462-45d6-9370-8a5fd7ec1a3c', '47d60588-411c-4bbe-a710-e0895cebde9f', '7f9ef342-34b0-44af-921e-3c047b7b7a12', '2025-07-16 13:47:54.002309+00'),
	('9464656b-23d9-456f-af0b-9ffd6222d5b4', '47d60588-411c-4bbe-a710-e0895cebde9f', '81c9455f-423d-43ed-b35f-6617da92f183', '2025-07-16 13:47:54.002309+00'),
	('be9d25f5-4ea6-4603-b9ba-7ddf320f07aa', '47d60588-411c-4bbe-a710-e0895cebde9f', '8850ecfb-ffe8-4f78-b7f4-01922fc2ac8a', '2025-07-16 13:47:54.002309+00'),
	('1c33aa3f-3eda-4b93-95dd-c74266e10f18', '47d60588-411c-4bbe-a710-e0895cebde9f', '8cfc582f-619b-4e59-9122-30b44c14383c', '2025-07-16 13:47:54.002309+00'),
	('a46db25f-a494-4f28-8912-2767223739c1', '47d60588-411c-4bbe-a710-e0895cebde9f', '91fb9bd3-e746-4ae6-801e-4659b29d5238', '2025-07-16 13:47:54.002309+00'),
	('567f78b7-ea20-47d9-a55c-3bf740ef45e3', '47d60588-411c-4bbe-a710-e0895cebde9f', '92f4a6c5-db72-4457-bc44-f35d8701ba7b', '2025-07-16 13:47:54.002309+00'),
	('dd48569d-ef00-4c48-8d25-f70a78fc0abf', '47d60588-411c-4bbe-a710-e0895cebde9f', '9354de6d-0089-4c7c-985a-755a75b9f720', '2025-07-16 13:47:54.002309+00'),
	('13e4501d-3f22-45ac-ba6b-57dc776a4b61', '47d60588-411c-4bbe-a710-e0895cebde9f', '963ef9e9-b912-4ff1-8fe2-c92bc4ca0a9d', '2025-07-16 13:47:54.002309+00'),
	('c18fa0c0-a847-4e5e-b62c-781d6a954a17', '47d60588-411c-4bbe-a710-e0895cebde9f', 'ac2492f6-999b-4341-b54f-3a3c887c321d', '2025-07-16 13:47:54.002309+00'),
	('43b71ebf-34be-4132-b76c-e63dc998f72b', '47d60588-411c-4bbe-a710-e0895cebde9f', 'b6417618-cdc7-46ba-837f-3de74fde62eb', '2025-07-16 13:47:54.002309+00'),
	('ffed5b38-5af9-46ff-bf58-fe38dabee6a0', '47d60588-411c-4bbe-a710-e0895cebde9f', 'c2efe52b-2ea8-440f-b817-1eb2793b1da7', '2025-07-16 13:47:54.002309+00'),
	('2ddcd32e-200a-4199-81cf-b58253402f52', '47d60588-411c-4bbe-a710-e0895cebde9f', 'c7dd4ab9-9ec0-4e53-8eb4-ddd984d91ee3', '2025-07-16 13:47:54.002309+00'),
	('8d0a73a3-bfad-4699-b013-4f5e486283bb', '47d60588-411c-4bbe-a710-e0895cebde9f', 'd9bdd7bb-f754-4380-9fb7-f7e78303b079', '2025-07-16 13:47:54.002309+00'),
	('2f1f2b64-f79a-4d59-8e0c-9d662d66aa59', '47d60588-411c-4bbe-a710-e0895cebde9f', 'e44744f5-f136-4e78-9767-8ee474c2ee3c', '2025-07-16 13:47:54.002309+00'),
	('27124107-d74a-4d5b-bf3b-9de65ceb7e5b', '47d60588-411c-4bbe-a710-e0895cebde9f', 'f12d7050-3cad-45a7-b1b9-7b53a996cfc9', '2025-07-16 13:47:54.002309+00'),
	('71b3e555-edb8-4183-9b18-087be280302e', '47d60588-411c-4bbe-a710-e0895cebde9f', 'fe07dec4-ad56-4cce-ac5d-0858506fabae', '2025-07-16 13:47:54.002309+00'),
	('81ca6d3d-12f3-4dbd-abf4-01a9f82a4225', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '6031359f-d2c5-4ba2-b4d4-b451d1063e0f', '2025-07-17 17:54:54.009297+00'),
	('43532d4c-adf7-4d5e-b1f8-cd6ec517c8f1', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '1b75509f-f065-4ba5-883e-0a18dfbafc80', '2025-07-17 17:54:54.009297+00'),
	('100d3759-428b-4a43-b297-83dfb20972f8', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'c180de80-c2d6-4222-ae07-7f72d9a1b04f', '2025-07-17 17:54:54.009297+00'),
	('e3cd9bd5-40fc-46ec-9bcb-d37738bfbda5', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '9ecb1e74-a50d-45c7-9e95-f3837aa5596e', '2025-07-17 17:54:54.009297+00'),
	('cdac7e89-18b5-4241-8810-337b92d91ffc', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '9816c91b-e9d9-44df-922d-9bd5817f6a2c', '2025-07-17 17:54:54.009297+00'),
	('2d537d80-06dd-4796-8958-3a0b1fb00e0d', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '2b734a8b-638b-43ed-a9eb-4d186a5164b4', '2025-07-17 17:54:54.009297+00'),
	('aa84ddfe-e707-4aaf-b647-047a1606ce0a', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '002486eb-5bde-41d2-9b00-a75b613fda4f', '2025-07-17 17:54:54.009297+00'),
	('bf4e669a-c2cf-4068-8078-0f253b37dab5', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'ac2492f6-999b-4341-b54f-3a3c887c321d', '2025-07-06 01:57:39.936365+00'),
	('9b7b800a-93d9-4141-89e8-fc4544788944', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'f12d7050-3cad-45a7-b1b9-7b53a996cfc9', '2025-07-06 01:57:39.936365+00'),
	('0a5358b3-f3b5-4f08-a788-35ea02f7bc3a', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '0ea6a6ee-1089-461a-9990-da22480adc26', '2025-07-06 01:57:39.936365+00'),
	('5282b699-8698-450d-a884-cf32425f48f5', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '91fb9bd3-e746-4ae6-801e-4659b29d5238', '2025-07-06 01:57:39.936365+00'),
	('a68e154f-cf5d-4c90-a1c2-1b2448c7f546', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'e44744f5-f136-4e78-9767-8ee474c2ee3c', '2025-07-06 01:57:39.936365+00'),
	('a07d43c3-4445-43d6-9e3b-1da0347d122c', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '3f0ba790-4330-47a8-8d2f-feeace44b6a9', '2025-07-17 17:54:54.009297+00'),
	('a90c01fe-bc14-4911-a06e-c9c1a198bf62', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'a1cb6d76-690a-4248-9080-f81ac2283a5a', '2025-07-17 17:54:54.009297+00'),
	('d6b0c245-08ed-484c-be04-b5463a74255e', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '4004d4ba-adf7-4b25-952c-6ba0a489b9ce', '2025-07-17 17:54:54.009297+00'),
	('e61d02cd-154d-48d5-b388-4f1b92956284', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'c71ba7f2-0297-43e7-98e5-4fb51c006fa2', '2025-07-17 17:54:54.009297+00'),
	('d64d2de8-394e-4d21-a188-2a9a0a3632ae', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '07975354-5dbd-4607-859a-7d7dc031406a', '2025-07-17 17:54:54.009297+00'),
	('3b744889-eff9-4a63-86b3-9015179d284c', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '28386642-6b09-4f13-9489-841aa512323c', '2025-07-17 17:54:54.009297+00'),
	('624f349e-d261-48ba-81f7-f4ef4ab2c3b4', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '6031359f-d2c5-4ba2-b4d4-b451d1063e0f', '2025-07-17 17:54:54.009297+00'),
	('dd93ab01-bd92-4b8c-a279-866b75475c94', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '1b75509f-f065-4ba5-883e-0a18dfbafc80', '2025-07-17 17:54:54.009297+00'),
	('ccfa92be-5185-4479-ad08-23a6305ead53', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'c180de80-c2d6-4222-ae07-7f72d9a1b04f', '2025-07-17 17:54:54.009297+00'),
	('1de5fedd-5217-4300-9dc9-dd0e7e846579', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '9ecb1e74-a50d-45c7-9e95-f3837aa5596e', '2025-07-17 17:54:54.009297+00'),
	('3c6d845b-c5e1-4589-8e4c-b7e68dd9458f', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '9816c91b-e9d9-44df-922d-9bd5817f6a2c', '2025-07-17 17:54:54.009297+00'),
	('5763fabe-ccd6-4278-99ed-8d7c69434ec6', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '002486eb-5bde-41d2-9b00-a75b613fda4f', '2025-07-17 17:54:54.009297+00'),
	('0fc23eec-5daa-4b92-b106-73e896fd77ed', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '3f0ba790-4330-47a8-8d2f-feeace44b6a9', '2025-07-17 17:54:54.009297+00'),
	('6623ce29-b738-4464-ba56-5197ed8e0061', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'a1cb6d76-690a-4248-9080-f81ac2283a5a', '2025-07-17 17:54:54.009297+00'),
	('5c49b478-f59e-4af1-90be-35ebfa815c58', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'c71ba7f2-0297-43e7-98e5-4fb51c006fa2', '2025-07-17 17:54:54.009297+00'),
	('ac7c844d-8715-45f7-97c1-c8ec4c75e596', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '81c9455f-423d-43ed-b35f-6617da92f183', '2025-07-06 01:57:39.936365+00'),
	('0aa493a3-13e9-426f-8877-eb07b31a500e', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '6a96dd7d-e218-4888-a52f-30f5af8f8333', '2025-07-06 01:57:39.936365+00'),
	('7bcf3dc6-dd6a-46cb-bd89-8a9e0b5088d0', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'd9bdd7bb-f754-4380-9fb7-f7e78303b079', '2025-07-06 01:57:39.936365+00'),
	('b6fc02d4-a0ab-4157-bd7c-e96455cc9f6c', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '963ef9e9-b912-4ff1-8fe2-c92bc4ca0a9d', '2025-07-06 01:57:39.936365+00'),
	('4266cc8b-092d-420a-9bd6-70138168d946', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'b6417618-cdc7-46ba-837f-3de74fde62eb', '2025-07-06 01:57:39.936365+00'),
	('87fd1d62-3ba6-45be-8418-61c59661dd9f', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'c2efe52b-2ea8-440f-b817-1eb2793b1da7', '2025-07-06 01:57:39.936365+00'),
	('4167a095-2bd0-4749-9353-cf9501d74eee', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '49e6f2d7-422f-47a3-aa9d-26d2d813473b', '2025-07-06 01:57:39.936365+00'),
	('4a58175b-0e02-45eb-a86f-3eceeb52047b', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '7d68558d-063b-4df4-84d0-cf78cd0937e9', '2025-07-06 01:57:39.936365+00'),
	('a7dea2f9-c647-447b-af44-ba85674e5ab8', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '1ddd24f6-8b78-4afb-934f-9442cb598bc5', '2025-07-06 01:57:39.936365+00'),
	('fef6d809-9f99-4707-8908-790d80e44106', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '07975354-5dbd-4607-859a-7d7dc031406a', '2025-07-17 17:54:54.009297+00'),
	('f732cbe3-c0e9-46e6-9405-9259d73bba60', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '28386642-6b09-4f13-9489-841aa512323c', '2025-07-17 17:54:54.009297+00'),
	('f6773376-e9bd-49f8-b43d-a495d36ec775', '47d60588-411c-4bbe-a710-e0895cebde9f', '6031359f-d2c5-4ba2-b4d4-b451d1063e0f', '2025-07-17 17:54:54.009297+00'),
	('f00bdfac-eb8e-4288-b527-74dcbfa684a7', '47d60588-411c-4bbe-a710-e0895cebde9f', 'c180de80-c2d6-4222-ae07-7f72d9a1b04f', '2025-07-17 17:54:54.009297+00'),
	('f71ded62-541d-42be-b998-212e2ece2829', '47d60588-411c-4bbe-a710-e0895cebde9f', '9ecb1e74-a50d-45c7-9e95-f3837aa5596e', '2025-07-17 17:54:54.009297+00'),
	('332d1dcd-9f91-4663-b5fd-8f0e11499fa8', '47d60588-411c-4bbe-a710-e0895cebde9f', '9816c91b-e9d9-44df-922d-9bd5817f6a2c', '2025-07-17 17:54:54.009297+00'),
	('18091e6d-deeb-47af-a42f-84f987595136', '47d60588-411c-4bbe-a710-e0895cebde9f', '002486eb-5bde-41d2-9b00-a75b613fda4f', '2025-07-17 17:54:54.009297+00'),
	('60d5612c-8254-463d-9adc-2bfb6a5496c0', '47d60588-411c-4bbe-a710-e0895cebde9f', 'c71ba7f2-0297-43e7-98e5-4fb51c006fa2', '2025-07-17 17:54:54.009297+00'),
	('1907fcde-a0a4-4197-9961-2976704cfe95', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '818550b9-b1dd-4c32-95f6-98466202dfde', '2025-07-17 18:53:09.481896+00'),
	('75410699-10a0-44b5-b1e2-b68e2ebb80f9', '12d689a6-c834-4e7b-92a3-8f5891a853ec', 'f6bf011b-51b1-43f7-a1d8-469d13d278da', '2025-07-17 18:53:09.481896+00'),
	('8a0eedfb-d19d-4ed8-ad9d-42fdc8e16bf2', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '9354de6d-0089-4c7c-985a-755a75b9f720', '2025-07-17 18:53:09.481896+00'),
	('ae8cb68a-c0e9-43b0-b056-635f3aa7b1d8', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '07975354-5dbd-4607-859a-7d7dc031406a', '2025-07-17 18:53:09.481896+00'),
	('3569112c-96b8-42ea-b302-97a53db8eb2b', '12d689a6-c834-4e7b-92a3-8f5891a853ec', 'a5973838-f713-4af0-8569-8dc41561b284', '2025-07-17 18:53:09.481896+00'),
	('d9dfa12a-190e-4bb5-b854-0439b8c378a5', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '99c7eda3-0313-49c0-8791-5181747f7bd9', '2025-07-17 18:53:09.481896+00'),
	('b383b086-b83b-4f9d-9b90-b6a115a2d808', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '2605051b-ddb8-4ab8-9414-14d9c37801b2', '2025-07-17 18:53:09.481896+00'),
	('ed6540a9-974d-498d-bc4e-99d18c7d0801', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '1ddd24f6-8b78-4afb-934f-9442cb598bc5', '2025-07-17 18:59:38.332512+00'),
	('51302539-7aed-4bf3-96be-82da1c36b55b', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '863a8b7d-96f2-4ab8-83cc-f87dc6f68674', '2025-07-17 18:59:38.332512+00'),
	('fe88563c-6b83-4929-a88b-7463c5699237', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '3fd5c4fd-25c5-472e-9a39-13d9344ca3d4', '2025-07-17 18:59:38.332512+00'),
	('8cfb55d3-8a1d-4963-bac0-f0d59c8d08bd', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '67c071fb-21cb-4f96-947a-5ea69d45cc27', '2025-07-17 18:59:38.332512+00'),
	('69ddf6f8-d713-4f99-a84a-6bd0cca651bd', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '51a8bd7e-3548-4138-b410-c94b62978caf', '2025-07-17 18:59:38.332512+00'),
	('3d5b84c5-eda6-402f-81b6-59ef35347024', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '5a4d550f-b29b-4eda-b5bc-05f6198689d4', '2025-07-17 18:59:38.332512+00'),
	('14d7ab2a-798b-4916-a74a-de02ab434f93', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '1236ab5f-e06e-497d-9734-e62ac8a7aff4', '2025-07-17 18:59:38.332512+00'),
	('3fbc233f-3c12-4d8b-83fe-bb0a61ba7373', '12d689a6-c834-4e7b-92a3-8f5891a853ec', 'd9bdd7bb-f754-4380-9fb7-f7e78303b079', '2025-07-17 18:59:38.332512+00'),
	('8bc59611-d297-4bd0-aa60-fb7ab96414e2', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '963ef9e9-b912-4ff1-8fe2-c92bc4ca0a9d', '2025-07-17 18:59:38.332512+00'),
	('de3261f1-d402-4732-9a06-f3209d217835', '12d689a6-c834-4e7b-92a3-8f5891a853ec', 'b6417618-cdc7-46ba-837f-3de74fde62eb', '2025-07-17 18:59:38.332512+00'),
	('c55ae99e-5775-453a-b3f5-7827bc3c4a8f', '12d689a6-c834-4e7b-92a3-8f5891a853ec', 'c2efe52b-2ea8-440f-b817-1eb2793b1da7', '2025-07-17 18:59:38.332512+00'),
	('88a32545-5835-4e68-9d53-15c7ac8b3d04', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '49e6f2d7-422f-47a3-aa9d-26d2d813473b', '2025-07-17 18:59:38.332512+00'),
	('528bc387-e495-439a-922f-f3c68db47417', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '7d68558d-063b-4df4-84d0-cf78cd0937e9', '2025-07-17 18:59:38.332512+00'),
	('b26b21eb-cb8d-4120-ac5e-25aeb55984f3', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '7999b742-73ef-41ba-b072-c22b9144dc72', '2025-07-17 18:59:38.332512+00'),
	('261b4015-4802-4162-a429-6fd2d97045e4', '12d689a6-c834-4e7b-92a3-8f5891a853ec', 'fe07dec4-ad56-4cce-ac5d-0858506fabae', '2025-07-17 18:59:38.332512+00'),
	('91e284aa-55aa-4bca-8cfe-30a81c040822', '12d689a6-c834-4e7b-92a3-8f5891a853ec', 'c71ba7f2-0297-43e7-98e5-4fb51c006fa2', '2025-07-17 18:59:38.332512+00'),
	('ceea771d-37e9-49fb-a915-f819c730c62c', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '28386642-6b09-4f13-9489-841aa512323c', '2025-07-17 18:59:38.332512+00'),
	('b4c36b51-669c-4f6f-a1e1-8419fd3a5752', '12d689a6-c834-4e7b-92a3-8f5891a853ec', 'a1cb6d76-690a-4248-9080-f81ac2283a5a', '2025-07-17 18:59:38.332512+00'),
	('37ca4e01-e097-43a4-97d4-64f9d8974f8f', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'b5b4c599-a39f-4ad6-8850-23e56aa01af3', '2025-07-18 23:08:45.134315+00'),
	('9865b3ad-7157-4770-8fe8-d64b795ac4ca', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'd75025b7-aaee-4c71-a2cf-12d54bdec7f1', '2025-07-18 23:08:45.134315+00'),
	('24da45a0-5f2c-4b8d-a7a1-a9a213421474', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '32fb7389-cbb5-4d73-aef8-0f64d179e916', '2025-07-18 23:08:45.134315+00'),
	('9b7537ea-9ce3-4531-ab1a-d88b439e33b9', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '1556b85d-316c-4670-ae49-69ce0ea03f3a', '2025-07-18 23:08:45.134315+00'),
	('879bbe57-ba37-4b74-9bd7-655c2581ebe5', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'f08f07f1-7542-44d0-81ed-bafdf72ab43e', '2025-07-18 23:08:45.134315+00'),
	('1bead8b3-0a66-4e40-8f8c-516389410539', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'a4bac9f9-a811-4424-ad43-ca3d193ba0a9', '2025-07-18 23:08:45.134315+00'),
	('98f0f529-6583-4b51-9775-b8a506d26ce4', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '872a442e-2d1b-4059-ad72-846322bcc2b2', '2025-07-18 23:08:45.134315+00'),
	('69f00139-b4ab-43a3-b52f-bbffb89cdec5', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '23c42caa-c7b4-4155-a33a-149655523b3e', '2025-07-18 23:08:45.134315+00'),
	('9ce8eeda-5052-4a6f-bfad-3fa66a5815ee', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'f61c507e-53d2-42db-a13b-398a57d73301', '2025-07-18 23:08:45.134315+00'),
	('913ab784-e890-40bc-bd45-19a1640ff392', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'bee97a6b-f6fa-4967-91c1-79bc8dbbb58b', '2025-07-18 23:08:45.134315+00'),
	('9524d333-10d1-4862-9af9-b21f573b1edd', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'dee1b185-6d0d-48d1-976b-4f7e2cea00e4', '2025-07-18 23:08:45.134315+00'),
	('d3383308-5356-44bf-a19e-5f5344e6fb50', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '01aa2b63-65b1-4f87-a017-3b0ba2793e81', '2025-07-18 23:08:45.134315+00'),
	('7258abbc-4fea-4bec-ae8e-738a0dceb9aa', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '6da8a8fa-fef8-4484-a39c-38ac25d4d1da', '2025-07-18 23:08:45.134315+00'),
	('129979e2-f9eb-4224-90af-024a597e72eb', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '1bd941cd-cd8c-4556-bfd2-b7940b0279ca', '2025-07-18 23:08:45.134315+00'),
	('4e5ef974-bf77-41d6-9d72-534b489e089d', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'da917aa3-1e68-4e92-bd9e-19c67aaf20a7', '2025-07-18 23:08:45.134315+00'),
	('7823ce84-4b47-4cb5-a641-2f76e6c26585', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '61148cb9-fb75-4397-9c74-3ad7ceb3fdcb', '2025-07-18 23:08:45.134315+00'),
	('464b0350-1c74-4db6-bbfb-a8296d3c79f2', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'c457ccb9-bb61-47ad-b76d-713b6817b56f', '2025-07-18 23:08:45.134315+00'),
	('8ec96109-3bec-48c0-a0ef-95f928af747f', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'ed501c37-5311-4041-ad20-cb3e6d5f104d', '2025-07-18 23:08:45.134315+00'),
	('a56aa724-d7c4-4743-af94-1cbab855beb5', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '93a4a518-2d47-408a-b595-286800ae1806', '2025-07-18 23:08:45.134315+00'),
	('fba94f0a-ed0f-4bb6-97f2-d0816714e3ac', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '196da6f8-0060-44c2-9cfb-7610fdf0e0ff', '2025-07-18 23:08:45.134315+00'),
	('20aabbaf-f588-4cd7-a8a1-184da466cee5', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'e8faa407-6a1b-42ca-b23b-d255bceb0f15', '2025-07-18 23:08:45.134315+00'),
	('855d1abb-b3e3-436b-8690-5c1933781a99', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'fd65004d-2996-4283-af18-3573769e06ae', '2025-07-18 23:08:45.134315+00'),
	('eb7bbc97-7389-42b9-9c23-79f6e9180209', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', 'b3083f70-8a71-4e65-9857-a7642af55ff5', '2025-07-18 23:08:45.134315+00'),
	('8b6b3bf2-99f6-4147-8811-3581ab122bfa', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '3c448e83-7b7c-42f8-85f4-328dc22d1f84', '2025-07-18 23:08:45.134315+00'),
	('8797f767-5fbf-44d7-b40e-6cf3963e5e7c', 'f858cc1c-28aa-437d-b0e3-94bce41cb0b1', '4a3b38f3-5e67-490a-8a38-98acd6cae662', '2025-07-18 23:08:45.134315+00'),
	('c8969043-4919-4dff-8fc4-6f18028399b1', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '3c448e83-7b7c-42f8-85f4-328dc22d1f84', '2025-07-18 23:08:45.134315+00'),
	('c526c7e1-960d-4286-beb6-113bcfcae620', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'b3083f70-8a71-4e65-9857-a7642af55ff5', '2025-07-18 23:08:45.134315+00'),
	('bc4bebf8-bcbb-4658-95f1-cf7ac94b5ea6', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'fd65004d-2996-4283-af18-3573769e06ae', '2025-07-18 23:08:45.134315+00'),
	('1573a342-12d6-436d-b1e3-d296b97a2082', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'e8faa407-6a1b-42ca-b23b-d255bceb0f15', '2025-07-18 23:08:45.134315+00'),
	('e10be455-93bd-4524-9ac5-63e404c6cee2', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'b5b4c599-a39f-4ad6-8850-23e56aa01af3', '2025-07-18 23:08:45.134315+00'),
	('96f74c20-9f73-4771-99ed-a6fd3f60f1f5', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'f08f07f1-7542-44d0-81ed-bafdf72ab43e', '2025-07-18 23:08:45.134315+00'),
	('ea37be89-4901-4874-8d00-f20aa9dcf9c0', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'd75025b7-aaee-4c71-a2cf-12d54bdec7f1', '2025-07-18 23:08:45.134315+00'),
	('ac7d2b9d-df0a-4903-a47d-e7f8d411d850', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '32fb7389-cbb5-4d73-aef8-0f64d179e916', '2025-07-18 23:08:45.134315+00'),
	('0659eab2-d585-4492-8c03-9a743478da94', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '61148cb9-fb75-4397-9c74-3ad7ceb3fdcb', '2025-07-18 23:08:45.134315+00'),
	('6e859c73-4998-43a2-8959-d81901de3fee', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'dee1b185-6d0d-48d1-976b-4f7e2cea00e4', '2025-07-18 23:08:45.134315+00'),
	('7464ae67-522d-4065-8739-67c7c96a3fc8', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '1bd941cd-cd8c-4556-bfd2-b7940b0279ca', '2025-07-18 23:08:45.134315+00'),
	('9e37321f-1f32-41fa-8a06-0beb4ac076de', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'da917aa3-1e68-4e92-bd9e-19c67aaf20a7', '2025-07-18 23:08:45.134315+00'),
	('32872a03-ca5e-4d34-bd96-1e52d42abf34', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '01aa2b63-65b1-4f87-a017-3b0ba2793e81', '2025-07-18 23:08:45.134315+00'),
	('eb1092e1-85b0-4390-a6f2-da49e220ed0a', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '6da8a8fa-fef8-4484-a39c-38ac25d4d1da', '2025-07-18 23:08:45.134315+00'),
	('2a4346c2-77a1-49d5-b7ad-1eca89331f48', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'c457ccb9-bb61-47ad-b76d-713b6817b56f', '2025-07-18 23:08:45.134315+00'),
	('da94bd4e-9788-4c5d-bc14-aa9b4087588f', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '196da6f8-0060-44c2-9cfb-7610fdf0e0ff', '2025-07-18 23:08:45.134315+00'),
	('65d27b15-4f9e-4ab7-a5e6-d54cfb186251', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'ed501c37-5311-4041-ad20-cb3e6d5f104d', '2025-07-18 23:08:45.134315+00'),
	('fce2806d-f180-4df2-9562-acb0c7887d24', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '93a4a518-2d47-408a-b595-286800ae1806', '2025-07-18 23:08:45.134315+00'),
	('240071aa-11c3-47b3-9989-db825b475423', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'a4bac9f9-a811-4424-ad43-ca3d193ba0a9', '2025-07-18 23:08:45.134315+00'),
	('0cb59005-8220-48b2-9933-bff5ec15b2e3', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'f61c507e-53d2-42db-a13b-398a57d73301', '2025-07-18 23:08:45.134315+00'),
	('3c906aa6-0a67-4565-9ea7-4590ef12f1d9', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '872a442e-2d1b-4059-ad72-846322bcc2b2', '2025-07-18 23:08:45.134315+00'),
	('539d2718-f63f-4c29-b109-abb1cfea2f22', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', 'bee97a6b-f6fa-4967-91c1-79bc8dbbb58b', '2025-07-18 23:08:45.134315+00'),
	('81df8e59-7972-47b3-b531-c751e8a787d7', '2126889a-b00b-4f61-bd3c-02e9c956c4ca', '23c42caa-c7b4-4155-a33a-149655523b3e', '2025-07-18 23:08:45.134315+00'),
	('c31d0be8-7f9c-4136-950b-8f936d05e1f3', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '3c448e83-7b7c-42f8-85f4-328dc22d1f84', '2025-07-18 23:08:45.134315+00'),
	('c0db1d40-244a-4813-89e5-30ca51cf340a', '12d689a6-c834-4e7b-92a3-8f5891a853ec', 'fd65004d-2996-4283-af18-3573769e06ae', '2025-07-18 23:08:45.134315+00'),
	('c8dbee9e-87db-4f56-b968-5f93b546909e', '12d689a6-c834-4e7b-92a3-8f5891a853ec', 'd75025b7-aaee-4c71-a2cf-12d54bdec7f1', '2025-07-18 23:08:45.134315+00'),
	('ff7b5b24-38e7-48d1-8657-03b09f549b91', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '01aa2b63-65b1-4f87-a017-3b0ba2793e81', '2025-07-18 23:08:45.134315+00'),
	('f9a756a8-31a5-407b-a80b-68299a6ad197', '12d689a6-c834-4e7b-92a3-8f5891a853ec', 'ed501c37-5311-4041-ad20-cb3e6d5f104d', '2025-07-18 23:08:45.134315+00'),
	('daed55f5-08d4-4dd6-beae-eeb6068b1c6c', '12d689a6-c834-4e7b-92a3-8f5891a853ec', '872a442e-2d1b-4059-ad72-846322bcc2b2', '2025-07-18 23:08:45.134315+00');


--
-- Data for Name: time_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."time_entries" ("id", "case_control_id", "user_id", "start_time", "end_time", "duration_minutes", "entry_type", "description", "created_at", "updated_at") VALUES
	('5a1a8fe7-edf5-4d96-aade-0e37bcb84b68', '8333de8a-0620-48e0-94d6-d418de3dd88b', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-07 13:29:58.886+00', '2025-07-07 13:35:01.78+00', 5, 'automatic', NULL, '2025-07-07 13:35:01.89312+00', '2025-07-07 13:35:01.89312+00'),
	('65b15087-6cb0-4000-a2e1-9cff5001793f', '8333de8a-0620-48e0-94d6-d418de3dd88b', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-07 13:35:13.16+00', '2025-07-07 13:57:15.194+00', 22, 'automatic', NULL, '2025-07-07 13:57:15.302444+00', '2025-07-07 13:57:15.302444+00'),
	('930d5864-0e44-40f3-88ef-a85ab0a9be10', '8333de8a-0620-48e0-94d6-d418de3dd88b', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-07 14:22:41.631+00', '2025-07-07 14:23:00.011+00', 0, 'automatic', NULL, '2025-07-07 14:23:00.118869+00', '2025-07-07 14:23:00.118869+00'),
	('53d9efce-004e-449e-a550-a8df6df0ce09', 'f767e6d3-55eb-4d9a-96c7-5eb41d60057d', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-07 17:09:53.098+00', '2025-07-07 19:32:11.958+00', 142, 'automatic', NULL, '2025-07-07 19:32:12.119497+00', '2025-07-07 19:32:12.119497+00'),
	('30097c55-6b08-41c3-bfe4-acc5efbb3100', 'f767e6d3-55eb-4d9a-96c7-5eb41d60057d', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-08 14:57:19.84+00', '2025-07-08 15:57:26.367+00', 60, 'automatic', NULL, '2025-07-08 15:57:28.137039+00', '2025-07-08 15:57:28.137039+00'),
	('2de879b7-4204-4b37-adb1-8a4fd4e6a362', 'd402fdd2-dbb8-45df-85a6-44732c82a29d', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-08 15:59:51.113+00', '2025-07-08 19:08:36.699+00', 189, 'automatic', NULL, '2025-07-08 19:08:38.350498+00', '2025-07-08 19:08:38.350498+00'),
	('8f027581-1dcf-4158-88e3-c0cfb11282cd', 'd402fdd2-dbb8-45df-85a6-44732c82a29d', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-09 13:30:55.51+00', '2025-07-09 20:19:57.503+00', 409, 'automatic', NULL, '2025-07-09 20:19:58.474464+00', '2025-07-09 20:19:58.474464+00'),
	('dde5a1fe-c8a2-4a99-909b-27f13cf7bc5a', '04cd43e1-505c-4c07-a75f-ff430d226080', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-10 13:48:14.848+00', '2025-07-10 16:17:49.792+00', 150, 'automatic', NULL, '2025-07-10 16:17:50.590533+00', '2025-07-10 16:17:50.590533+00'),
	('a15b5086-2594-44e6-8835-381cb628465e', '04cd43e1-505c-4c07-a75f-ff430d226080', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-10 16:42:00.56+00', '2025-07-11 00:21:28.058+00', 459, 'automatic', NULL, '2025-07-11 00:21:28.470451+00', '2025-07-11 00:21:28.470451+00'),
	('3fbd24b9-bd1a-42a9-881c-9b464d6012c3', '3767247f-83f0-4e0f-943a-9e8540754a65', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-11 13:07:41.094+00', '2025-07-11 20:10:10.57+00', 422, 'automatic', NULL, '2025-07-11 20:10:12.85007+00', '2025-07-11 20:10:12.85007+00'),
	('0ee7df74-1705-47eb-9c75-671c4c2621d6', 'd402fdd2-dbb8-45df-85a6-44732c82a29d', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-15 15:30:23.618+00', '2025-07-15 18:20:26.128+00', 170, 'automatic', NULL, '2025-07-15 18:20:26.608836+00', '2025-07-15 18:20:26.608836+00'),
	('351110e9-f70c-493b-b6cf-17f6e499465a', 'eeb705dd-f60c-43e7-8ff0-646f9db14e17', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-15 18:22:11.564+00', '2025-07-15 22:39:07.378+00', 257, 'automatic', NULL, '2025-07-15 22:39:07.664033+00', '2025-07-15 22:39:07.664033+00'),
	('42852a1e-7365-481d-b3e7-60af1fdc5cfc', 'a0d10fb4-9a37-473b-9b13-d35958867ba8', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-16 16:04:59.632+00', '2025-07-16 16:05:01.025+00', 0, 'automatic', NULL, '2025-07-16 16:05:02.502329+00', '2025-07-16 16:05:02.502329+00'),
	('2cb44f26-5bf8-4eda-beaf-056ef6c464c8', 'd8c2d20b-11b0-4d15-96b8-4aa7ffd7e3ca', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-17 15:31:35.577+00', '2025-07-17 17:25:02.835+00', 113, 'automatic', NULL, '2025-07-17 17:25:05.016317+00', '2025-07-17 17:25:05.016317+00'),
	('bc61dd91-56cc-459b-a3a7-f73cb2c40e53', '8333de8a-0620-48e0-94d6-d418de3dd88b', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-18 13:46:20.219+00', '2025-07-18 14:46:34.755+00', 60, 'automatic', NULL, '2025-07-18 14:46:35.091873+00', '2025-07-18 14:46:35.091873+00'),
	('111765f7-6564-46dd-a41b-912446bf816e', 'd402fdd2-dbb8-45df-85a6-44732c82a29d', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-18 14:46:37.194+00', '2025-07-18 19:49:57.35+00', 303, 'automatic', NULL, '2025-07-18 19:49:57.786142+00', '2025-07-18 19:49:57.786142+00');


--
-- Data for Name: todo_priorities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."todo_priorities" ("id", "name", "description", "color", "level", "is_active", "display_order", "created_at", "updated_at") VALUES
	('511e006a-68c1-4a93-9ae3-803ab13991d9', 'Muy Baja', 'Tareas de muy baja prioridad - pueden esperar', '#10B981', 1, true, 10, '2025-07-06 01:52:27.580606+00', '2025-07-06 01:52:27.580606+00'),
	('b0536493-81d6-418c-86d2-01e0d344d978', 'Baja', 'Tareas de baja prioridad - sin urgencia', '#3B82F6', 2, true, 20, '2025-07-06 01:52:27.580606+00', '2025-07-06 01:52:27.580606+00'),
	('10357b5f-50d5-4bea-bf01-c6b0ceb3418d', 'Media', 'Tareas de prioridad media - atención normal', '#F59E0B', 3, true, 30, '2025-07-06 01:52:27.580606+00', '2025-07-06 01:52:27.580606+00'),
	('325b01f2-b18a-48ad-b0b6-7e57a2afba3c', 'Alta', 'Tareas de alta prioridad - requieren atención pronto', '#EF4444', 4, true, 40, '2025-07-06 01:52:27.580606+00', '2025-07-06 01:52:27.580606+00'),
	('7d08c7a3-60f5-4ccb-ad57-672b948d0c64', 'Crítica', 'Tareas críticas - atención inmediata requerida', '#DC2626', 5, true, 50, '2025-07-06 01:52:27.580606+00', '2025-07-06 01:52:27.580606+00');


--
-- Data for Name: todos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."todos" ("id", "title", "description", "priority_id", "assigned_user_id", "created_by_user_id", "due_date", "estimated_minutes", "is_completed", "completed_at", "created_at", "updated_at") VALUES
	('13da5aae-5b80-40fe-9976-fb44902f76cb', 'Validación informes Sigla', 'Validación de la información requerida para la generación de los informes solicitados mediante el caso SR2052628', '10357b5f-50d5-4bea-bf01-c6b0ceb3418d', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-07', 120, true, NULL, '2025-07-07 21:21:19.743816+00', '2025-07-14 16:13:21.152896+00');


--
-- Data for Name: todo_control; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."todo_control" ("id", "todo_id", "user_id", "status_id", "total_time_minutes", "timer_start_at", "is_timer_active", "assigned_at", "started_at", "completed_at", "created_at", "updated_at") VALUES
	('2ae9bb90-015f-43e1-8f8d-9b8bcbdd9551', '13da5aae-5b80-40fe-9976-fb44902f76cb', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '6d371a8f-52cd-48fa-9576-1e978ce2ef29', 120, NULL, false, '2025-07-07 21:22:07.905+00', '2025-07-07 21:22:08.479+00', '2025-07-07 21:22:48.194+00', '2025-07-07 21:22:08.095142+00', '2025-07-07 21:22:48.376012+00');


--
-- Data for Name: todo_manual_time_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."todo_manual_time_entries" ("id", "todo_control_id", "user_id", "date", "duration_minutes", "description", "created_at", "created_by") VALUES
	('de4a35cc-4844-47dd-8dba-fa55745eec75', '2ae9bb90-015f-43e1-8f8d-9b8bcbdd9551', '079c1a87-1851-479c-a58a-4d8c636d0c6a', '2025-07-07', 120, 'Finalización de reunión', '2025-07-07 21:22:29.894929+00', '079c1a87-1851-479c-a58a-4d8c636d0c6a');


--
-- Data for Name: todo_time_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 175, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
