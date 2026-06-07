"""
Health check route - GET /api/health
"""

from flask import Blueprint, jsonify
from services.ollama_service import check_ollama_health

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Basic health check. Also pings Ollama to verify it's reachable."""
    ollama_ok = check_ollama_health()
    return jsonify({
        "status": "running",
        "ollama": "connected" if ollama_ok else "unreachable"
    }), 200
