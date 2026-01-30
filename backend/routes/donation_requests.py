from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.donation_request import DonationRequest
from models.food_listing import FoodListing
from routes.food_listings import update_expired_listings
from models.user import User
from extensions import db
from datetime import datetime, timezone


@jwt_required()
def get_provider_requests(provider_id):
    requests = db.session.query(DonationRequest, FoodListing, User).join(
        FoodListing, DonationRequest.listing_id == FoodListing.id
    ).join(
        User, DonationRequest.receiver_id == User.id
    ).filter(
        FoodListing.provider_id == provider_id,
        DonationRequest.status == "Pending"
    ).order_by(DonationRequest.created_at.desc()).all()

    result = []

    for req, listing, receiver in requests:
        result.append({
            "request_id": req.id,
            "status": req.status,
            "created_at": req.created_at.isoformat(),
            "listing": {
                "id": listing.id,
                "food_item_name": listing.food_item_name,
                "quantity": listing.quantity,
                "pickup_address": listing.pickup_address,
                "status": listing.status
            },
            "receiver": {
                "id": receiver.id,
                "name": receiver.name,
                "email": receiver.email,
            }
        })

    return jsonify(result), 200



@jwt_required()
def create_donation_request():
    try:
       
        user_id = int(get_jwt_identity())
        role = get_jwt().get("role")


        if role != "receiver":
            return jsonify({"error": "Only receivers can request food"}), 403

        data = request.get_json()
        print("🔥 DATA:", data)

        listing_id = data.get("listing_id")

        if not listing_id:
            return jsonify({"error": "Listing ID is required"}), 400

        listing = FoodListing.query.get(listing_id)

        if not listing:
            return jsonify({"error": "Food listing not found"}), 404

        if listing.status != "Available":
            return jsonify({"error": "Food is not available"}), 400
        
        update_expired_listings()

        # Check if already requested
        existing_request = DonationRequest.query.filter_by(
            listing_id=listing_id,
            receiver_id=user_id
        ).first()

        if existing_request:
            return jsonify({"error": "You already requested this food"}), 400

        new_request = DonationRequest(
            listing_id=listing_id,
            receiver_id=user_id,
            status="Pending"
        )

        db.session.add(new_request)
        db.session.commit()

        return jsonify({"message": "Food request sent successfully"}), 201

    except Exception as e:
        print("🔥 ERROR in create_donation_request:", e)
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500



@jwt_required()
def update_donation_request():
    data = request.get_json()

    request_id = data.get("request_id")
    action = data.get("action")

    if not request_id or action not in ["accept", "reject"]:
        return jsonify({"error": "Invalid request"}), 400

    donation_request = DonationRequest.query.get(request_id)

    if not donation_request:
        return jsonify({"error": "Request not found"}), 404

    if donation_request.status != "Pending":
        return jsonify({"error": "Request already processed"}), 400

    food_listing = FoodListing.query.get(donation_request.listing_id)

    if action == "accept":
        donation_request.status = "Accepted"
        food_listing.status = "Donated"

        other_requests = DonationRequest.query.filter(
            DonationRequest.listing_id == food_listing.id,
            DonationRequest.id != donation_request.id
        ).all()

        for req in other_requests:
            req.status = "Rejected"

    else:
        donation_request.status = "Rejected"

        pending_requests = DonationRequest.query.filter(
            DonationRequest.listing_id == food_listing.id,
            DonationRequest.status == "Pending"
        ).count()

        if pending_requests == 0:
            food_listing.status = "Available"

    db.session.commit()

    return jsonify({"message": f"Request {action}ed successfully"}), 200


@jwt_required()
def get_receiver_requests():
    receiver_id = get_jwt_identity()
    role = get_jwt()["role"]

    if role != "receiver":
        return jsonify({"error": "Only receivers can view requests"}), 403

    requests = db.session.query(DonationRequest, FoodListing).join(
        FoodListing, DonationRequest.listing_id == FoodListing.id
    ).filter(
        DonationRequest.receiver_id == receiver_id
    ).order_by(DonationRequest.created_at.desc()).all()

    result = []

    for req, listing in requests:
        result.append({
            "request_id": req.id,
            "status": req.status,
            "created_at": req.created_at.isoformat(),
            "listing": {
                "id": listing.id,
                "food_item_name": listing.food_item_name,
                "quantity": listing.quantity,
                "pickup_address": listing.pickup_address,
                "status": listing.status
            }
        })

    return jsonify(result), 200


