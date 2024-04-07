from fastapi import APIRouter,Depends,status,HTTPException
import database
from sqlalchemy.orm import Session
from app.models.models import ObjectType,ObjectTypeAttribute,EventAttribute,Qualifier,EventType,EventTypeAttribute,Object,ObjectAttribute,ObjectRelationship,Event,EventObjectRelationship
from app.schemas.schemas import EventTypeModel,AttributeModel,EventModel,ObjectModel,ObjectTypeModel
from datetime import datetime
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/api")

get_db = database.get_db

@router.post("/items/create", status_code=status.HTTP_201_CREATED, tags=["Add items"])
async def create_data(data: dict, db: Session = Depends(get_db)):
    try:
        if not isinstance(data, dict):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON format")
        else:
            object_types = data.get("objectTypes", [])
            for object_type_data in object_types:
                object_type_model = ObjectTypeModel(**object_type_data)
                object_type = ObjectType(name=object_type_model.name)
                db.add(object_type)
                db.commit()

                for attribute_data in object_type_data.get("attributes", []):
                    attribute_model = AttributeModel(**attribute_data)
                    attribute = ObjectTypeAttribute(object_type=object_type, name=attribute_model.name, type=attribute_model.type)
                    db.add(attribute)
                    db.commit()

            event_types = data.get("eventTypes", [])
            for event_type_data in event_types:
                event_type_model = EventTypeModel(**event_type_data)
                event_type = EventType(name=event_type_model.name)
                db.add(event_type)
                db.commit()

                for attribute_data in event_type_data.get("attributes", []):
                    attribute_model = AttributeModel(**attribute_data)
                    attribute = EventTypeAttribute(event_type_id=event_type.event_type_id, name=attribute_model.name, type=attribute_model.type)
                    db.add(attribute)
                    db.commit()
            
            objects = data.get("objects", [])
            for object_data in objects:
                object_model = ObjectModel(**object_data)

                object_type_name = object_model.type
                object_type = db.query(ObjectType).filter(ObjectType.name == object_type_name).first()

                if not object_type:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid object type: {object_type_name}")

                obj = Object(object_id=object_model.id, object_type_id=object_type.object_type_id)
                db.add(obj)
                db.commit()

                for attribute_data in object_data.get("attributes", []):

                    object_type_attribute_id = db.query(ObjectTypeAttribute.object_type_attribute_id).filter(ObjectTypeAttribute.name == attribute_data.get("name")).first()
                    
                    if object_type_attribute_id is None:
                       object_type_attribute_id = None
                    else:
                        object_type_attribute_id = object_type_attribute_id[0]
                    
                    attribute = ObjectAttribute(object_id=obj.object_id,  object_type_attribute_id=object_type_attribute_id,value=attribute_data.get("value"),time=attribute_data.get("time"))
                    db.add(attribute)
                    db.commit()
                
                for relationship_data in object_data.get("relationships", []):
                                    
                    qualifier_value = relationship_data.get("qualifier")
                    existing_qualifier = db.query(Qualifier).filter(Qualifier.value == qualifier_value).first()
                    if existing_qualifier:
                        #print(f"Qualifier obj with value '{qualifier_value}' already exists with ID {existing_qualifier.qualifier_id}")
                        qualifier_id = existing_qualifier.qualifier_id
                    else:
                        qualifier = Qualifier(value=qualifier_value)
                        db.add(qualifier)
                        db.commit()
                        qualifier_id = qualifier.qualifier_id

                    relationship = ObjectRelationship(
                        object_parent_id=object_data.get("id"),
                        object_child_id=relationship_data.get("objectId"),
                        qualifier_id=qualifier_id
                    )
                    db.add(relationship)
                    db.commit()

            events = data.get("events", [])
            for event_data in events:
                event_model = EventModel(**event_data)

                event_type_name = event_model.type
                event_type = db.query(EventType).filter(EventType.name == event_type_name).first()

                if not event_type:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid event type: {event_type_name}")

                timestamp = datetime.fromisoformat(event_model.time)

                event = Event(event_type_id=event_type.event_type_id, time=timestamp)
                db.add(event)
                db.commit()

                for attribute_data in event_data.get("attributes", []):
                    attribute = EventAttribute(event_id=event.event_id, value=attribute_data.get("value"))
                    db.add(attribute)
                    db.commit()
                              
               
                for relationship_data in event_data.get("relationships", []):

                    object_id = relationship_data.get("objectId")
                    object_exists = db.query(Object).filter(Object.object_id == object_id).first()

                    if not object_exists:
                        continue
                 
                    qualifier_values = relationship_data.get("qualifier")
                    existing_qualifiers = db.query(Qualifier).filter(Qualifier.value == qualifier_values).first()
                    if existing_qualifiers:
                        qualifier_ids = existing_qualifiers.qualifier_id
                    else:
                        qualifiers = Qualifier(value=qualifier_values)
                        db.add(qualifiers)
                        db.commit()
                        qualifier_ids = qualifiers.qualifier_id 

                    relationship = EventObjectRelationship(
                        event_id=event.event_id,
                        qualifier_id=qualifier_ids,
                        object_id=object_id
                    )
                    db.add(relationship)
                    db.commit()

    except IntegrityError as integrity_error:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{integrity_error.orig}")
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    return {"message": "Data stored successfully"}
