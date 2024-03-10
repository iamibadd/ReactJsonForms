from datetime import datetime
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
    value:  Optional[Union[str, int]] = None

class EventModel(BaseModel):
    id: str
    type: str
    time: str
    attributes: List[EventAttributeModel]
    relationships: List[RelationshipModel]

class ObjectAttributeModel(BaseModel):
    name: str
    value:  Optional[Union[str, int]] = None
    time: str

class ObjectModel(BaseModel):
    id: Union[str, int]
    type: str 
    value: Optional[Union[str, int]] = None
    relationships: List[RelationshipModel]
    attributes: List[ObjectAttributeModel]

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user: Union[dict, None] = None
