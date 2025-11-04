from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str
    app_version: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    mongo_uri: str
    mongo_db_name: str
    allowed_origins: str
    gemini_api_key: str
    gemini_model: str

    class Config:
        env_file = ".env"
        extra = "allow" 

settings = Settings()
