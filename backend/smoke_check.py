"""Exercise a deployed Lumin API with an existing test account.

Usage: python smoke_check.py https://api.example.com --email test@example.com
The password is read from LUMIN_SMOKE_PASSWORD or prompted securely.
"""

import argparse
import getpass
import http.cookiejar
import json
import os
import sys
import urllib.error
import urllib.request
import uuid
from pathlib import Path


def run(base_url: str, email: str, password: str, model: str | None, pdf: Path | None):
    base_url = base_url.rstrip("/")
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    token = None

    def request(method: str, path: str, body=None, content_type="application/json"):
        if body is None:
            data = None
        elif content_type == "application/json":
            data = json.dumps(body).encode("utf-8")
        else:
            data = body
        headers = {"Accept": "application/json"}
        if data is not None:
            headers["Content-Type"] = content_type
        if token:
            headers["Authorization"] = f"Bearer {token}"
        req = urllib.request.Request(base_url + path, data=data, headers=headers, method=method)
        try:
            with opener.open(req, timeout=90) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            raise RuntimeError(f"{method} {path}: HTTP {error.code}") from error

    for path in ("/health/live", "/health/ready"):
        assert request("GET", path)["status"] == "ok"
        print(f"PASS {path}")

    token = request("POST", "/api/auth/login", {"email": email, "password": password})["access_token"]
    profile = request("GET", "/api/users/profile")
    assert profile["email"].lower() == email.lower()
    assert isinstance(request("GET", "/api/chat/chat_history"), list)
    assert isinstance(request("GET", "/api/rag/documents")["documents"], list)
    print("PASS login, protected profile, chat history, PDF list")

    if not model and not pdf:
        return

    chat_id = None
    document_id = None
    try:
        if pdf:
            boundary = uuid.uuid4().hex
            payload = (
                f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"smoke.pdf\"\r\n"
                "Content-Type: application/pdf\r\n\r\n"
            ).encode() + pdf.read_bytes() + f"\r\n--{boundary}--\r\n".encode()
            uploaded = request("POST", "/api/rag/upload", payload, f"multipart/form-data; boundary={boundary}")
            if uploaded["status"] == "ok":
                document_id = uploaded["document"]["_id"]
            else:
                raise RuntimeError("Test PDF already exists for this account; use a new test PDF")
            request("POST", "/api/rag/query", {"query": "What does this PDF discuss?", "selected_document_ids": [document_id]})
            print("PASS PDF upload and retrieval")

        if model:
            chat_id = request("POST", "/api/chat/chatbot")["id"]
            result = request("POST", f"/api/chat/save_response/{chat_id}", {
                "message": "Reply with one short greeting.", "tools": [], "model": model,
                "selected_document_ids": [],
            })
            assert result["reply"]
            assert request("GET", f"/api/chat/chat_session/{chat_id}")["messages"]
            print("PASS chat generation and persistence")
    finally:
        cleanup_errors = []
        for path in (
            f"/api/chat/delete_chat/{chat_id}" if chat_id else None,
            f"/api/rag/documents/{document_id}" if document_id else None,
        ):
            if path:
                try:
                    request("DELETE", path)
                except Exception as error:
                    cleanup_errors.append(str(error))
        if cleanup_errors:
            raise RuntimeError("Test data cleanup failed: " + "; ".join(cleanup_errors))
        print("PASS test data cleanup")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("base_url", help="Backend origin, without /api")
    parser.add_argument("--email", required=True, help="Existing test account email")
    parser.add_argument("--chat-model", help="Optionally generate a paid model response")
    parser.add_argument("--pdf", type=Path, help="Optionally upload and query a small text PDF")
    args = parser.parse_args()
    if args.pdf and (not args.pdf.is_file() or args.pdf.suffix.lower() != ".pdf"):
        parser.error("--pdf must point to an existing PDF")
    password = os.getenv("LUMIN_SMOKE_PASSWORD") or getpass.getpass("Test account password: ")
    try:
        run(args.base_url, args.email, password, args.chat_model, args.pdf)
    except (RuntimeError, AssertionError, urllib.error.URLError) as error:
        print(f"FAIL {error}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
