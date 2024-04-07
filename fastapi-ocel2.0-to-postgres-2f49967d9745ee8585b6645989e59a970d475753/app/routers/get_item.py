from fastapi import APIRouter,Depends,Query,status,HTTPException
from fastapi.responses import Response
import database
from app.models.models import ObjectType,ObjectTypeAttribute,EventType,ObjectAttribute,ObjectRelationship,Event,EventObjectRelationship
from datetime import datetime
import json

router = APIRouter(prefix="/api")

get_db = database.get_db

@router.get("/items/get", status_code=status.HTTP_201_CREATED, tags=["Get items"])
def get_data(
    timestamp_from: datetime = Query(..., alias="TIMESTAMP_FROM"),
    timestamp_to: datetime = Query(..., alias="TIMESTAMP_TO"),
    db=Depends(get_db)
):
    if not timestamp_from and not timestamp_to:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="TIMESTAMP_FROM and TIMESTAMP_TO are required")
   
    object_attributes_query = (
        db.query(ObjectAttribute)
        .filter(ObjectAttribute.time.between(timestamp_from, timestamp_to))
    )

    object_attributes = object_attributes_query.all()

    object_dicts = []

    for attr in object_attributes:
        
        object_relation = db.query(ObjectRelationship).filter(
            ObjectRelationship.object_parent_id == attr.object_id
        ).all()

        relations = []
        for objRel in object_relation:
            relation = {
                "object_relation_Id": objRel.object_relationship_id,
                "objectId": objRel.object_parent_id,
                "objectChildId": objRel.object_child_id,
                "qualifier": str(objRel.qualifier.value),
            }
            relations.append(relation)
        
        object_attributes_name = db.query(ObjectTypeAttribute.name).filter(ObjectTypeAttribute.object_type_attribute_id == attr.object_type_attribute_id).first()
        attribute_name = object_attributes_name[0] if object_attributes_name else None 

        object_type_name = db.query(ObjectType.name).filter(ObjectType.object_type_id == attr.object_type_attribute_id).first()
        type_name = object_type_name[0] if object_type_name else None 

        object_dict = {
            "id": attr.object_id,
            "type": type_name,
            "attributes": [
                {
                    "name":attribute_name,
                    "value": attr.value,
                    "time": attr.time.isoformat(),
                    "create_at":attr.created_at.isoformat(),
                    "update_at":attr.updated_at.isoformat(),
                }
            ],
            "relationships": relations,
            
        }
        object_dicts.append(object_dict)  


    events_query = db.query(Event).filter(Event.time.between(timestamp_from, timestamp_to))
    events = events_query.all()
    event_dicts = []
    for event in events:
        event_relation = db.query(EventObjectRelationship).filter(
            EventObjectRelationship.event_id == event.event_id
        )
        relationships = []
        for rel in event_relation.all():
            relationship = {
                "objectId": rel.object_id,
                "qualifier": str(rel.qualifier.value),
                "create_at":rel.created_at.isoformat(),
                "update_at":rel.updated_at.isoformat(),
            }
            relationships.append(relationship)
        event_type_name = db.query(EventType.name).filter(EventType.event_type_id==event.event_type_id).first()
        type_name = event_type_name[0] if event_type_name else None 
        event_dict = {
            "id": event.event_id,
            "type":type_name,
            "time": event.time.isoformat(),
            "attributes": [],
            "relationships": relationships
        }
        event_dicts.append(event_dict)    
    
    response_content = {
        "eventTypes": [],
        "objectTypes": [],
        "objects":object_dicts,
        "events": event_dicts
    }

    response_json = json.dumps(response_content)

    return Response(content=response_json, media_type="application/json")
