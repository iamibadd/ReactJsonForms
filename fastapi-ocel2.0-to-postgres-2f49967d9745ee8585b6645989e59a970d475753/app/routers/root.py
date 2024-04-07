from fastapi import APIRouter
from fastapi.responses import HTMLResponse

# Router declaration (replace the prefix if needed)
# Metadata for the swagger documentation
router = APIRouter(
    prefix="",
    tags=["Root"]
)

# Include routers
# router to root endpoint
@router.get("/", response_class=HTMLResponse,
            summary="root endpoint")

def read_root():
    """
    - Root path for OCEL2.0 API:   **/**
    - Documents can be found here:    **/docs**
    """
    return """
    <html>
    <h2>FastAPI for OCEL2.0</h2>
    <body>
    Please refer to the documentation for more information at the following link: /docs 
    </body>
    </html>"""