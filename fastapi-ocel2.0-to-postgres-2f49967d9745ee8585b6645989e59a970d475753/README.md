# fastapi-ocel2.0-to-postgres

## Getting Started

Short guide to start the fastAPI including the dependent Postgres database.

### Start Postgres database

Start the database with the following steps:

1. Create a `.env` file according to the `.env.example` file
2. Start the docker-compose with `docker-compose up -d`
3. Test the connection to the database using any client tool or command line

### Start FastAPI

Start the Fastapi API with the following steps:
 
1. Navigate to the `./app` folder and:

    - Create a `.env` file according to the `.env.example` file
    - Make sure that you are using the set parameters from the Postgres `.env` file 

2. Install dependencies by running `pip install -r requirements.txt` to install Python dependencies listed in the `requirements.txt` file

3. Run the application with `uvicorn main:app --reload`

4. Access the API: Open your web browser or use a tool like postman to make requests to your FastAPI API. By default, FastAPI starts on http://127.0.0.1:8000 which is the root endpoint.

5. Test API In Browser: Open http://127.0.0.1:8000/docs to see the available api endpoints related to the project.

## Utilize Notebooks for testing

Available Notebooks within the folder `/notebooks` can be utiilized to upload sample data to the available fastAPI.