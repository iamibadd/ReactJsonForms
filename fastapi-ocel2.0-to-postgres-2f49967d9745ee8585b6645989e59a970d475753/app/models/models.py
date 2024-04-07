from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, func, text
from sqlalchemy.orm import relationship
from database import Base

class EventType(Base):
    """
    Represents an event type in the database. Event types categorize events within the system.

    Attributes:
        event_type_id (Integer): The primary key.
        created_at (TIMESTAMP): Timestamp when the record is created. Automatically set to the current timestamp.
        updated_at (TIMESTAMP): Timestamp when the record is last updated. Automatically updates on record modification.
        name (String): The name of the event type, must be unique and not null.
    """
    __tablename__ = "event_type"
    __table_args__ = {'comment': 'This table holds event_types for the OCEL2.0 schema.'}
    event_type_id = Column(Integer, primary_key=True, info={'description': 'event_type_id as primary key for event_types.'}, comment='primary key for the event_type')
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), info={'description': 'created_at automatically sets current timestamp when the record is created.'}, comment='created_at for the entry')
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now(), info={'description': 'updated_at automatically sets current timestamp when the record is created or updated.'}, comment='update_at for the entry')
    name = Column(String, index=True, info={'description': 'name of event_type, must be unique.'}, comment='name of the event_type')
    
class EventTypeAttribute(Base):
    """
    Represents attributes of an event type.

    Attributes:
        event_type_attribute_id (Integer): The primary key.
        created_at (TIMESTAMP): Timestamp when the record is created, defaults to the current timestamp.
        updated_at (TIMESTAMP): Timestamp when the record is last updated, defaults to the current timestamp.
        event_type_id (Integer): Foreign key to the EventType.
        name (String): The name of the attribute.
        type (String): The data type of the attribute.
    """
    __tablename__ = "event_type_attribute"
    __table_args__ = {'comment': 'This table holds event_type_attributes for the OCEL2.0 schema.'}
    event_type_attribute_id = Column(Integer, primary_key=True, info={'description': 'event_type_attribute_id as primary key for event_type_attributes.'}, comment='primary key for the event_type_attribute')
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), info={'description': 'created_at automatically sets current timestamp when the record is created.'}, comment='created_at for the entry')
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now(), info={'description': 'updated_at automatically sets current timestamp when the record is created or updated.'}, comment='update_at for the entry')
    event_type_id = Column(Integer, ForeignKey("event_type.event_type_id"), info={'description': 'event_type_id as foreign key to event_types.'}, comment='foreign key for the event_type')
    name = Column(String, index=True, comment='name for the event_type_attribute')
    type = Column(String, comment='datatype for the event_type_attribute')

class Event(Base):
    """
    Represents an event.

    Attributes:
        event_id (Integer): The primary key.
        created_at (TIMESTAMP): Timestamp when the record is created, defaults to the current timestamp.
        updated_at (TIMESTAMP): Timestamp when the record is last updated, defaults to the current timestamp.
        event_type_id (Integer): Foreign key to the EventType.
        time (TIMESTAMP): The timestamp of the event occurrence.
    """
    __tablename__ = "event"
    __table_args__ = {'comment': 'This table holds events for the OCEL2.0 schema.'}
    event_id = Column(Integer, primary_key=True, index=True, info={'description': 'event_id as primary key for events.'}, comment='primary key for the event')
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), info={'description': 'created_at automatically sets current timestamp when the record is created.'}, comment='created_at for the entry')
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now(), info={'description': 'updated_at automatically sets current timestamp when the record is created or updated.'}, comment='update_at for the entry')
    event_type_id = Column(Integer, ForeignKey("event_type.event_type_id"), comment='foreign key for the event_type') 
    time = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"), comment='timestamp for the event')

class EventAttribute(Base):
    """
    Represents attributes of an event.

    Attributes:
        event_attribute_id (Integer): The primary key.
        created_at (TIMESTAMP): Timestamp when the record is created, defaults to the current timestamp.
        updated_at (TIMESTAMP): Timestamp when the record is last updated, defaults to the current timestamp.
        event_id (Integer): Foreign key to the Event.
        event_type_attribute_id (Integer): Foreign key to the EventTypeAttribute.
        value (String): The value of the attribute.
    """
    __tablename__ = "event_attribute"
    __table_args__ = {'comment': 'This table holds event_attributes for the OCEL2.0 schema.'}
    event_attribute_id = Column(Integer, primary_key=True, comment='primary key for the event_attribute')
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), info={'description': 'created_at automatically sets current timestamp when the record is created.'}, comment='created_at for the entry')
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now(), info={'description': 'updated_at automatically sets current timestamp when the record is created or updated.'}, comment='update_at for the entry')
    event_id = Column(Integer, ForeignKey("event.event_id"), comment='foreign key for the event')
    event_type_attribute_id = Column(Integer, ForeignKey("event_type_attribute.event_type_attribute_id"), comment='foreign key for the event_type_attribute')
    value = Column(String, comment='value for the event_attribute')

class EventObjectRelationship(Base):
    """
    Represents a relationship between an event and an object.

    Attributes:
        event_object_relationship_id (Integer): The primary key.
        created_at (TIMESTAMP): Timestamp when the record is created, defaults to the current timestamp.
        updated_at (TIMESTAMP): Timestamp when the record is last updated, defaults to the current timestamp.
        event_id (Integer): Foreign key to the Event.
        object_id (String): Foreign key to the Object.
        qualifier_id (Integer): Foreign key to the Qualifier.
        object (relationship): Relationship to the Object entity.
        qualifier (relationship): Relationship to the Qualifier entity.
    """
    __tablename__ = "event_object_relationship"
    __table_args__ = {'comment': 'This table holds event_object_relationships for the OCEL2.0 schema.'}
    event_object_relationship_id = Column(Integer, primary_key=True, comment='primary key for the event_object_relationship')
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), info={'description': 'created_at automatically sets current timestamp when the record is created.'}, comment='created_at for the entry')
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now(), info={'description': 'updated_at automatically sets current timestamp when the record is created or updated.'}, comment='update_at for the entry')
    event_id = Column(Integer, ForeignKey("event.event_id"), comment='foreign key for the event')
    object_id = Column(String, ForeignKey("object.object_id"), comment='foreign key for the object')
    qualifier_id = Column(Integer, ForeignKey("qualifier.qualifier_id"), comment='foreign key for the qualifier')
    object = relationship("Object", foreign_keys=[object_id])
    qualifier = relationship("Qualifier",foreign_keys=[qualifier_id]) 

class ObjectType(Base):
    """
    Represents a type of object.

    Attributes:
        object_type_id (Integer): The primary key.
        created_at (TIMESTAMP): Timestamp when the record is created, defaults to the current timestamp.
        updated_at (TIMESTAMP): Timestamp when the record is last updated, defaults to the current timestamp.
        name (String): The name of the object type.
        attributes (relationship): A relationship to the attributes of the object type.
    """
    __tablename__ = "object_type"
    __table_args__ = {'comment': 'This table holds object_types for the OCEL2.0 schema.'}
    object_type_id = Column(Integer, primary_key=True, comment='primary key for the object_type')
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), info={'description': 'created_at automatically sets current timestamp when the record is created.'}, comment='created_at for the entry')
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now(), info={'description': 'updated_at automatically sets current timestamp when the record is created or updated.'}, comment='update_at for the entry')
    name = Column(String, index=True, comment='name for the object_type')
    attributes = relationship("ObjectTypeAttribute", back_populates="object_type")

class ObjectTypeAttribute(Base):
    """
    Represents attributes of an object type.

    Attributes:
        object_type_attribute_id (Integer): The primary key.
        created_at (TIMESTAMP): Timestamp when the record is created, defaults to the current timestamp.
        updated_at (TIMESTAMP): Timestamp when the record is last updated, defaults to the current timestamp.
        object_type_id (Integer): Foreign key to the ObjectType.
        name (String): The name of the attribute.
        type (String): The data type of the attribute.
        object_type (relationship): Relationship back to the ObjectType.
        object_attributes (relationship): Relationship to ObjectAttribute entities.
    """
    __tablename__ = "object_type_attribute"
    __table_args__ = {'comment': 'This table holds object_type_attributes for the OCEL2.0 schema.'}
    object_type_attribute_id = Column(Integer, primary_key=True, comment='primary key for the object_type_attribute')
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), info={'description': 'created_at automatically sets current timestamp when the record is created.'}, comment='created_at for the entry')
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now(), info={'description': 'updated_at automatically sets current timestamp when the record is created or updated.'}, comment='update_at for the entry')
    object_type_id = Column(Integer, ForeignKey("object_type.object_type_id"), comment='foreign key for the object_type')
    name = Column(String, index=True, comment='name for the object_type_attribute')
    type = Column(String, comment='type for the object_type_attribute')
    object_type = relationship("ObjectType", back_populates="attributes")
    object_attributes = relationship("ObjectAttribute", back_populates="object_type_attribute")

class Object(Base):
    """
    Represents an object.

    Attributes:
        object_id (String): The primary key.
        created_at (TIMESTAMP): Timestamp when the record is created, defaults to the current timestamp.
        updated_at (TIMESTAMP): Timestamp when the record is last updated, defaults to the current timestamp.
        object_type_id (Integer): Foreign key to the ObjectType.
    """
    __tablename__ = "object"
    __table_args__ = {'comment': 'This table holds objects for the OCEL2.0 schema.'}
    object_id = Column(String, primary_key=True, comment='primary key for the object')
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), info={'description': 'created_at automatically sets current timestamp when the record is created.'}, comment='created_at for the entry')
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now(), info={'description': 'updated_at automatically sets current timestamp when the record is created or updated.'}, comment='update_at for the entry')
    object_type_id = Column(Integer, ForeignKey("object_type.object_type_id"), comment='foreign key for the object_type')

class ObjectAttribute(Base):
    """
    Represents attributes of an object.

    Attributes:
        object_attribute_id (Integer): The primary key.
        created_at (TIMESTAMP): Timestamp when the record is created, defaults to the current timestamp.
        updated_at (TIMESTAMP): Timestamp when the record is last updated, defaults to the current timestamp.
        object_id (String): Foreign key to the Object.
        object_type_attribute_id (Integer): Foreign key to the ObjectTypeAttribute.
        value (String): The value of the attribute.
        time (TIMESTAMP): Timestamp when the attribute is applied, defaults to the current function call timestamp.
        object_type_attribute (relationship): Relationship to the ObjectTypeAttribute entity.
    """
    __tablename__ = "object_attribute"
    __table_args__ = {'comment': 'This table holds object_attributes for the OCEL2.0 schema.'}
    object_attribute_id = Column(Integer, primary_key=True, comment='primary key for the object_attribute')
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), info={'description': 'created_at automatically sets current timestamp when the record is created.'}, comment='created_at for the entry')
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now(), info={'description': 'updated_at automatically sets current timestamp when the record is created or updated.'}, comment='update_at for the entry')
    object_id = Column(String, ForeignKey("object.object_id"), comment='foreign key for the object')
    object_type_attribute_id = Column(Integer, ForeignKey("object_type_attribute.object_type_attribute_id"), comment='foreign key for the object_type_attribute')
    value = Column(String, comment='value for the object_attribute')
    time = Column(TIMESTAMP, server_default=func.now(), comment='timestamp for the object_attribute')
    object_type_attribute = relationship("ObjectTypeAttribute", back_populates="object_attributes")

class ObjectRelationship(Base):
    """
    Represents a relationship between two objects, such as a parent-child relationship.

    Attributes:
        object_relationship_id (Integer): Unique identifier, primary key.
        created_at (TIMESTAMP): Timestamp when the relationship was created.
        updated_at (TIMESTAMP): Timestamp when the relationship was last updated.
        object_parent_id (String): Foreign key to the parent Object.
        object_child_id (String): Identifier of the child Object.
        qualifier_id (Integer): Foreign key to the Qualifier indicating the nature of the relationship.
        object_parent (relationship): Relationship back to the parent Object.
        qualifier (relationship): Relationship to the Qualifier.
    """
    __tablename__ = "object_relationship"
    __table_args__ = {'comment': 'This table holds object_relationships for the OCEL2.0 schema.'}
    object_relationship_id = Column(Integer, primary_key=True, comment='primary key for the object_relationship')
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), info={'description': 'created_at automatically sets current timestamp when the record is created.'}, comment='created_at for the entry')
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now(), info={'description': 'updated_at automatically sets current timestamp when the record is created or updated.'}, comment='update_at for the entry')
    object_parent_id = Column(String, ForeignKey("object.object_id", ondelete="SET NULL"), nullable=True, comment='foreign key for the object')
    object_child_id = Column(String, default=None, comment='child_id for the object')
    qualifier_id = Column(Integer, ForeignKey("qualifier.qualifier_id"), comment='foreign key for the qualifier')
    object_parent = relationship("Object", foreign_keys=[object_parent_id], remote_side="Object.object_id")
    qualifier = relationship("Qualifier", foreign_keys=[qualifier_id])

class Qualifier(Base):
    """
    Represents a qualifier that provides context to relationships or attributes, such as "isOwnedBy".

    Attributes:
        qualifier_id (Integer): Unique identifier, primary key.
        created_at (TIMESTAMP): Timestamp when the qualifier was created.
        updated_at (TIMESTAMP): Timestamp when the qualifier was last updated.
        value (String): The textual representation of the qualifier.
    """
    __tablename__ = "qualifier"
    __table_args__ = {'comment': 'This table holds qualifier for the OCEL2.0 schema.'}
    qualifier_id = Column(Integer, primary_key=True, comment='primary key for the qualifier')
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), info={'description': 'created_at automatically sets current timestamp when the record is created.'}, comment='created_at for the entry')
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now(), info={'description': 'updated_at automatically sets current timestamp when the record is created or updated.'}, comment='update_at for the entry')
    value = Column(String, index=True, comment='value for the qualifier')