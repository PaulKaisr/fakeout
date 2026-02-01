"""
Lambda function to analyze images in R2 bucket and add descriptions to metadata
and/or generate new images using DALL-E or Google AI (Gemini/Imagen)
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List, Literal, Optional, Protocol
from clients.storage_factory import create_storage_client, StorageClient
from clients.openai_vision import VisionClient
from clients.google_ai import GoogleAIClient
import subprocess
import tempfile
import imageio_ffmpeg


MANIFEST_KEY_IMAGES = "games_manifest_images.json"
MANIFEST_KEY_VIDEOS = "games_manifest_videos.json"


def get_manifest_key(media_type: Literal["image", "video"]) -> str:
    """Get the manifest key for the given media type."""
    return MANIFEST_KEY_VIDEOS if media_type == "video" else MANIFEST_KEY_IMAGES


def backfill_manifest(
    bucket_name: str,
    storage_client: StorageClient,
    media_type: Literal["image", "video"] = "image",
) -> List[str]:
    """
    Backfill manifest file by listing all date folders in the bucket.
    Only includes dates that have content for the specified media type.
    Extracts search_prompt from the first item's metadata if available.
    """
    manifest_key = get_manifest_key(media_type)
    subfolder = "pexel_videos_raw" if media_type == "video" else "pexel_images_raw"
    print(f"Starting manifest backfill for {media_type}s...")

    # List top-level folders
    response = storage_client.list_objects(bucket_name, delimiter="/", max_keys=1000)
    common_prefixes = response.get("CommonPrefixes", [])

    dates = []
    prompts = {}

    for prefix_obj in common_prefixes:
        # Prefix is like "2025-12-25/"
        folder_name = prefix_obj.get("Prefix", "").strip("/")

        # Simple validation: checks if it looks like a date YYYY-MM-DD
        try:
            datetime.strptime(folder_name, "%Y-%m-%d")
        except ValueError:
            continue

        # Check if this date folder has content for the specified media type
        check_prefix = f"{folder_name}/{subfolder}/"
        check_response = storage_client.list_objects(bucket_name, prefix=check_prefix, max_keys=1)
        
        contents = check_response.get("Contents")
        if contents:
            dates.append(folder_name)
            
            # Try to read the first metadata file to get the search prompt
            # We assume the first file is 001_meta.json, but let's just look for any *_meta.json if possible given max_keys=1 might not return it.
            # Actually, let's list specifically for the first meta file.
            meta_key_predict = f"{folder_name}/{subfolder}/001_meta.json"
            try:
                metadata = storage_client.get_json(bucket_name, meta_key_predict)
                if metadata and "search_prompt" in metadata:
                    prompts[folder_name] = metadata["search_prompt"]
            except Exception:
                # If 001_meta.json doesn't exist or fails, we skip existing the prompt
                pass

    # Sort descending (newest first)
    dates.sort(reverse=True)

    manifest = {
        "dates": dates,
        "prompts": prompts,
        "updated_at": datetime.utcnow().isoformat()
    }
    storage_client.put_json(bucket_name, manifest_key, manifest, cache_control="max-age=0, no-cache")
    print(f"Manifest {manifest_key} updated with {len(dates)} dates: {dates}")
    print(f"Prompts found: {prompts}")
    return dates


def update_manifest(
    bucket_name: str,
    date_prefix: str,
    storage_client: StorageClient,
    media_type: Literal["image", "video"] = "image",
):
    """
    Update manifest with a new date.
    """
    manifest_key = get_manifest_key(media_type)
    subfolder = "pexel_videos_raw" if media_type == "video" else "pexel_images_raw"
    try:
        manifest = storage_client.get_json(bucket_name, manifest_key)
        dates = manifest.get("dates", [])
        prompts = manifest.get("prompts", {})
    except Exception:
        print(f"Manifest {manifest_key} not found, starting fresh.")
        dates = []
        prompts = {}

    if date_prefix not in dates:
        dates.append(date_prefix)
        dates.sort(reverse=True)
        
        # Try to get prompt for the new date
        meta_key_predict = f"{date_prefix}/{subfolder}/001_meta.json"
        try:
            metadata = storage_client.get_json(bucket_name, meta_key_predict)
            if metadata and "search_prompt" in metadata:
                prompts[date_prefix] = metadata["search_prompt"]
        except Exception:
            pass

        manifest = {
            "dates": dates,
            "prompts": prompts,
            "updated_at": datetime.utcnow().isoformat()
        }
        storage_client.put_json(bucket_name, manifest_key, manifest, cache_control="max-age=0, no-cache")
        print(f"Added {date_prefix} to manifest {manifest_key}. Prompt: {prompts.get(date_prefix)}")
    else:
        print(f"Date {date_prefix} already in manifest {manifest_key}.")


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
    storage_client: StorageClient,
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
        storage_client: Initialized R2 client
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

    response = storage_client.list_objects(bucket_name, prefix=prefix)
    objects = response.get("Contents", [])
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
            metadata = storage_client.get_json(bucket_name, meta_key)
            original_image_id = metadata.get("id", image_number)

            # Download the image (needed for both DESCRIBE and GENERATE modes)
            print(f"Downloading image from {image_key}...")
            image_data = storage_client.get_object(bucket_name, image_key)

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
                storage_client.put_json(bucket_name, meta_key, metadata)

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
                storage_client.put_object(
                    bucket_name,
                    generated_image_key,
                    generated_image_data,
                    content_type="image/png",
                    cache_control="public, max-age=31536000, immutable",  # 1 year cache for static images
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
                storage_client.put_json(bucket_name, generated_meta_key, generated_meta, cache_control="max-age=0, no-cache")

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


def process_videos(
    bucket_name: str,
    date_prefix: str,
    mode: Literal["DESCRIBE", "GENERATE", "DESCRIBE_AND_GENERATE"],
    storage_client: StorageClient,
    ai_client: GoogleAIClient,
    n: Optional[int] = None,
    max_length: int = 10,
) -> List[Dict[str, Any]]:
    """
    Process videos based on mode: describe, generate, or both

    Args:
        bucket_name: Name of the R2 bucket
        date_prefix: Date prefix to filter videos (YYYY-MM-DD format)
        mode: Operation mode - DESCRIBE, GENERATE, or DESCRIBE_AND_GENERATE
        storage_client: Initialized R2 client
        ai_client: Initialized Google AI client (only Google supports video)
        n: Optional limit on number of videos to process (processes all if None)
        max_length: Maximum length of video in seconds (default: 10)

    Returns:
        List of processed video results
    """
    results = []

    # List all metadata files for the given date
    prefix = f"{date_prefix}/pexel_videos_raw/"
    print(f"Listing video metadata files with prefix: {prefix}")

    response = storage_client.list_objects(bucket_name, prefix=prefix)
    objects = response.get("Contents", [])
    meta_files = [obj["Key"] for obj in objects if obj["Key"].endswith("_meta.json")]

    # Limit to first n files if specified
    if n is not None and n > 0:
        meta_files = meta_files[:n]
        print(f"Found {len(objects)} metadata files, processing first {len(meta_files)}")
    else:
        print(f"Found {len(meta_files)} video metadata files")

    for meta_key in meta_files:
        try:
            # Extract the video number from metadata filename
            # Example: 2026-01-02/pexel_videos_raw/001_meta.json -> 001
            video_number = meta_key.split("/")[-1].replace("_meta.json", "")
            video_key = f"{date_prefix}/pexel_videos_raw/{video_number}"

            print(f"\n--- Processing video {video_number} ---")
            print(f"Metadata key: {meta_key}")
            print(f"Video key: {video_key}")

            # Get existing metadata
            metadata = storage_client.get_json(bucket_name, meta_key)
            original_video_id = metadata.get("id", video_number)

            # Download the video (needed for DESCRIBE mode)
            print(f"Downloading video from {video_key}...")
            video_data = storage_client.get_object(bucket_name, video_key)
            print(f"Video downloaded: {len(video_data)} bytes")

            # Cut video if needed
            if max_length > 0:
                try:
                    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as input_tmp:
                        input_tmp.write(video_data)
                        input_path = input_tmp.name
                    
                    output_path = f"{input_path}_cut.mp4"
                    
                    print(f"Cutting video to {max_length} seconds...")
                    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
                    cmd = [
                        ffmpeg_exe,
                        "-y",
                        "-i", input_path,
                        "-t", str(max_length),
                        "-c", "copy",  # Copy stream to avoid re-encoding if possible, but might be less precise
                        output_path
                    ]
                    
                    # Run ffmpeg
                    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                    
                    # Read back cut video
                    with open(output_path, "rb") as f:
                        video_data = f.read()
                    
                    print(f"Video cut: {len(video_data)} bytes")
                    
                    # Cleanup
                    os.unlink(input_path)
                    os.unlink(output_path)
                    
                except Exception as e:
                    print(f"Warning: Failed to cut video: {e}")
                    # Continue with original video
                    if os.path.exists(input_path):
                        os.unlink(input_path)
                    if os.path.exists(output_path):
                        os.unlink(output_path)

            result = {
                "video_number": video_number,
                "video_id": original_video_id,
                "status": "success",
                "meta_key": meta_key,
            }

            # DESCRIBE mode: Generate description and update metadata
            if mode in ["DESCRIBE", "DESCRIBE_AND_GENERATE"]:
                # Check if description already exists
                if "ai_description" in metadata and mode == "DESCRIBE":
                    print(f"Skipping description for {video_number} - already exists")
                    results.append({
                        "video_number": video_number,
                        "status": "skipped",
                        "reason": "already_described",
                    })
                    continue

                # Generate description using Gemini
                print(f"Analyzing video with Google Gemini Vision API...")
                description = ai_client.describe_video(video_data)
                print(f"Generated description: {description}")

                # Update metadata with description, timestamp, and provider
                metadata["ai_description"] = description
                metadata["ai_description_timestamp"] = datetime.utcnow().isoformat()
                metadata["ai_description_provider"] = "google"

                # Upload updated metadata back to R2
                print(f"Updating metadata at {meta_key}...")
                storage_client.put_json(bucket_name, meta_key, metadata)

                result["description"] = description
                print(f"✓ Description added for video {video_number}")

            # GENERATE mode: Generate new videos using Veo 2
            if mode in ["GENERATE", "DESCRIBE_AND_GENERATE"]:
                # Get the description to use as prompt
                if mode == "GENERATE":
                    # For GENERATE-only mode, use existing description
                    prompt = metadata.get("ai_description", "")
                    if not prompt:
                        raise Exception(f"No description found for video {video_number}. Run DESCRIBE mode first.")
                else:
                    # For DESCRIBE_AND_GENERATE, use the newly generated description
                    prompt = description

                print(f"Generating new video using Veo 2 with prompt: {prompt[:100]}...")
                revised_prompt, generated_video_data = ai_client.generate_video(prompt)

                # Upload generated video to R2
                folder_name = "google_generated_videos"
                generated_video_key = f"{date_prefix}/{folder_name}/{original_video_id}"
                print(f"Uploading generated video to {generated_video_key}...")
                storage_client.put_object(
                    bucket_name,
                    generated_video_key,
                    generated_video_data,
                    content_type="video/mp4",
                    cache_control="public, max-age=31536000, immutable",  # 1 year cache
                )

                # Create metadata for generated video
                generated_meta = {
                    "original_video_id": original_video_id,
                    "original_video_key": video_key,
                    "generation_prompt": prompt,
                    "revised_prompt": revised_prompt,
                    "duration_seconds": 5,
                    "generated_at": datetime.utcnow().isoformat(),
                    "provider": "google",
                    "model": "veo-2.0-generate-001",
                }

                # Upload generated video metadata
                generated_meta_key = f"{date_prefix}/{folder_name}/{original_video_id}_meta.json"
                print(f"Uploading generated video metadata to {generated_meta_key}...")
                storage_client.put_json(bucket_name, generated_meta_key, generated_meta, cache_control="max-age=0, no-cache")

                result["generated_video_key"] = generated_video_key
                result["generated_meta_key"] = generated_meta_key
                result["revised_prompt"] = revised_prompt
                print(f"✓ Generated video saved for {video_number}")

            results.append(result)
            print(f"✓ Successfully processed video {video_number}")

        except Exception as e:
            error_msg = f"✗ Failed to process {meta_key}: {str(e)}"
            print(error_msg)
            # Fail fast: raise exception to interrupt the entire Lambda execution
            raise Exception(f"Video processing failed for {meta_key}: {str(e)}") from e

    return results


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda handler function

    Expected event parameters:
    - bucketName: R2 bucket name (default: fakeout-videos-dev)
    - datePrefix: Date prefix for media (default: today's date in YYYY-MM-DD format)
    - mode: Operation mode (default: DESCRIBE_AND_GENERATE)
      - DESCRIBE: Only add AI descriptions to metadata
      - GENERATE: Only generate new media using existing descriptions
      - DESCRIBE_AND_GENERATE: Do both operations
    - mediaType: Type of media to process (default: image)
      - "image": Process images (supports both OpenAI and Google)
      - "video": Process videos (Google only - uses Gemini for vision, Veo 2 for generation)
    - provider: AI provider to use (default: google)
      - "openai": Use OpenAI (GPT-4o-mini for vision, DALL-E 3 for generation) - images only
      - "google": Use Google AI (Gemini for vision, Imagen 3/Veo 2 for generation)
    - n: Optional limit on number of media items to process (default: all)
    - backfill: Whether to rebuild entire manifest (default: true)
    - maxLength: Maximum length of video in seconds (default: 10)

    Returns:
        Lambda response with processing results
    """
    print("Lambda invoked with event:", json.dumps(event, indent=2))

    try:
        # Get parameters from event
        bucket_name = event.get("bucketName", "fakeout-videos-dev")
        date_prefix = event.get("datePrefix", datetime.utcnow().strftime("%Y-%m-%d"))
        mode = event.get("mode", "DESCRIBE_AND_GENERATE").upper()
        media_type = event.get("mediaType", "image").lower()
        provider = event.get("provider", "google").lower()
        n = event.get("n")
        backfill = event.get("backfill", True)
        max_length = event.get("maxLength", 10)

        # Extract storage provider from event or environment
        storage_provider = event.get("storage_provider", os.getenv("STORAGE_PROVIDER", "r2"))
        print(f"Using storage provider: {storage_provider}")

        # Initialize storage client based on provider
        storage_client = create_storage_client(storage_provider)

        # Handle Manifest (Backfill or Update)
        if backfill:
            print(f"Backfill requested (default=True). Updating {media_type} manifest from all existing folders...")
            backfill_manifest(bucket_name, storage_client, media_type)
        else:
            print(f"Updating {media_type} manifest with current date: {date_prefix}")
            update_manifest(bucket_name, date_prefix, storage_client, media_type)

        # Validate mode
        valid_modes = ["DESCRIBE", "GENERATE", "DESCRIBE_AND_GENERATE"]
        if mode not in valid_modes:
            raise ValueError(f"Invalid mode: {mode}. Must be one of {valid_modes}")

        # Validate media type
        valid_media_types = ["image", "video"]
        if media_type not in valid_media_types:
            raise ValueError(f"Invalid mediaType: {media_type}. Must be one of {valid_media_types}")

        # Validate provider
        valid_providers = ["openai", "google"]
        if provider not in valid_providers:
            raise ValueError(f"Invalid provider: {provider}. Must be one of {valid_providers}")

        # Video processing only supports Google
        if media_type == "video" and provider != "google":
            raise ValueError("Video processing only supports Google provider (Gemini for vision, Veo 2 for generation)")

        print(f"Bucket: {bucket_name}")
        print(f"Date prefix: {date_prefix}")
        print(f"Mode: {mode}")
        print(f"Media type: {media_type}")
        print(f"Provider: {provider}")
        if n is not None:
            print(f"Limit: {n} items")

        # Initialize AI client based on provider
        if provider == "google":
            ai_client = GoogleAIClient()
        else:  # openai
            ai_client = VisionClient()

        # Process based on media type
        if media_type == "video":
            results = process_videos(
                bucket_name=bucket_name,
                date_prefix=date_prefix,
                mode=mode,
                storage_client=storage_client,
                ai_client=ai_client,
                n=n,
                max_length=max_length,
            )
            item_type = "videos"
        else:
            results = process_images(
                bucket_name=bucket_name,
                date_prefix=date_prefix,
                mode=mode,
                storage_client=storage_client,
                ai_client=ai_client,
                provider=provider,
                n=n,
            )
            item_type = "images"

        # Count results by status
        success_count = sum(1 for r in results if r["status"] == "success")
        skipped_count = sum(1 for r in results if r["status"] == "skipped")

        print(f"\n=== Processing Complete ===")
        print(f"Total: {len(results)} {item_type}")
        print(f"Success: {success_count}")
        print(f"Skipped: {skipped_count}")

        return {
            "statusCode": 200,
            "body": json.dumps({
                "success": True,
                "message": f"Successfully processed {item_type} in {mode} mode using {provider}",
                "data": {
                    "bucket_name": bucket_name,
                    "date_prefix": date_prefix,
                    "media_type": media_type,
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
