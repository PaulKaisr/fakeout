"""
Local testing script for the describe-and-generate Lambda function
"""

import json
from datetime import datetime
from dotenv import load_dotenv
from main import handler


def test_describe_only():
    """Test DESCRIBE mode - only analyze images and add descriptions"""
    load_dotenv()

    event = {
        "bucketName": "fakeout-videos-dev",
        "datePrefix": datetime.utcnow().strftime("%Y-%m-%d"),
        "mode": "DESCRIBE",
        "n": 2,  # Process only first 2 images for testing
    }

    print("=== Testing DESCRIBE Mode ===")
    print(f"Event: {json.dumps(event, indent=2)}\n")

    result = handler(event, None)

    print("\n=== Result ===")
    print(f"Status Code: {result['statusCode']}")
    print(f"Body:")
    print(json.dumps(json.loads(result["body"]), indent=2))


def test_generate_only():
    """Test GENERATE mode - only generate images using existing descriptions"""
    load_dotenv()

    event = {
        "bucketName": "fakeout-videos-dev",
        "datePrefix": datetime.utcnow().strftime("%Y-%m-%d"),
        "mode": "GENERATE",
        "n": 1,  # Process only 1 image for testing
    }

    print("=== Testing GENERATE Mode ===")
    print(f"Event: {json.dumps(event, indent=2)}\n")

    result = handler(event, None)

    print("\n=== Result ===")
    print(f"Status Code: {result['statusCode']}")
    print(f"Body:")
    print(json.dumps(json.loads(result["body"]), indent=2))


def test_describe_and_generate():
    """Test DESCRIBE_AND_GENERATE mode - do both operations"""
    load_dotenv()

    event = {
        "bucketName": "fakeout-videos-dev",
        "datePrefix": datetime.utcnow().strftime("%Y-%m-%d"),
        "mode": "DESCRIBE_AND_GENERATE",
        "n": 1,  # Process only 1 image for testing (can be expensive!)
    }

    print("=== Testing DESCRIBE_AND_GENERATE Mode ===")
    print(f"Event: {json.dumps(event, indent=2)}\n")

    result = handler(event, None)

    print("\n=== Result ===")
    print(f"Status Code: {result['statusCode']}")
    print(f"Body:")
    print(json.dumps(json.loads(result["body"]), indent=2))


def test_all_images():
    """Test with all images (no limit)"""
    load_dotenv()

    event = {
        "bucketName": "fakeout-videos-dev",
        "datePrefix": datetime.utcnow().strftime("%Y-%m-%d"),
        "mode": "DESCRIBE",
        # No 'n' parameter - processes all images
    }

    print("=== Testing with All Images ===")
    print(f"Event: {json.dumps(event, indent=2)}\n")

    result = handler(event, None)

    print("\n=== Result ===")
    print(f"Status Code: {result['statusCode']}")
    print(f"Body:")
    print(json.dumps(json.loads(result["body"]), indent=2))


if __name__ == "__main__":
    import sys

    # You can run specific tests by passing the test name as argument
    # e.g., python test_local.py describe
    # or just run the default test

    if len(sys.argv) > 1:
        test_name = sys.argv[1].lower()

        if test_name == "describe":
            test_describe_only()
        elif test_name == "generate":
            test_generate_only()
        elif test_name == "both" or test_name == "all":
            test_describe_and_generate()
        elif test_name == "full":
            test_all_images()
        else:
            print(f"Unknown test: {test_name}")
            print("Available tests: describe, generate, both, full")
    else:
        # Default: run DESCRIBE mode with limited images
        print("Running default test (DESCRIBE mode, 2 images)")
        print("Use 'python test_local.py <test_name>' to run specific tests")
        print("Available: describe, generate, both, full\n")
        test_describe_only()
