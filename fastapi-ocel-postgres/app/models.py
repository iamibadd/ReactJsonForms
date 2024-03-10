from sqlalchemy import Column, Integer, String, JSON, TIMESTAMP, ForeignKey,func,text
from sqlalchemy.orm import relationship
from database import Base
import uuid


class EventType(Base):
    __tablename__ = "event_type"
    event_type_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    
class EventTypeAttribute(Base):
    __tablename__ = "event_type_attribute"
    event_type_attribute_id = Column(Integer, primary_key=True, index=True)
    event_type_id = Column(Integer, ForeignKey("event_type.event_type_id"))
    name = Column(String, index=True)
    type = Column(String)

class Event(Base):
    __tablename__ = "event"
    event_id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    event_type_id = Column(Integer, ForeignKey("event_type.event_type_id"))
    timestamp = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

class EventAttribute(Base):
    __tablename__ = "event_attribute"
    event_attribute_id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, ForeignKey("event.event_id"))
    event_type_attribute_id = Column(Integer, ForeignKey("event_type_attribute.event_type_attribute_id"))
    value = Column(String)

class EventObjectRelationship(Base):
    __tablename__ = "event_object_relationship"
    event_object_relationship_id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, ForeignKey("event.event_id"))
    object_id = Column(String, ForeignKey("object.object_id"))
    qualifier_id = Column(Integer)

class ObjectType(Base):
    __tablename__ = "object_type"
    object_type_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    attributes = relationship("ObjectTypeAttribute", back_populates="object_type")

class ObjectTypeAttribute(Base):
    __tablename__ = "object_type_attribute"
    object_type_attribute_id = Column(Integer, primary_key=True, index=True)
    object_type_id = Column(Integer, ForeignKey("object_type.object_type_id"))
    name = Column(String, index=True)
    type = Column(String)

    object_type = relationship("ObjectType", back_populates="attributes")

class Object(Base):
    __tablename__ = "object"
    object_id = Column(String, primary_key=True, index=True)
    object_type_id = Column(Integer, ForeignKey("object_type.object_type_id"))

class ObjectAttribute(Base):
    __tablename__ = "object_attribute"
    object_attribute_id = Column(Integer, primary_key=True, index=True)
    object_id = Column(String, ForeignKey("object.object_id"))
    object_type_attribute_id = Column(Integer, ForeignKey("object_type_attribute.object_type_attribute_id"))
    value = Column(String)
    timestamp = Column(TIMESTAMP, server_default=func.now())

class ObjectRelationship(Base):
    __tablename__ = "object_relationship"
    object_relationship_id = Column(Integer, primary_key=True, index=True)
    object_parent_id = Column(String, ForeignKey("object.object_id"))
    object_child_id = Column(String, ForeignKey("object.object_id"))
    qualifier_id = Column(Integer)

class Qualifier(Base):
    __tablename__ = "qualifier"
    qualifier_id = Column(Integer, primary_key=True, index=True)
    value = Column(JSON)