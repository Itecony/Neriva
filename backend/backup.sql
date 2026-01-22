--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

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
-- Name: enum_users_auth_provider; Type: TYPE; Schema: public; Owner: auth_user
--

CREATE TYPE public.enum_users_auth_provider AS ENUM (
    'local',
    'google'
);


ALTER TYPE public.enum_users_auth_provider OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: auth_user
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    email character varying(255) NOT NULL,
    password character varying(255),
    google_id character varying(255),
    profile_picture character varying(255),
    auth_provider public.enum_users_auth_provider DEFAULT 'local'::public.enum_users_auth_provider NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: auth_user
--

COPY public.users (id, first_name, last_name, email, password, google_id, profile_picture, auth_provider, created_at, updated_at) FROM stdin;
c2ab8136-809b-4902-98cd-971f7e6595d1	John	Doe	john@test.com	$2a$10$QBuXKghK.Z1CDFwdvWIKbOpSiPjAM1ufLZAIqC7SnSj4hZwfIFY76	\N	\N	local	2025-10-04 16:23:32.43+01	2025-10-04 16:23:32.43+01
\.


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: auth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: auth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_google_id_key1; Type: CONSTRAINT; Schema: public; Owner: auth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key1 UNIQUE (google_id);


--
-- Name: users users_google_id_key2; Type: CONSTRAINT; Schema: public; Owner: auth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key2 UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: auth_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_email; Type: INDEX; Schema: public; Owner: auth_user
--

CREATE UNIQUE INDEX users_email ON public.users USING btree (email);


--
-- Name: users_google_id; Type: INDEX; Schema: public; Owner: auth_user
--

CREATE UNIQUE INDEX users_google_id ON public.users USING btree (google_id);


--
-- PostgreSQL database dump complete
--

