"""
Lambda function to analyze images in R2 bucket and add descriptions to metadata
and/or generate new images using DALL-E or Google AI (Gemini/Imagen)
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List, Literal, Optional, Protocol
from clients.r2 import R2Client
from clients.openai_vision import VisionClient
from clients.google_ai import GoogleAIClient


class AIProvider(Protocol):
    """Protocol for AI provider clients"""

    def describe_image(self, image_data: bytes, **kwargs) -> str:
        """Describe an image"""
        ...

    def generate_image(self, prompt: str, **kwargs) -> tuple[str, bytes]:
        """Generate an image from a prompt"""
        ...


def process_images(
    bucket_name: str,
    date_prefix: str,
    mode: Literal["DESCRIBE", "GENERATE", "DESCRIBE_AND_GENERATE"],
    r2_client: R2Client,
    ai_client: AIProvider,
    provider: Literal["openai", "google"],
    n: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """
    Process images based on mode: describe, generate, or both

    Args:
        bucket_name: Name of the R2 bucket
        date_prefix: Date prefix to filter images (YYYY-MM-DD format)
        mode: Operation mode - DESCRIBE, GENERATE, or DESCRIBE_AND_GENERATE
        r2_client: Initialized R2 client
        ai_client: Initialized AI client (OpenAI or Google)
        provider: AI provider to use ("openai" or "google")
        n: Optional limit on number of images to process (processes all if None)

    Returns:
        List of processed image results
    """
    results = []

    # List all metadata files for the given date
    prefix = f"{date_prefix}/pexel_images_raw/"
    print(f"Listing metadata files with prefix: {prefix}")

    objects = r2_client.list_objects(bucket_name, prefix=prefix)
    meta_files = [obj["Key"] for obj in objects if obj["Key"].endswith("_meta.json")]

    # Limit to first n files if specified
    if n is not None and n > 0:
        meta_files = meta_files[:n]
        print(f"Found {len(objects)} metadata files, processing first {len(meta_files)}")
    else:
        print(f"Found {len(meta_files)} metadata files")

    for meta_key in meta_files:
        try:
            # Extract the image number from metadata filename
            # Example: 2025-12-07/pexel_images_raw/001_meta.json -> 001
            image_number = meta_key.split("/")[-1].replace("_meta.json", "")
            image_key = f"{date_prefix}/pexel_images_raw/{image_number}"

            print(f"\n--- Processing image {image_number} ---")
            print(f"Metadata key: {meta_key}")
            print(f"Image key: {image_key}")

            # Get existing metadata
            metadata = r2_client.get_json(bucket_name, meta_key)
            original_image_id = metadata.get("id", image_number)

            # Download the image (needed for both DESCRIBE and GENERATE modes)
            print(f"Downloading image from {image_key}...")
            image_data = r2_client.get_object(bucket_name, image_key)

            result = {
                "image_number": image_number,
                "image_id": original_image_id,
                "status": "success",
                "meta_key": meta_key,
            }

            # DESCRIBE mode: Generate description and update metadata
            if mode in ["DESCRIBE", "DESCRIBE_AND_GENERATE"]:
                # Check if description already exists
                if "ai_description" in metadata and mode == "DESCRIBE":
                    print(f"Skipping description for {image_number} - already exists")
                    results.append({
                        "image_number": image_number,
                        "status": "skipped",
                        "reason": "already_described",
                    })
                    continue

                # Generate description using AI provider
                provider_name = "Google Gemini" if provider == "google" else "OpenAI"
                print(f"Analyzing image with {provider_name} Vision API...")
                description = ai_client.describe_image(image_data)
                print(f"Generated description: {description}")

                # Update metadata with description, timestamp, and provider
                metadata["ai_description"] = description
                metadata["ai_description_timestamp"] = datetime.utcnow().isoformat()
                metadata["ai_description_provider"] = provider

                # Upload updated metadata back to R2
                print(f"Updating metadata at {meta_key}...")
                r2_client.put_json(bucket_name, meta_key, metadata)

                result["description"] = description
                print(f"✓ Description added for {image_number}")

            # GENERATE mode: Generate new images using DALL-E
            if mode in ["GENERATE", "DESCRIBE_AND_GENERATE"]:
                # Get the description to use as prompt
                if mode == "GENERATE":
                    # For GENERATE-only mode, use existing description or alt text
                    prompt = metadata.get("ai_description") or metadata.get("alt", "")
                    if not prompt:
                        raise Exception(f"No description found for {image_number}. Run DESCRIBE mode first.")
                else:
                    # For DESCRIBE_AND_GENERATE, use the newly generated description
                    prompt = description

                generation_model = "Google AI (Imagen/Nano Banana Pro)" if provider == "google" else "DALL-E"
                print(f"Generating new image using {generation_model} with prompt: {prompt[:100]}...")
                revised_prompt, generated_image_data = ai_client.generate_image(prompt)

                # Upload generated image to R2 (matching scraper pattern: date/folder/id)
                folder_name = f"{provider}_generated_images"
                generated_image_key = f"{date_prefix}/{folder_name}/{original_image_id}"
                print(f"Uploading generated image to {generated_image_key}...")
                r2_client.put_object(
                    bucket_name,
                    generated_image_key,
                    generated_image_data,
                    content_type="image/png"
                )

                # Create metadata for generated image
                model_name = "gemini-2.5-flash-image" if provider == "google" else "dall-e-3"
                generated_meta = {
                    "original_image_id": original_image_id,
                    "original_image_key": image_key,
                    "generation_prompt": prompt,
                    "revised_prompt": revised_prompt,
                    "generated_at": datetime.utcnow().isoformat(),
                    "provider": provider,
                    "model": model_name,
                }

                # Upload generated image metadata
                generated_meta_key = f"{date_prefix}/{folder_name}/{original_image_id}_meta.json"
                print(f"Uploading generated image metadata to {generated_meta_key}...")
                r2_client.put_json(bucket_name, generated_meta_key, generated_meta)

                result["generated_image_key"] = generated_image_key
                result["generated_meta_key"] = generated_meta_key
                result["revised_prompt"] = revised_prompt
                print(f"✓ Generated image saved for {image_number}")

            results.append(result)
            print(f"✓ Successfully processed {image_number}")

        except Exception as e:
            error_msg = f"✗ Failed to process {meta_key}: {str(e)}"
            print(error_msg)
            # Fail fast: raise exception to interrupt the entire Lambda execution
            raise Exception(f"Image description failed for {meta_key}: {str(e)}") from e

    return results


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda handler function

    Expected event parameters:
    - bucketName: R2 bucket name (default: fakeout-videos-dev)
    - datePrefix: Date prefix for images (default: today's date in YYYY-MM-DD format)
    - mode: Operation mode (default: DESCRIBE_AND_GENERATE)
      - DESCRIBE: Only add AI descriptions to metadata
      - GENERATE: Only generate new images using existing descriptions
      - DESCRIBE_AND_GENERATE: Do both operations
    - provider: AI provider to use (default: google)
      - "openai": Use OpenAI (GPT-4o-mini for vision, DALL-E 3 for generation)
      - "google": Use Google AI (Gemini for vision, Imagen 3 for generation)
    - n: Optional limit on number of images to process (default: all images)

    Returns:
        Lambda response with processing results
    """
    print("Lambda invoked with event:", json.dumps(event, indent=2))

    try:
        # Get parameters from event
        bucket_name = event.get("bucketName", "fakeout-videos-dev")
        date_prefix = event.get("datePrefix", datetime.utcnow().strftime("%Y-%m-%d"))
        mode = event.get("mode", "DESCRIBE_AND_GENERATE").upper()
        provider = event.get("provider", "google").lower()
        n = event.get("n")

        # Validate mode
        valid_modes = ["DESCRIBE", "GENERATE", "DESCRIBE_AND_GENERATE"]
        if mode not in valid_modes:
            raise ValueError(f"Invalid mode: {mode}. Must be one of {valid_modes}")

        # Validate provider
        valid_providers = ["openai", "google"]
        if provider not in valid_providers:
            raise ValueError(f"Invalid provider: {provider}. Must be one of {valid_providers}")

        print(f"Bucket: {bucket_name}")
        print(f"Date prefix: {date_prefix}")
        print(f"Mode: {mode}")
        print(f"Provider: {provider}")
        if n is not None:
            print(f"Limit: {n} images")

        # Initialize R2 client
        r2_client = R2Client()

        # Initialize AI client based on provider
        if provider == "google":
            ai_client = GoogleAIClient()
        else:  # openai
            ai_client = VisionClient()

        # Process images
        results = process_images(
            bucket_name=bucket_name,
            date_prefix=date_prefix,
            mode=mode,
            r2_client=r2_client,
            ai_client=ai_client,
            provider=provider,
            n=n,
        )

        # Count results by status
        success_count = sum(1 for r in results if r["status"] == "success")
        skipped_count = sum(1 for r in results if r["status"] == "skipped")

        print(f"\n=== Processing Complete ===")
        print(f"Total: {len(results)} images")
        print(f"Success: {success_count}")
        print(f"Skipped: {skipped_count}")

        return {
            "statusCode": 200,
            "body": json.dumps({
                "success": True,
                "message": f"Successfully processed images in {mode} mode using {provider}",
                "data": {
                    "bucket_name": bucket_name,
                    "date_prefix": date_prefix,
                    "mode": mode,
                    "provider": provider,
                    "total": len(results),
                    "success": success_count,
                    "skipped": skipped_count,
                    "results": results,
                },
            }),
        }

    except Exception as e:
        print(f"Error in Lambda handler: {str(e)}")
        import traceback
        traceback.print_exc()

        return {
            "statusCode": 500,
            "body": json.dumps({
                "success": False,
                "message": "Failed to analyze images",
                "error": str(e),
            }),
        }


def main():
    """Local testing function"""
    from dotenv import load_dotenv

    # Load environment variables
    load_dotenv()

    # Test with today's date
    event = {
        "mode": "GENERATE",
        "n": 1
    }

    result = handler(event, None)
    print("\n=== Result ===")
    print(json.dumps(json.loads(result["body"]), indent=2))


if __name__ == "__main__":
    main()
