class Config:
    SECRET_KEY = "foodshare-secret-key"
    JWT_SECRET_KEY = "super-secret-jwt-key"
    JWT_ACCESS_TOKEN_EXPIRES = False
    SQLALCHEMY_DATABASE_URI = "sqlite:///foodshare.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
