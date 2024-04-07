# queries.py

def fetch_events(conn):
    query = """
    SELECT e.event_id, e.time, et.name AS event_type_name
    FROM public."event" e
    JOIN public.event_type et ON e.event_type_id = et.event_type_id
    ORDER BY e.time DESC;
    """
    with conn.cursor() as cur:
        cur.execute(query)
        return cur.fetchall()

def fetch_object_types(conn):
    query = """
    SELECT * FROM public.object_type;
    """
    with conn.cursor() as cur:
        cur.execute(query)
        return cur.fetchall()

def fetch_event_types(conn):
    query = """
    SELECT * FROM public.event_type;
    """
    with conn.cursor() as cur:
        cur.execute(query)
        return cur.fetchall()

def fetch_objects(conn):
    query = """
    SELECT o.object_id, ot.name AS object_type_name
    FROM public."object" o
    JOIN public.object_type ot ON o.object_type_id = ot.object_type_id;
    """
    with conn.cursor() as cur:
        cur.execute(query)
        return cur.fetchall()

def fetch_object_hierarchy(conn):
    query = """
    WITH RECURSIVE object_hierarchy AS (
        SELECT 
            child.object_id AS child_id, 
            parent.object_id AS parent_id
        FROM public.object_relationship
        JOIN public."object" child ON object_relationship.object_child_id = child.object_id
        LEFT JOIN public."object" parent ON object_relationship.object_parent_id = parent.object_id
        UNION
        SELECT 
            h.child_id, 
            h.parent_id
        FROM object_hierarchy h
        JOIN public.object_relationship ON h.parent_id = object_relationship.object_child_id
    )
    SELECT * FROM object_hierarchy;
    """
    with conn.cursor() as cur:
        cur.execute(query)
        return cur.fetchall()
