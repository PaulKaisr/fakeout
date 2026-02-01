"""
Test describe-and-generate with R2 storage (existing behavior)
"""

import os
from dotenv import load_dotenv
from main import handler

load_dotenv()


def test_r2():
    print("=== Testing Describe-and-Generate with R2 Storage ===\n")

    event = {
        "bucketName": "fakeout-videos-dev",
        "mode": "DESCRIBE",  # Just describe, don't generate (faster/cheaper)
        "mediaType": "image",
        "provider": "google",
        "storage_provider": "r2",  # Explicit R2
        "n": 1,  # Process just 1 image
        "backfill": False,  # Don't rebuild manifest, just update
    }

    context = {}

    try:
        result = handler(event, context)
        print("\n✅ R2 Test Result:")
        print(result)
    except Exception as e:
        print("\n❌ R2 Test Failed:")
        print(e)
        raise


if __name__ == "__main__":
    test_r2()
