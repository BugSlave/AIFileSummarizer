"""
Summarize route - POST /api/summarize
Accepts either a file upload or raw text JSON body.
"""

from flask import Blueprint, request, jsonify, current_app
from services.ollama_service import generate_summary
from utils.file_parser import extract_text_from_file

summarize_bp = Blueprint("summarize", __name__)

VALID_SUMMARY_TYPES = {"short", "medium", "detailed"}


@summarize_bp.route("/summarize", methods=["POST"])
def summarize():
    """
    Accepts:
      - Multipart form: file + summary_type
      - JSON body: { "text": "...", "summary_type": "short|medium|detailed" }
    """
    summary_type = None
    text = None

    # --- Branch 1: File upload ---
    if request.files.get("file"):
        uploaded_file = request.files["file"]
        summary_type = request.form.get("summary_type", "short").lower().strip()

        filename = uploaded_file.filename or ""
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

        allowed = current_app.config.get("ALLOWED_EXTENSIONS", {"txt", "pdf", "docx"})
        if ext not in allowed:
            return jsonify({
                "success": False,
                "error": f"Unsupported file type '.{ext}'. Allowed: {', '.join(sorted(allowed))}"
            }), 400

        try:
            text = extract_text_from_file(uploaded_file, ext)
        except ValueError as e:
            return jsonify({"success": False, "error": str(e)}), 400
        except Exception as e:
            return jsonify({"success": False, "error": f"File parsing failed: {str(e)}"}), 500

    # --- Branch 2: Raw text JSON ---
    elif request.is_json:
        body = request.get_json(silent=True) or {}
        text = (body.get("text") or "").strip()
        summary_type = (body.get("summary_type") or "short").lower().strip()

        if not text:
            return jsonify({"success": False, "error": "Field 'text' is required and cannot be empty."}), 400

    else:
        return jsonify({
            "success": False,
            "error": "Send either a multipart file upload or a JSON body with a 'text' field."
        }), 400

    # --- Validate summary_type ---
    if summary_type not in VALID_SUMMARY_TYPES:
        return jsonify({
            "success": False,
            "error": f"Invalid summary_type '{summary_type}'. Must be one of: {', '.join(sorted(VALID_SUMMARY_TYPES))}"
        }), 400

    # --- Guard: empty extracted text ---
    if not text or not text.strip():
        return jsonify({"success": False, "error": "No readable text found in the provided content."}), 400

    # --- Generate summary via Ollama ---
    try:
        summary = generate_summary(text, summary_type)
    except ConnectionError as e:
        return jsonify({"success": False, "error": str(e)}), 503
    except Exception as e:
        return jsonify({"success": False, "error": f"Summarization failed: {str(e)}"}), 500

    return jsonify({
        "success": True,
        "summary": summary,
        "summary_type": summary_type,
        "char_count": len(text),
        "word_count": len(text.split())
    })
