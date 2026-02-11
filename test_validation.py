from fastapi import HTTPException
import sys
import os

# Mock the dependencies
class MockHTTPException(Exception):
    def __init__(self, status_code, detail):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)

# Add backend directory to path
sys.path.insert(0, os.path.abspath('backend'))

from routes.submissions import SubmissionRequest

def test_validation():
    print("Testing SubmissionRequest validation...")
    
    # Valid request
    valid_req = SubmissionRequest(name="Suyog", prompt="This is a very creative and long prompt about a prompt battle.")
    try:
        valid_req.validate_content()
        print("✓ Valid request passed")
    except Exception as e:
        print(f"✗ Valid request failed: {e}")

    # Short name
    short_name_req = SubmissionRequest(name="S", prompt="This is a very creative and long prompt about a prompt battle.")
    try:
        short_name_req.validate_content()
        print("✗ Short name test failed (should have raised exception)")
    except HTTPException as e:
        print(f"✓ Short name caught: {e.detail}")

    # Short prompt
    short_prompt_req = SubmissionRequest(name="Suyog", prompt="Short")
    try:
        short_prompt_req.validate_content()
        print("✗ Short prompt test failed (should have raised exception)")
    except HTTPException as e:
        print(f"✓ Short prompt caught: {e.detail}")

    # Whitespace only
    whitespace_req = SubmissionRequest(name="   ", prompt="            ")
    try:
        whitespace_req.validate_content()
        print("✗ Whitespace test failed (should have raised exception)")
    except HTTPException as e:
        print(f"✓ Whitespace caught: {e.detail}")

if __name__ == "__main__":
    test_validation()
