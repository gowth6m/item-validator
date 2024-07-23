from fastapi import FastAPI
from mangum import Mangum

# --------------------------------------------------------

app = FastAPI()
lambda_handler = Mangum(app)

@app.get("/")
async def handler_one():
    return {"message": "Hello World"}


@app.get("/test/{tester_id}")
async def handler_two(tester_id: int):
    return {"message": f"Hello tester {tester_id}"}

# --------------------------------------------------------

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
