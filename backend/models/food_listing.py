from extensions import db
from datetime import datetime, timezone

class FoodListing(db.Model):
    __tablename__ = "food_listing"

    id = db.Column(db.Integer, primary_key=True)

    food_item_name = db.Column(db.String(150), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    expiry_datetime = db.Column(db.DateTime, nullable=False)

    pickup_address = db.Column(db.Text, nullable=False)
    pickup_instructions = db.Column(db.Text)

    contact_person_name = db.Column(db.String(100), nullable=False)
    contact_person_phone = db.Column(db.String(20), nullable=False)

    status = db.Column(db.String(30), default="Available")

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    provider_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    # ✅ CRITICAL FIX (relationship)
    requests = db.relationship(
        "DonationRequest",
        backref="listing",
        lazy=True,
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<FoodListing {self.food_item_name} ({self.status})>"
