|table_schema|table_name|column_name|data_type|character_maximum_length|column_default|is_nullable|column_comment|
|------------|----------|-----------|---------|------------------------|--------------|-----------|--------------|
|public|event|event_id|integer||nextval('event_event_id_seq'::regclass)|NO|primary key for the event|
|public|event|created_at|timestamp without time zone||now()|NO|created_at for the entry|
|public|event|updated_at|timestamp without time zone||now()|NO|update_at for the entry|
|public|event|event_type_id|integer|||YES|foreign key for the event_type|
|public|event|time|timestamp without time zone||CURRENT_TIMESTAMP|YES|timestamp for the event|
|public|event_attribute|event_attribute_id|integer||nextval('event_attribute_event_attribute_id_seq'::regclass)|NO|primary key for the event_attribute|
|public|event_attribute|created_at|timestamp without time zone||now()|NO|created_at for the entry|
|public|event_attribute|updated_at|timestamp without time zone||now()|NO|update_at for the entry|
|public|event_attribute|event_id|integer|||YES|foreign key for the event|
|public|event_attribute|event_type_attribute_id|integer|||YES|foreign key for the event_type_attribute|
|public|event_attribute|value|character varying|||YES|value for the event_attribute|
|public|event_object_relationship|event_object_relationship_id|integer||nextval('event_object_relationship_event_object_relationship_id_seq'::regclass)|NO|primary key for the event_object_relationship|
|public|event_object_relationship|created_at|timestamp without time zone||now()|NO|created_at for the entry|
|public|event_object_relationship|updated_at|timestamp without time zone||now()|NO|update_at for the entry|
|public|event_object_relationship|event_id|integer|||YES|foreign key for the event|
|public|event_object_relationship|object_id|character varying|||YES|foreign key for the object|
|public|event_object_relationship|qualifier_id|integer|||YES|foreign key for the qualifier|
|public|event_type|event_type_id|integer||nextval('event_type_event_type_id_seq'::regclass)|NO|primary key for the event_type|
|public|event_type|created_at|timestamp without time zone||now()|NO|created_at for the entry|
|public|event_type|updated_at|timestamp without time zone||now()|NO|update_at for the entry|
|public|event_type|name|character varying|||YES|name of the event_type|
|public|event_type_attribute|event_type_attribute_id|integer||nextval('event_type_attribute_event_type_attribute_id_seq'::regclass)|NO|primary key for the event_type_attribute|
|public|event_type_attribute|created_at|timestamp without time zone||now()|NO|created_at for the entry|
|public|event_type_attribute|updated_at|timestamp without time zone||now()|NO|update_at for the entry|
|public|event_type_attribute|event_type_id|integer|||YES|foreign key for the event_type|
|public|event_type_attribute|name|character varying|||YES|name for the event_type_attribute|
|public|event_type_attribute|type|character varying|||YES|datatype for the event_type_attribute|
|public|object|object_id|character varying|||NO|primary key for the object|
|public|object|created_at|timestamp without time zone||now()|NO|created_at for the entry|
|public|object|updated_at|timestamp without time zone||now()|NO|update_at for the entry|
|public|object|object_type_id|integer|||YES|foreign key for the object_type|
|public|object_attribute|object_attribute_id|integer||nextval('object_attribute_object_attribute_id_seq'::regclass)|NO|primary key for the object_attribute|
|public|object_attribute|created_at|timestamp without time zone||now()|NO|created_at for the entry|
|public|object_attribute|updated_at|timestamp without time zone||now()|NO|update_at for the entry|
|public|object_attribute|object_id|character varying|||YES|foreign key for the object|
|public|object_attribute|object_type_attribute_id|integer|||YES|foreign key for the object_type_attribute|
|public|object_attribute|value|character varying|||YES|value for the object_attribute|
|public|object_attribute|time|timestamp without time zone||now()|YES|timestamp for the object_attribute|
|public|object_relationship|object_relationship_id|integer||nextval('object_relationship_object_relationship_id_seq'::regclass)|NO|primary key for the object_relationship|
|public|object_relationship|created_at|timestamp without time zone||now()|NO|created_at for the entry|
|public|object_relationship|updated_at|timestamp without time zone||now()|NO|update_at for the entry|
|public|object_relationship|object_parent_id|character varying|||YES|foreign key for the object|
|public|object_relationship|object_child_id|character varying|||YES|child_id for the object|
|public|object_relationship|qualifier_id|integer|||YES|foreign key for the qualifier|
|public|object_type|object_type_id|integer||nextval('object_type_object_type_id_seq'::regclass)|NO|primary key for the object_type|
|public|object_type|created_at|timestamp without time zone||now()|NO|created_at for the entry|
|public|object_type|updated_at|timestamp without time zone||now()|NO|update_at for the entry|
|public|object_type|name|character varying|||YES|name for the object_type|
|public|object_type_attribute|object_type_attribute_id|integer||nextval('object_type_attribute_object_type_attribute_id_seq'::regclass)|NO|primary key for the object_type_attribute|
|public|object_type_attribute|created_at|timestamp without time zone||now()|NO|created_at for the entry|
|public|object_type_attribute|updated_at|timestamp without time zone||now()|NO|update_at for the entry|
|public|object_type_attribute|object_type_id|integer|||YES|foreign key for the object_type|
|public|object_type_attribute|name|character varying|||YES|name for the object_type_attribute|
|public|object_type_attribute|type|character varying|||YES|type for the object_type_attribute|
|public|qualifier|qualifier_id|integer||nextval('qualifier_qualifier_id_seq'::regclass)|NO|primary key for the qualifier|
|public|qualifier|created_at|timestamp without time zone||now()|NO|created_at for the entry|
|public|qualifier|updated_at|timestamp without time zone||now()|NO|update_at for the entry|
|public|qualifier|value|character varying|||YES|value for the qualifier|
