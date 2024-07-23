FROM public.ecr.aws/lambda/python:3.9

# Copy function code
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install dependencies
RUN pip install -r requirements.txt

# Copy all files in src
COPY src/* ${LAMBDA_TASK_ROOT}

# Set the CMD to handler
CMD [ "main.lambda_handler" ]
