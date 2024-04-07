from fastapi import APIRouter
import logging
from ..utils import logger

# Set up basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("health_check_logger")

health_router = APIRouter(prefix="/api")

@health_router.get("/health", tags=["Technical"])
async def health_check():
    """
    Health Check endpoint to ensure the service is running.
    Returns a JSON response indicating the service is healthy.
    """
    try:        
        # Log that the health check was successful
        logger.info("Health check successful.")
        return {"status": "ok"}
    except Exception as e:
        # Log any errors that occur during the health check
        logger.error(f"Health check failed: {e}")
        return {"status": "error"}