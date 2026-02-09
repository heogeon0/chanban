from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    OPENAI_API_KEY: str
    CHANBAN_API_URL: str = "http://localhost:3001/api"
    CHANBAN_JWT_TOKEN: str


def get_settings() -> Settings:
    """Settings 싱글턴을 반환한다."""
    return Settings()  # type: ignore[call-arg]
