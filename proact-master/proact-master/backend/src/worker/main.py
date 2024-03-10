import os

from celery import Celery


REDIS_HOST = os.environ.get('PROACT_REDIS_HOST', default='localhost')
REDIS_PORT = os.environ.get('PROACT_REDIS_PORT', default='6379')

app = Celery(
    'proact',
    broker=f"redis://{REDIS_HOST}:{REDIS_PORT}/0",
    backend=f"redis://{REDIS_HOST}:{REDIS_PORT}/0"
)
app.autodiscover_tasks(['worker.tasks.dfm', 'worker.tasks.alignments', 'worker.tasks.performance', 'worker.tasks.monitoring', 'worker.tasks.action', 'worker.tasks.impact'], force=True)
