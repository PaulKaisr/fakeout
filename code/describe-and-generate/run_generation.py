
from main import handler
import json
from dotenv import load_dotenv

def main():
    load_dotenv()
    
    print("--- GENERATING IMAGES FOR 2026-01-06 ---")
    event = {
        "mode": "GENERATE",  # Generate the missing AI images
        "mediaType": "image",
        "datePrefix": "2026-01-06",
        "backfill": False, # Just process this date
        "provider": "google" # Assuming Google provider was used/intended
    }
    
    try:
        result = handler(event, None)
        print(json.dumps(json.loads(result["body"]), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
