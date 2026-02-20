from flask import Flask
from config import Config
from extensions import db,jwt, mail
from flask_cors import CORS
from routes.auth import register_user, login_user
from routes.user_profile import get_profile_stats
from routes.food_listings import create_food_listing, get_available_food_listings, get_my_food_listings, update_food_listing, delete_food_listing
from routes.donation_requests import (
    create_donation_request,
    get_provider_requests,
    update_donation_request, 
    get_receiver_requests
)


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

app.config.from_object(Config)
app.config["JWT_ERROR_MESSAGE_KEY"] = "error"

app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = "anjukadamati@gmail.com"
app.config["MAIL_PASSWORD"] = "dnyc ggss qkbr oulf" 
mail.init_app(app)


db.init_app(app)
jwt.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return "hello food app is tunning"

# ---------- AUTH ----------
@app.route("/auth/register", methods=["POST"])
def register():
    return register_user()

@app.route("/auth/login", methods=["POST"])
def login():
    return login_user()

# ---------- FOOD ----------
@app.route("/food/create", methods=["POST"])
def create_food():
    return create_food_listing()

@app.route("/food/available", methods=["GET"])
def available_food():
    return get_available_food_listings()

@app.route("/food/my-listings",methods=["GET"])
def view_func():
    return get_my_food_listings()

@app.route("/food/delete/<int:listing_id>", methods=["DELETE"])
def delete_listing(listing_id):
    return delete_food_listing(listing_id)

@app.route("/food/update/<int:listing_id>", methods=["PUT"])
def update_listing(listing_id):
    return update_food_listing(listing_id)




# ---------- DONATION ----------
@app.route("/receiver/my-requests", methods=["GET"])
def receiver_requests():
    return get_receiver_requests()

@app.route("/donation/request", methods=["POST"])
def request_food():
    return create_donation_request()

@app.route("/provider/<int:provider_id>/requests", methods=["GET"])
def provider_requests(provider_id):
    return get_provider_requests(provider_id)

@app.route("/donation/request/update", methods=["POST"])
def update_request():
    return update_donation_request()

@app.route("/user/profile-stats", methods=["GET"])
def profile_stats():
    return get_profile_stats()


if __name__ == "__main__":
    app.run(debug=True)
