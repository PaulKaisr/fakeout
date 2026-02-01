"""
Test describe-and-generate with Supabase storage (Reddit version)
"""

from dotenv import load_dotenv
from main import handler

load_dotenv()


def test_supabase():
    print("=== Testing Describe-and-Generate with Supabase Storage ===\n")

    event = {
        "bucketName": "fakeout-reddit",
        "mode": "DESCRIBE_AND_GENERATE",
        "mediaType": "image",
        "provider": "google",
        "storage_provider": "supabase",  # Use Supabase
        "n": 1,  # Process just 1 image
        "backfill": False,  # Don't rebuild manifest, just update
    }

    context = {}

    try:
        result = handler(event, context)
        print("\n✅ Supabase Test Result:")
        print(result)

        print("\n📝 Next: Check Supabase Dashboard")
        print("   Go to Storage → fakeout-reddit")
        print("   Check metadata file should have 'ai_description' field added")
    except Exception as e:
        print("\n❌ Supabase Test Failed:")
        print(e)
        raise


if __name__ == "__main__":
    test_supabase()
