# routes/food_listings.py
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.food_listing import FoodListing
from models.donation_request import DonationRequest
from extensions import db, mail
from datetime import datetime, timezone
from flask_mail import Message
from models.user import User


def _parse_expiry(expiry_str):
    try:
        return datetime.strptime(expiry_str, "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)
    except ValueError:
        return datetime.strptime(expiry_str, "%Y-%m-%dT%H:%M").replace(tzinfo=timezone.utc)

def send_food_notification(listing):
    try:
        receivers = User.query.filter_by(role="receiver").all()

        emails = [user.email for user in receivers]

        if not emails:
            print("⚠️ No receivers found for email notification")
            return

        msg = Message(
            subject="🍱 New Food Available on FoodShare!",
            sender="anjukadamati@gmail.com",
            recipients=emails,
            body=f"""
                New food listing is available!

                🍲 Food: {listing.food_item_name}
                📦 Quantity: {listing.quantity}
                📍 Pickup Address: {listing.pickup_address}

                Login to FoodShare and request food now ❤️
                """
        )

        mail.send(msg)
        print("✅ Email notification sent to receivers")

    except Exception as e:
        print("❌ Email sending failed:", e)



@jwt_required()
def create_food_listing():
    print("🔥 create_food_listing called")
    print("🔥 AUTH HEADER:", request.headers.get("Authorization"))
    identity = get_jwt_identity()
    print("🔥 JWT identity (create):", identity)
    try:
        user_id = int(identity)
    except Exception:
        user_id = identity

    role = get_jwt().get("role")
    print("🔥 JWT role (create):", role)

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data received"}), 400

    if role != "provider":
        return jsonify({"error": "Only food providers can create listings"}), 403

    required_fields = ["food_item_name", "quantity", "expiry_datetime", "pickup_address", "contact_person_name", "contact_person_phone"]
    for field in required_fields:
        if field not in data or data[field] is None or str(data[field]).strip() == "":
            return jsonify({"error": f"Missing required field: {field}"}), 400

    try:
        quantity = int(data["quantity"])
        if quantity <= 0:
            return jsonify({"error": "Quantity must be a positive number"}), 400
    except Exception:
        return jsonify({"error": "Quantity must be a valid number"}), 400

    try:
        expiry_dt = _parse_expiry(data["expiry_datetime"])
    except Exception:
        return jsonify({"error": "Invalid datetime format. Use YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS"}), 400

    now = datetime.now(timezone.utc)
    status = "Available" if expiry_dt > now else "Expired"

    try:
        listing = FoodListing(
            food_item_name=data["food_item_name"],
            quantity=quantity,
            expiry_datetime=expiry_dt,
            pickup_address=data["pickup_address"],
            pickup_instructions=data.get("pickup_instructions"),
            contact_person_name=data["contact_person_name"],
            contact_person_phone=data["contact_person_phone"],
            provider_id=user_id,
            status=status
        )

        db.session.add(listing)
        db.session.commit()

        import threading
        threading.Thread(target=send_food_notification, args=(listing,)).start()


        print(f"🔥 Created listing id={listing.id} provider_id={listing.provider_id} status={listing.status}")

        return jsonify({
            "message": "Food listing created successfully",
            "listing": {
                "id": listing.id,
                "food_item_name": listing.food_item_name,
                "quantity": listing.quantity,
                "expiry_datetime": listing.expiry_datetime.isoformat(),
                "pickup_address": listing.pickup_address,
                "pickup_instructions": listing.pickup_instructions,
                "contact_person_name": listing.contact_person_name,
                "contact_person_phone": listing.contact_person_phone,
                "provider_id": listing.provider_id,
                "status": listing.status,
                "created_at": listing.created_at.isoformat()
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Database error (create): {e}")
        return jsonify({"error": "Failed to create listing due to database error"}), 500


@jwt_required()
def get_available_food_listings():
    update_expired_listings()

    search = request.args.get("search", "")
    sort = request.args.get("sort", "latest")  

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 6))

    query = FoodListing.query.filter(FoodListing.status == "Available")

    if search:
        query = query.filter(FoodListing.food_item_name.ilike(f"%{search}%"))

    if sort == "oldest":
        query = query.order_by(FoodListing.created_at.asc())
    elif sort == "expiry":
        query = query.order_by(FoodListing.expiry_datetime.asc())
    else:
        query = query.order_by(FoodListing.created_at.desc())

    pagination = query.paginate(page=page, per_page=limit, error_out=False)

    listings = pagination.items

    result = []
    for listing in listings:
        result.append({
            "id": listing.id,
            "food_item_name": listing.food_item_name,
            "quantity": listing.quantity,
            "expiry_datetime": listing.expiry_datetime.isoformat(),
            "pickup_address": listing.pickup_address,
            "contact_person_name": listing.contact_person_name,
            "contact_person_phone": listing.contact_person_phone,
            "provider_id": listing.provider_id,
            "status": listing.status
        })

    return jsonify({
        "data": result,
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page
    }), 200


@jwt_required()
def get_my_food_listings():
    update_expired_listings()

    provider_id = int(get_jwt_identity())

    search = request.args.get("search", "")
    status_filter = request.args.get("status", "")   
    sort = request.args.get("sort", "latest")        

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 6))

    query = FoodListing.query.filter_by(provider_id=provider_id)

    if search:
        query = query.filter(FoodListing.food_item_name.ilike(f"%{search}%"))

    if status_filter:
        query = query.filter(FoodListing.status == status_filter)

    if sort == "oldest":
        query = query.order_by(FoodListing.created_at.asc())
    elif sort == "expiry":
        query = query.order_by(FoodListing.expiry_datetime.asc())
    else:  
        query = query.order_by(FoodListing.created_at.desc())

    pagination = query.paginate(page=page, per_page=limit, error_out=False)

    listings = pagination.items

    result = []
    for listing in listings:
        result.append({
            "id": listing.id,
            "food_item_name": listing.food_item_name,
            "quantity": listing.quantity,
            "expiry_datetime": listing.expiry_datetime.isoformat(),
            "pickup_address": listing.pickup_address,
            "contact_person_name": listing.contact_person_name,
            "contact_person_phone": listing.contact_person_phone,
            "created_at": listing.created_at.isoformat(),
            "status": listing.status
        })

    return jsonify({
        "data": result,
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page
    }), 200


@jwt_required()
def delete_food_listing(listing_id):
    provider_id = int(get_jwt_identity())

    listing = FoodListing.query.filter_by(
        id=listing_id,
        provider_id=provider_id
    ).first()

    if not listing:
        return jsonify({"error": "Listing not found"}), 404

    try:
        requests = DonationRequest.query.filter_by(listing_id=listing.id).all()
        for r in requests:
            db.session.delete(r)

        db.session.delete(listing)
        db.session.commit()

        return jsonify({"message": "Food listing deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        print("🔥 DELETE ERROR:", e)
        return jsonify({"error": "Delete failed"}), 500


def update_expired_listings():
    now = datetime.now()   

    listings = FoodListing.query.filter(
        FoodListing.status == "Available"
    ).all()

    updated = False

    for listing in listings:
        if listing.expiry_datetime and listing.expiry_datetime < now:
            listing.status = "Expired"
            updated = True

    if updated:
        db.session.commit()





@jwt_required()
def update_food_listing(listing_id):
    identity = get_jwt_identity()
    try:
        provider_id = int(identity)
    except Exception:
        provider_id = identity

    data = request.get_json()

    listing = FoodListing.query.filter_by(
        id=listing_id,
        provider_id=provider_id
    ).first()

    if not listing:
        return jsonify({"error": "Listing not found or unauthorized"}), 404

    try:
        if "food_item_name" in data:
            listing.food_item_name = data["food_item_name"]

        if "quantity" in data:
            listing.quantity = int(data["quantity"])

        if "expiry_datetime" in data:
            listing.expiry_datetime = _parse_expiry(data["expiry_datetime"])

        if "pickup_address" in data:
            listing.pickup_address = data["pickup_address"]

        if "pickup_instructions" in data:
            listing.pickup_instructions = data["pickup_instructions"]

        if "contact_person_name" in data:
            listing.contact_person_name = data["contact_person_name"]

        if "contact_person_phone" in data:
            listing.contact_person_phone = data["contact_person_phone"]

        now = datetime.now(timezone.utc)
        if listing.expiry_datetime < now and listing.status == "Available":
            listing.status = "Expired"

        db.session.commit()
        return jsonify({"message": "Listing updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        print("Update error:", e)
        return jsonify({"error": "Failed to update listing"}), 500
