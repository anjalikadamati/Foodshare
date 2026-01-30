from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt

from models.user import User
from extensions import db

def register_user():
    data = request.get_json()

    # 1️⃣ Read data from request
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    # 2️⃣ Basic validation
    if not all([name, email, password, role]):
        return jsonify({"error": "All fields are required"}), 400

    if role not in ["provider", "receiver"]:
        return jsonify({"error": "Invalid role"}), 400

    # 3️⃣ Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    # 4️⃣ Create user
    user = User(
        name=name,
        email=email,
        role=role,
        organization_name=data.get("organization_name"),
        address=data.get("address"),
        contact_number=data.get("contact_number")
    )

    user.set_password(password)

    # 5️⃣ Save to DB
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

def login_user():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    # 1️⃣ Validation
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    # 2️⃣ Find user
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    # 3️⃣ Check password
    if not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(
    identity=str(user.id),        # ✅ subject MUST be string
    additional_claims={
        "role": user.role         # ✅ role stored separately
    }
)

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200


@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()      # comes from access_token identity
    claims = get_jwt()                # contains role

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": claims.get("role")
    }), 200
