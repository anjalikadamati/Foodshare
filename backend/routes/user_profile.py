from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.user import User
from models.food_listing import FoodListing
from models.donation_request import DonationRequest


@jwt_required()   # ✅ THIS WAS MISSING (MAIN FIX)
def get_profile_stats():
    user_id = get_jwt_identity()   # no need int()
    role = get_jwt().get("role")

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # ✅ PROVIDER
    if role == "provider":
        total = FoodListing.query.filter_by(provider_id=user_id).count()
        donated = FoodListing.query.filter_by(provider_id=user_id, status="Donated").count()
        expired = FoodListing.query.filter_by(provider_id=user_id, status="Expired").count()

        return jsonify({
            "role": role,
            "name": user.name,
            "email": user.email,
            "contact_number": user.contact_number,
            "address": user.address,
            "organization_name": user.organization_name,
            "stats": {
                "total": total,
                "donated": donated,
                "expired": expired
            }
        })

    # ✅ RECEIVER
    total_requests = DonationRequest.query.filter_by(receiver_id=user_id).count()
    accepted = DonationRequest.query.filter_by(receiver_id=user_id, status="Accepted").count()
    rejected = DonationRequest.query.filter_by(receiver_id=user_id, status="Rejected").count()
    pending = DonationRequest.query.filter_by(receiver_id=user_id, status="Pending").count()

    return jsonify({
        "role": role,
        "name": user.name,
        "email": user.email,
        "stats": {
            "total_requests": total_requests,
            "accepted": accepted,
            "rejected": rejected,
            "pending": pending
        }
    })
