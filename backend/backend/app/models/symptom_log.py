from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class SymptomLog(Base):
    __tablename__ = "symptom_logs"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    logged_at  = Column(DateTime, default=datetime.utcnow)

    # Cycle info
    cycle_day  = Column(Integer, nullable=False)

    # Hormones (optional — for clinical/advanced users)
    estrogen_e2_pg_ml    = Column(Float, nullable=True)
    progesterone_ng_ml   = Column(Float, nullable=True)
    lh_miu_ml            = Column(Float, nullable=True)
    fsh_miu_ml           = Column(Float, nullable=True)
    testosterone_ng_dl   = Column(Float, nullable=True)
    prolactin_ng_ml      = Column(Float, nullable=True)

    # Physical measurements
    bbt_celsius          = Column(Float, nullable=True)
    cervical_mucus_score = Column(Integer, nullable=True)  # 1-5
    cervical_mucus_label = Column(String, nullable=True)   # Dry/Sticky/Creamy/Watery/EggWhite

    # Symptoms (0-10 scale)
    cramping_0_10          = Column(Integer, nullable=True)
    breast_tenderness_0_10 = Column(Integer, nullable=True)
    mood_score_1_10        = Column(Integer, nullable=True)
    energy_level_1_10      = Column(Integer, nullable=True)
    libido_1_10            = Column(Integer, nullable=True)

    # Prediction results (stored after ML inference)
    predicted_phase      = Column(String, nullable=True)
    phase_confidence     = Column(String, nullable=True)  # JSON string
    is_fertile_window    = Column(String, nullable=True)  # "true"/"false"
    fertility_score      = Column(Float, nullable=True)
    is_anomaly           = Column(String, nullable=True)  # "true"/"false"

    # Relationship
    user = relationship("User", back_populates="logs")
