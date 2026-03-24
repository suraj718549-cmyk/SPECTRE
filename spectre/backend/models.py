from sqlalchemy import Column, Integer, String, Boolean, Text
from database import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String, primary_key=True, index=True)
    target = Column(String, index=True)
    status = Column(String, default="pending")
    results = Column(Text, nullable=True)
