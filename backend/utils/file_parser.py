"""
File text extraction utilities.
Supports TXT, PDF, and DOCX formats.
"""

import io


def extract_text_from_file(file_obj, ext: str) -> str:
    """
    Extract plain text from an uploaded file object.

    Args:
        file_obj: Werkzeug FileStorage object
        ext: lowercase file extension without dot (e.g. 'pdf')

    Returns:
        Extracted text as a string

    Raises:
        ValueError: for unsupported types or empty content
        Exception: for parsing failures
    """
    if ext == "txt":
        return _extract_txt(file_obj)
    elif ext == "pdf":
        return _extract_pdf(file_obj)
    elif ext == "docx":
        return _extract_docx(file_obj)
    else:
        raise ValueError(f"Unsupported extension: {ext}")


def _extract_txt(file_obj) -> str:
    raw = file_obj.read()
    # Try UTF-8 first, fall back to latin-1
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        text = raw.decode("latin-1", errors="replace")

    text = text.strip()
    if not text:
        raise ValueError("The TXT file appears to be empty.")
    return text


def _extract_pdf(file_obj) -> str:
    try:
        import pdfplumber
    except ImportError:
        raise RuntimeError(
            "pdfplumber is not installed. Run: pip install pdfplumber"
        )

    raw_bytes = file_obj.read()
    pages_text = []

    try:
        with pdfplumber.open(io.BytesIO(raw_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    pages_text.append(page_text.strip())
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {e}")

    full_text = "\n\n".join(pages_text).strip()
    if not full_text:
        raise ValueError(
            "No extractable text found in the PDF. "
            "It may be a scanned image — OCR is not supported."
        )
    return full_text


def _extract_docx(file_obj) -> str:
    try:
        from docx import Document
    except ImportError:
        raise RuntimeError(
            "python-docx is not installed. Run: pip install python-docx"
        )

    raw_bytes = file_obj.read()

    try:
        doc = Document(io.BytesIO(raw_bytes))
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX: {e}")

    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    full_text = "\n\n".join(paragraphs).strip()

    if not full_text:
        raise ValueError("No readable text found in the DOCX file.")
    return full_text
