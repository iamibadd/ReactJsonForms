

## Requirements
- docker, docker-compose

## Getting started
  **Note**: *The following automated deployment is currently only available in **Windows** and **Linux**. MacOS users need to follow development setup.*
  
  - `./app.sh --start optional/path/to/event/logs/`: start app in production mode and optionally specify path to a folder containing event logs to mount into the application
  - `./app.sh --start-dev`: start app in development mode
  - `./app.sh --stop`: stop app
  - `./app.sh --remove`: remove created containers, networks, volumes

## Development Setup - Backend

### Requirements
- python >=3.10 (for running native variant)
- docker, docker-compose (for running docker variant)

### 0. Installing dependencies (if at least one component of the following is run in "native" mode)
- `cd backend/`
- Create a new virtual environment: `python -m venv ./venv`
- Activate said environment
  - Windows: `venv\Scripts\activate.bat` (or `activate.ps1` for powershell)
  - Most Linux shells: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

### 1. Redis (only docker)
- `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build --detach redis`

### 2. Celery
**Note**: *MacOS >M1 users need to follow **Native** as Docker has issues with an issue with Numpy library*
#### Native (this does __not__ work on Windows as Celery doesn't fully support Windows)
- `cd backend/`
- ``PYTHONPATH="src/" celery -A worker.main.app worker --loglevel=INFO``

#### Docker
- `docker-compose build _backend_base && docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build --detach celery`

It is sufficient to restart the docker container when updating celery worker related code on the host machine as the code 
is mounted into the container. There's no need to rebuild the image or recreate the container, 
a simple restart is enough.

### 3. Fastapi
**Note**: *MacOS >M1 users need to follow **Native** as Docker has issues with an issue with Numpy library*
#### Native
- `cd backend/`
- Start the backend server: `PYTHONPATH="src/" DEV=1 uvicorn server.main:app --host 0.0.0.0 --port 8080`
- See backend address in terminal output

#### Docker
`docker-compose build _backend_base && docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build --detach fastapi`

### 4. Testing the backend API
- __Assuming__ step 4 above signaled Uvicorn running at `http://0.0.0.0:8080`: The fastapi openapi can be found at `http://0.0.0.0:8080/docs`

### Backend IDE Alternative
- Install Jetbrains PyCharm
- In PyCharm: `File > Open` and select `backend/` folder, select Python 3.10, let PyCharm automatically install dependencies
- To have a run target for the backend
  - Open the file `pycharm-launcher.py`
  - Click on the green arrow
  - On the upper right open the configuration settings
    - Set the working directory to the `backend/` directory (without `src/` at the end)
    - Add `;DEV=1` to the environment variables
- To have a run target for Celery (this does __not__ work on Windows, as Celery doesn't officially support Windows. See `Celery using Docker` above)
  - On the upper left of the "Run/Debug Configurations" window
    - Click the "+" and select "Python"
    - As the script path, choose `venv/bin/celery`
    - As parameters set `-A worker.main.app worker --loglevel=INFO`
    - Set the working directory to the `backend/` directory
- You might need to tell PyCharm that these projects are part of a larger repository, to do so, go into Settings > Version Control > Directory Mappings

## Development Setup - Frontend

### Requirements
- Nodejs

### 0. Installing dependencies (if at least one component of the following is run in "native" mode)
- `cd frontend/`
- Install dependencies: `npm install`.

### 1. Webserver

#### Native
- `cd frontend/`
- Start the frontend server: `npm run start`

#### Docker
- `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build --detach webserver`

The app runs in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Frontend IDE Alternative
- Install Jetbrains WebStorm
- In WebStorm: `File > Open` and select the frontend folder, let Webstorm automatically install dependencies
- You might need to tell WebStorm that these projects are part of a larger repository, to do so, go into Settings > Version Control > Directory Mappings
