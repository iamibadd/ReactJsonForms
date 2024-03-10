BEGIN;

SET client_encoding = 'LATIN1';

--
-- Name: event; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.event (
    event_id integer NOT NULL,
    event_type_id integer NOT NULL,
    "timestamp" timestamp without time zone NOT NULL
);

--
-- Name: event_attribute; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.event_attribute (
    event_attribute_id integer NOT NULL,
    event_type_id integer NOT NULL,
    name character varying(255) NOT NULL
);

--
-- Name: event_attribute_event_attribute_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.event_attribute_event_attribute_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: event_attribute_event_attribute_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.event_attribute_event_attribute_id_seq OWNED BY public.event_attribute.event_attribute_id;


--
-- Name: event_attribute_value; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.event_attribute_value (
    event_attribute_value_id integer NOT NULL,
    event_id integer NOT NULL,
    event_attribute_id integer NOT NULL,
    value json NOT NULL
);

--
-- Name: event_attribute_value_event_attribute_value_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.event_attribute_value_event_attribute_value_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: event_attribute_value_event_attribute_value_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.event_attribute_value_event_attribute_value_id_seq OWNED BY public.event_attribute_value.event_attribute_value_id;

--
-- Name: event_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.event_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: event_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.event_event_id_seq OWNED BY public.event.event_id;

--
-- Name: event_object_relationship; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.event_object_relationship (
    event_object_relationship_id integer NOT NULL,
    event_id integer NOT NULL,
    object_id integer NOT NULL,
    qualifier_id integer NOT NULL
);


--
-- Name: event_object_relationship_event_object_relationship_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.event_object_relationship_event_object_relationship_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: event_object_relationship_event_object_relationship_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.event_object_relationship_event_object_relationship_id_seq OWNED BY public.event_object_relationship.event_object_relationship_id;

--
-- Name: event_type; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.event_type (
    event_type_id integer NOT NULL,
    name character varying(255) NOT NULL
);


-- 
-- Name: event_type_event_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.event_type_event_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 
-- Name: event_type_event_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.event_type_event_type_id_seq OWNED BY public.event_type.event_type_id;

--
-- Name: object; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.object (
    object_id integer NOT NULL,
    object_type_id integer NOT NULL
);

-- 
-- Name: object_attribute; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.object_attribute (
    object_attribute_id integer NOT NULL,
    object_type_id integer NOT NULL,
    name character varying(255) NOT NULL
);

--
-- Name: object_attribute_object_attribute_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.object_attribute_object_attribute_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 
-- Name: object_attribute_object_attribute_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.object_attribute_object_attribute_id_seq OWNED BY public.object_attribute.object_attribute_id;

--
-- Name: object_attribute_value; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.object_attribute_value (
    object_attribute_value_id integer NOT NULL,
    object_id integer NOT NULL,
    object_attribute_id integer NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    value json NOT NULL
);

--
-- Name: object_attribute_value_object_attribute_value_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.object_attribute_value_object_attribute_value_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 
-- Name: object_attribute_value_object_attribute_value_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.object_attribute_value_object_attribute_value_id_seq OWNED BY public.object_attribute_value.object_attribute_value_id;

--
-- Name: object_object_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.object_object_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 
-- Name: object_object_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.object_object_id_seq OWNED BY public.object.object_id;

--
-- Name: object_relationship; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.object_relationship (
    object_relationship_id integer NOT NULL,
    object_parent_id integer NOT NULL,
    object_child_id integer NOT NULL,
    qualifier_id integer
);

-- 
-- Name: object_relationship_object_relationship_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.object_relationship_object_relationship_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 
-- Name: object_relationship_object_relationship_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.object_relationship_object_relationship_id_seq OWNED BY public.object_relationship.object_relationship_id;

--
-- Name: object_type; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.object_type (
    object_type_id integer NOT NULL,
    name character varying(255) NOT NULL
);

-- 
-- Name: object_type_object_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.object_type_object_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 
-- Name: object_type_object_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.object_type_object_type_id_seq OWNED BY public.object_type.object_type_id;

--
-- Name: qualifier; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.qualifier (
    qualifier_id integer NOT NULL,
    value json NOT NULL
);

-- 
-- Name: qualifier_qualifier_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
CREATE SEQUENCE public.qualifier_qualifier_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 
-- Name: qualifier_qualifier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--
ALTER SEQUENCE public.qualifier_qualifier_id_seq OWNED BY public.qualifier.qualifier_id;

--
-- Name: event event_id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event ALTER COLUMN event_id SET DEFAULT nextval('public.event_event_id_seq'::regclass);

--
-- Name: event_attribute event_attribute_id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event_attribute ALTER COLUMN event_attribute_id SET DEFAULT nextval('public.event_attribute_event_attribute_id_seq'::regclass);

--
-- Name: event_attribute_value event_attribute_value_id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event_attribute_value ALTER COLUMN event_attribute_value_id SET DEFAULT nextval('public.event_attribute_value_event_attribute_value_id_seq'::regclass);

--
-- Name: event_object_relationship event_object_relationship_id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event_object_relationship ALTER COLUMN event_object_relationship_id SET DEFAULT nextval('public.event_object_relationship_event_object_relationship_id_seq'::regclass);

--
-- Name: event_type event_type_id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event_type ALTER COLUMN event_type_id SET DEFAULT nextval('public.event_type_event_type_id_seq'::regclass);

--
-- Name: object object_id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object ALTER COLUMN object_id SET DEFAULT nextval('public.object_object_id_seq'::regclass);

--
-- Name: object_attribute object_attribute_id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_attribute ALTER COLUMN object_attribute_id SET DEFAULT nextval('public.object_attribute_object_attribute_id_seq'::regclass);

--
-- Name: object_attribute_value object_attribute_value_id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_attribute_value ALTER COLUMN object_attribute_value_id SET DEFAULT nextval('public.object_attribute_value_object_attribute_value_id_seq'::regclass);

--
-- Name: object_relationship object_relationship_id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_relationship ALTER COLUMN object_relationship_id SET DEFAULT nextval('public.object_relationship_object_relationship_id_seq'::regclass);

--
-- Name: object_type object_type_id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_type ALTER COLUMN object_type_id SET DEFAULT nextval('public.object_type_object_type_id_seq'::regclass);

--
-- Name: qualifier qualifier_id; Type: DEFAULT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.qualifier ALTER COLUMN qualifier_id SET DEFAULT nextval('public.qualifier_qualifier_id_seq'::regclass);

--
-- Name: event_attribute event_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event_attribute
    ADD CONSTRAINT event_attribute_pkey PRIMARY KEY (event_attribute_id);

--
-- Name: event_attribute_value event_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event_attribute_value
    ADD CONSTRAINT event_attribute_value_pkey PRIMARY KEY (event_attribute_value_id);

--
-- Name: event_object_relationship event_object_relationship_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event_object_relationship
    ADD CONSTRAINT event_object_relationship_pkey PRIMARY KEY (event_object_relationship_id);

--
-- Name: event event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (event_id);

--
-- Name: event_type event_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event_type
    ADD CONSTRAINT event_type_pkey PRIMARY KEY (event_type_id);

--
-- Name: object_relationship fk_object_hierarchy; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_relationship
    ADD CONSTRAINT fk_object_hierarchy UNIQUE (object_parent_id, object_child_id);

--
-- Name: object_attribute object_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_attribute
    ADD CONSTRAINT object_attribute_pkey PRIMARY KEY (object_attribute_id);

--
-- Name: object_attribute_value object_attribute_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_attribute_value
    ADD CONSTRAINT object_attribute_value_pkey PRIMARY KEY (object_attribute_value_id);

--
-- Name: object object_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object
    ADD CONSTRAINT object_pkey PRIMARY KEY (object_id);

--
-- TOC entry 3246 (class 2606 OID 17028)
-- Name: object_relationship object_relationship_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_relationship
    ADD CONSTRAINT object_relationship_pkey PRIMARY KEY (object_relationship_id);

--
-- Name: object_type object_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_type
    ADD CONSTRAINT object_type_pkey PRIMARY KEY (object_type_id);

--
-- Name: qualifier qualifier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.qualifier
    ADD CONSTRAINT qualifier_pkey PRIMARY KEY (qualifier_id);

--
-- Name: event_attribute event_attribute_event_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event_attribute
    ADD CONSTRAINT event_attribute_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES public.event_type(event_type_id);

--
-- Name: event_attribute_value event_attribute_value_event_attribute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event_attribute_value
    ADD CONSTRAINT event_attribute_value_event_attribute_id_fkey FOREIGN KEY (event_attribute_id) REFERENCES public.event_attribute(event_attribute_id);

--
-- Name: event_attribute_value event_attribute_value_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event_attribute_value
    ADD CONSTRAINT event_attribute_value_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id);

--
-- Name: event event_event_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES public.event_type(event_type_id);

--
-- Name: event_object_relationship event_object_relationship_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event_object_relationship
    ADD CONSTRAINT event_object_relationship_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id);

--
-- Name: event_object_relationship event_object_relationship_object_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event_object_relationship
    ADD CONSTRAINT event_object_relationship_object_id_fkey FOREIGN KEY (object_id) REFERENCES public.object(object_id);

--
-- Name: event_object_relationship event_object_relationship_qualifier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.event_object_relationship
    ADD CONSTRAINT event_object_relationship_qualifier_id_fkey FOREIGN KEY (qualifier_id) REFERENCES public.qualifier(qualifier_id);

--
-- Name: object_attribute object_attribute_object_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_attribute
    ADD CONSTRAINT object_attribute_object_type_id_fkey FOREIGN KEY (object_type_id) REFERENCES public.object_type(object_type_id);

--
-- Name: object_attribute_value object_attribute_value_object_attribute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_attribute_value
    ADD CONSTRAINT object_attribute_value_object_attribute_id_fkey FOREIGN KEY (object_attribute_id) REFERENCES public.object_attribute(object_attribute_id);

--
-- Name: object_attribute_value object_attribute_value_object_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_attribute_value
    ADD CONSTRAINT object_attribute_value_object_id_fkey FOREIGN KEY (object_id) REFERENCES public.object(object_id);

--
-- Name: object object_object_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object
    ADD CONSTRAINT object_object_type_id_fkey FOREIGN KEY (object_type_id) REFERENCES public.object_type(object_type_id);

--
-- Name: object_relationship object_relationship_object_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_relationship
    ADD CONSTRAINT object_relationship_object_child_id_fkey FOREIGN KEY (object_child_id) REFERENCES public.object(object_id);

--
-- Name: object_relationship object_relationship_object_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_relationship
    ADD CONSTRAINT object_relationship_object_parent_id_fkey FOREIGN KEY (object_parent_id) REFERENCES public.object(object_id);

--
-- Name: object_relationship object_relationship_qualifier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE ONLY public.object_relationship
    ADD CONSTRAINT object_relationship_qualifier_id_fkey FOREIGN KEY (qualifier_id) REFERENCES public.qualifier(qualifier_id);



COMMIT;