from fastapi import FastAPI, Request
import app.models.models as models
from database import engine
from fastapi.middleware.cors import CORSMiddleware
from app.routers import create_item, get_item, root
from app.routers.health_check import health_router

## Prometheus metrics
from starlette.applications import Starlette
from starlette_prometheus import metrics, PrometheusMiddleware

# Metadata for the swagger documentation for each endpoint
tags_metadata = [
    {
        "name": "Root",
        "description": "Welcome Message"
    },
    {
        "name": "Add items",
        "description": "All endpoints to create database entries based on an OCEL 2.0 JSON"
    },
    {
        "name": "Get items",
        "description": "All endpoints to get database entries in a Format of an OCEL 2.0 JSON"
    },
    {
        "name": "Technical",
        "description": "Technical endpoints for health check and metrics"
    }
]

# Create all database tables defined in SQLAlchemy models, if they don't already exist
models.Base.metadata.create_all(engine)

# API description
title = "API - OCEL2.0"
description = "API for OCEL2.0 data handling"

# FastAPI initialization and metadata for the documentation
app = FastAPI(
    title=title,
    description=description,
    version="0.0.2",
    contact={
        "name": "",
        "email": "contact@example.com"
    },
    license_info={},
    openapi_tags=tags_metadata
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# Root router
app.include_router(root.router)

# add health check for fast api
app.include_router(health_router)
# add prometheus metrics for fast api
app.add_middleware(PrometheusMiddleware) 
app.add_api_route("/api/metrics", metrics, tags=["Technical"])

# Create routers
app.include_router(create_item.router)

# Get routers
app.include_router(get_item.router)