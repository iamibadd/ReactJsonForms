from fastapi import APIRouter, Depends, status,HTTPException
from fastapi.responses import JSONResponse
import database
from sqlalchemy.orm import Session
from sqlalchemy import cast, String,text
from models import ObjectType,ObjectTypeAttribute,EventAttribute,Qualifier,EventType,EventTypeAttribute,Object,ObjectAttribute,ObjectRelationship,Event,EventObjectRelationship
from schemas import EventTypeModel,AttributeModel,EventModel, ObjectModel, ObjectTypeModel
from datetime import datetime


router = APIRouter(prefix="/api")


get_db = database.get_db

@router.post("/create_data", status_code=status.HTTP_201_CREATED)
async def create_data(data: dict, db: Session = Depends(get_db)):
    try:
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
                attribute = ObjectAttribute(object_id=obj.object_id, value=attribute_data.get("value"), timestamp=attribute_data.get("time"))
                db.add(attribute)
                db.commit()
           
            for relationship_data in object_data.get("relationships", []):
                object_child_id = relationship_data.get("objectId")

                referenced_object = db.query(Object).filter(Object.object_id == object_child_id).first()
                if not referenced_object:
                    # Warning: Object with ID {object_child_id} not found. Skipping relationship creation.
                    continue

                relationship = ObjectRelationship(
                    object_parent_id=obj.object_id,
                    object_child_id=object_child_id
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

            event = Event(event_type_id=event_type.event_type_id, timestamp=timestamp)
            db.add(event)
            db.commit()


            for attribute_data in event_data.get("attributes", []):
                attribute = EventAttribute(event_id=event.event_id, value=attribute_data.get("value"))
                db.add(attribute)
                db.commit()

         
            for relationship_data in event_data.get("relationships", []):
                relationship = EventObjectRelationship(event_id=event.event_id, object_id=relationship_data.get("objectId"))
                db.add(relationship)
                db.commit()
       

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    return {"message": "Data stored successfully"}