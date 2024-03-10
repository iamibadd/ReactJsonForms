import os
import json
from typing import List
from fastapi import HTTPException, Query
from starlette import status
from pydantic import BaseModel

class CSV(BaseModel):
    objects: List[str]
    activity: str
    timestamp: str
    id: str
    separator: str

    class Config:
        schema_extra = {
            "example": {
                "objects": [
                    "PURCHORD",
                    "PURCHREQ"
                ],
                "activity": "ocel:activity",
                "timestamp": "ocel:timestamp",
                "id": "ocel:id",
                "separator": ","
            }
        }


def ocel_filename_from_query(ocel: str = Query(example="uploaded/p2p-normal.jsonocel")):
    return secure_ocel_filename(ocel)


def secure_ocel_filename(file: str) -> str:
    """
    Create real path for ocel file name.
    :param file: Ocel file name
    :return: Real internal path to ocel
    """
    # SECURITY: Prevent path traversal trickery.
    
    file = os.path.normpath(file)
    abs_file = os.path.abspath(os.path.join("data", file))
    if abs_file[-len(file):] != file:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="The file must not contain any path traversals.")
    if not os.path.isfile(abs_file):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="The specified file does not exist.")
    print(os.path.join("data", file))
    return os.path.join("data", file)
