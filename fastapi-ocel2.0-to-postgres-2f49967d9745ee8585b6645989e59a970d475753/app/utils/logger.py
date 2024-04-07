import logging


# Configure the logger
logger = logging.getLogger("logger")
logger.setLevel(logging.INFO)  # Adjust the log level as needed

# Create console handler and set level to debug
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)  # Adjust as per your need

# Create formatter
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Add formatter to ch
ch.setFormatter(formatter)

# Add ch to logger
logger.addHandler(ch)