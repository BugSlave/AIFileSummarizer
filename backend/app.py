"""
AI File Summarizer - Flask Backend
Main application entry point
"""

from flask import Flask
from flask_cors import CORS
from routes.summarize import summarize_bp
from routes.health import health_bp

def create_app():
    app = Flask(__name__)

    # CORS - allow requests from React dev server
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })

    # Configuration
    app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20 MB hard limit
    app.config["ALLOWED_EXTENSIONS"] = {"txt", "pdf", "docx"}

    # Register blueprints
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(summarize_bp, url_prefix="/api")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
