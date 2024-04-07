from typing import Optional, Union
from pydantic import BaseModel
from typing import List

class AttributeModel(BaseModel):
    name: str
    type: str

class EventTypeModel(BaseModel):
    name: str
    attributes: List[AttributeModel]

class ObjectTypeModel(BaseModel):
    name: str
    attributes: List[AttributeModel]

class RelationshipModel(BaseModel):
    objectId: str
    qualifier: str

class EventAttributeModel(BaseModel):
    name: str
    value:  Optional[Union[str, int,float]] = None

class EventModel(BaseModel):
    id: str
    type: str
    time: Optional[str] = None
    attributes: List[EventAttributeModel]
    relationships: List[RelationshipModel]

class ObjectAttributeModel(BaseModel):
    value:  Optional[Union[str, int,float]] = None
    time: Optional[str] = None

class ObjectModel(BaseModel):
    id: Union[str, int]
    type: str 
    value: Optional[Union[str, int,float]] = None
    relationships: List[RelationshipModel]
    attributes: List[ObjectAttributeModel]

class QualifierModel(BaseModel):
    value: str