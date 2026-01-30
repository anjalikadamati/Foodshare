from extensions import db
from datetime import datetime, timezone

class DonationRequest(db.Model):
    __tablename__ = "donation_request"

    id = db.Column(db.Integer, primary_key=True)

    listing_id = db.Column(db.Integer, db.ForeignKey("food_listing.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    status = db.Column(db.String(30), default="Pending")  # Pending / Accepted / Rejected

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self):
        return f"<DonationRequest {self.id} - {self.status}>"
