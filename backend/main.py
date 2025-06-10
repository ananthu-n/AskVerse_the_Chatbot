import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi_jwt_auth import AuthJWT
from fastapi_jwt_auth.exceptions import AuthJWTException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pydantic import BaseSettings
from fastapi.openapi.utils import get_openapi

# Import your routers
from backend.routes import user, chat
from backend import auth

# Import database init
from backend.database import init_db

load_dotenv()

app = FastAPI()

# Initialize DB tables (if not done already)
init_db()

# CORS setup - adjust origins as needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Config
class Settings(BaseSettings):
    authjwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "your_default_secret")

@AuthJWT.load_config
def get_config():
    return Settings()

# JWT Exception handler
@app.exception_handler(AuthJWTException)
async def authjwt_exception_handler(request: Request, exc: AuthJWTException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(user.router, prefix="/user", tags=["user"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])

# Add JWT support to Swagger UI
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Multi-User Chatbot",
        version="1.0.0",
        description="Chatbot powered by FastAPI, JWT, and Groq LLaMA3",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    for path in openapi_schema["paths"].values():
        for method in path.values():
            method.setdefault("security", [{"BearerAuth": []}])

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/")
async def root():
    return {"message": "FastAPI backend is running!"}
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Default to 8000 if PORT is not set
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port , reload=True)
