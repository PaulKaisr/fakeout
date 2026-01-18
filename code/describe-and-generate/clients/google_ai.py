"""
Google AI (Gemini) client for vision and image/video generation
"""

import os
import time
import tempfile
from typing import Optional
from google import genai
from google.genai import types


class GoogleAIClient:
    """Client for Google Gemini Vision API, Imagen for image generation, and Veo 2 for video generation"""

    VISION_SYSTEM_PROMPT = """You are an expert image analyst. Your task is to provide detailed, accurate descriptions of images. The descriptions should be used as prompt for generating the same image using text-to-image models.

Your descriptions should:
- Be comprehensive and capture all important visual elements
- Describe the main subject, setting, colors, mood, and composition
- Note any interesting details, textures, or lighting
- Be objective and factual, avoiding subjective interpretations unless clearly evident
- Be as detailed as necessary to recreate the image accurately

Focus on what makes the image unique and visually interesting."""

    VIDEO_VISION_SYSTEM_PROMPT = """You are an expert cinematographer analyzing real-world footage. Your task is to describe videos with photographic precision so they can be recreated with maximum realism.

Your descriptions MUST capture these elements that distinguish real footage from AI-generated video:

CAMERA AND LENS CHARACTERISTICS:
- Specific camera behavior (handheld micro-shake, tripod stability, gimbal smoothness)
- Lens properties (focal length feel, depth of field, bokeh quality, lens breathing)
- Focus behavior (rack focus, autofocus hunting, sharp vs soft areas)
- Exposure characteristics (auto-exposure adjustments, highlight rolloff)

NATURAL MOTION AND PHYSICS:
- Realistic motion blur on moving elements
- Natural acceleration/deceleration of movements
- Weight and momentum in how objects and subjects move
- Subtle environmental motion (leaves, fabric, hair responding to breeze)
- Authentic human micro-movements (breathing, weight shifts, eye movements)

LIGHTING AND ATMOSPHERE:
- Actual lighting conditions (overcast, direct sun, golden hour, artificial)
- How light interacts with surfaces (specular highlights, subsurface scattering on skin)
- Atmospheric effects (haze, dust particles in light beams, humidity)
- Shadow behavior and softness

IMPERFECTIONS THAT SIGNAL AUTHENTICITY:
- Dust, scratches, or artifacts on lens
- Compression artifacts or noise in low-light areas
- Rolling shutter effects on fast motion
- Color fringing or chromatic aberration at high contrast edges

Describe the scene as a director would brief a cinematographer to recreate it with a real camera."""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Google AI client

        Args:
            api_key: Google AI API key (defaults to GOOGLE_AI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("GOOGLE_AI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "Google AI API key is required. Provide via constructor or GOOGLE_AI_API_KEY environment variable."
            )

        # Initialize the client
        self.client = genai.Client(api_key=self.api_key)

    def describe_image(
        self,
        image_data: bytes,
        max_tokens: int = 300,
        model: str = "gemini-2.0-flash",
    ) -> str:
        """
        Generate a detailed description of an image using Gemini Vision API with inline data

        Args:
            image_data: Image data as bytes
            max_tokens: Maximum tokens in the response
            model: Gemini model to use (gemini-2.0-flash-exp, gemini-1.5-pro, etc.)

        Returns:
            Description of the image
        """
        try:
            # Call Gemini Vision API with inline image (more efficient for Lambda)
            # Note: Can pass contents directly as a list of parts without wrapping in Content
            response = self.client.models.generate_content(
                model=model,
                contents=[
                    f"{self.VISION_SYSTEM_PROMPT}\n\nPlease provide a detailed description of this image.",
                    types.Part.from_bytes(
                        data=image_data,
                        mime_type="image/jpeg"
                    ),
                ],
                config=types.GenerateContentConfig(
                    max_output_tokens=max_tokens,
                    temperature=0.7,
                ),
            )

            return response.text.strip()

        except Exception as e:
            raise Exception(f"Failed to describe image with Gemini Vision API: {str(e)}")

    def describe_video(
        self,
        video_data: bytes,
        max_tokens: int = 500,
        model: str = "gemini-2.0-flash",
    ) -> str:
        """
        Generate a detailed description of a video using Gemini Vision API

        Args:
            video_data: Video data as bytes
            max_tokens: Maximum tokens in the response
            model: Gemini model to use

        Returns:
            Description of the video
        """
        try:
            # Videos need to be uploaded via Files API (can't be passed inline like images)
            # Write video to a temporary file and upload
            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_file:
                tmp_file.write(video_data)
                tmp_path = tmp_file.name

            try:
                # Upload video file
                print(f"Uploading video to Gemini Files API...")
                video_file = self.client.files.upload(file=tmp_path)
                print(f"Video uploaded: {video_file.name}")

                # Wait for file to be processed
                while video_file.state.name == "PROCESSING":
                    print("Waiting for video processing...")
                    time.sleep(2)
                    video_file = self.client.files.get(name=video_file.name)

                if video_file.state.name == "FAILED":
                    raise Exception(f"Video processing failed: {video_file.state.name}")

                # Call Gemini Vision API with the uploaded video
                response = self.client.models.generate_content(
                    model=model,
                    contents=[
                        video_file,
                        f"{self.VIDEO_VISION_SYSTEM_PROMPT}",
                    ],
                    config=types.GenerateContentConfig(
                        max_output_tokens=max_tokens,
                        temperature=0.7,
                    ),
                )

                return response.text.strip()

            finally:
                # Clean up temporary file
                os.unlink(tmp_path)

        except Exception as e:
            raise Exception(f"Failed to describe video with Gemini Vision API: {str(e)}")

    def generate_image(
        self,
        prompt: str,
        model: str = "gemini-2.5-flash-image",
        aspect_ratio: str = "1:1",
        image_size: str = "1K",
    ) -> tuple[str, bytes]:
        """
        Generate an image using Nano Banana (Gemini 2.5 Flash Image) based on a text prompt

        Args:
            prompt: Text description of the image to generate
            model: Model to use (gemini-2.5-flash-image for Nano Banana, gemini-3-pro-image-preview for Nano Banana Pro)
            aspect_ratio: Aspect ratio - "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"
            image_size: Image size - "1K", "2K", "4K" (uppercase K required)

        Returns:
            Tuple of (prompt, image_data_bytes)
            Note: Google AI doesn't return a revised prompt, so we return the original
        """
        try:
            # Configure generation parameters
            # Note: Only using aspect_ratio for now, as image_size may not be supported
            config = types.GenerateContentConfig(
                response_modalities=['IMAGE'],
                image_config=types.ImageConfig(
                    aspect_ratio=aspect_ratio,
                ),
            )

            # Generate image using generate_content (Nano Banana API)
            response = self.client.models.generate_content(
                model=model,
                contents=prompt,  # Pass prompt directly as string, not in a list
                config=config,
            )

            # Debug: Check if response has parts
            if not hasattr(response, 'parts') or response.parts is None:
                raise Exception(f"Response has no parts. Response type: {type(response)}, Response: {response}")

            # Extract image from response parts
            for part in response.parts:
                if part.inline_data is not None:
                    # Get raw image bytes directly from inline_data.data
                    # This is already the binary image data we need
                    image_data = part.inline_data.data

                    # Google AI doesn't provide a revised prompt, return original
                    return prompt, image_data

            # If no image found in response
            raise Exception("No image data found in response parts")

        except Exception as e:
            raise Exception(f"Failed to generate image with Google AI: {str(e)}")

    def generate_video(
        self,
        prompt: str,
        model: str = "veo-3.1-generate-preview",
        duration_seconds: int = 4,
        aspect_ratio: str = "16:9",
        timeout_seconds: int = 300,
    ) -> tuple[str, bytes]:
        """
        Generate a video using Veo 3 based on a text prompt

        Args:
            prompt: Text description of the video to generate
            model: Model to use (veo-3.1-generate-preview)
            duration_seconds: Duration of generated video (5-8 seconds for Veo 2)
            aspect_ratio: Aspect ratio - "16:9", "9:16", "1:1"
            timeout_seconds: Maximum time to wait for video generation

        Returns:
            Tuple of (prompt, video_data_bytes)
        """
        try:
            print(f"Starting video generation with Veo 3...")
            print(f"Prompt: {prompt[:100]}...")
            print(f"Duration: {duration_seconds}s, Aspect ratio: {aspect_ratio}")

            # Start async video generation operation
            operation = self.client.models.generate_videos(
                model=model,
                prompt=prompt,
                config=types.GenerateVideosConfig(
                    number_of_videos=1,
                    duration_seconds=duration_seconds,
                    aspect_ratio=aspect_ratio,
                    # enhance_prompt=True,
                ),
            )

            print(f"Video generation started, operation: {operation.name}")

            # Poll for completion
            start_time = time.time()
            poll_interval = 10  # Check every 10 seconds

            while not operation.done:
                elapsed = time.time() - start_time
                if elapsed > timeout_seconds:
                    raise Exception(f"Video generation timed out after {timeout_seconds} seconds")

                print(f"Waiting for video generation... ({int(elapsed)}s elapsed)")
                time.sleep(poll_interval)
                operation = self.client.operations.get(operation)

            # Check for errors
            if operation.error:
                raise Exception(f"Video generation failed: {operation.error}")

            # Extract video from response
            if not operation.response or not operation.response.generated_videos:
                raise Exception("No video generated in response")

            generated_video = operation.response.generated_videos[0]

            # Get video data
            video_data = None

            if hasattr(generated_video, 'video') and generated_video.video:
                video = generated_video.video

                # First try video_bytes if available (for local videos)
                if hasattr(video, 'video_bytes') and video.video_bytes:
                    video_data = video.video_bytes
                    print("Got video_data from video.video_bytes")
                # For remote videos, download from URI with API key authentication
                elif hasattr(video, 'uri') and video.uri:
                    print(f"Downloading video from URI: {video.uri}")
                    import requests

                    # Use x-goog-api-key header for authentication
                    headers = {"x-goog-api-key": self.api_key}
                    resp = requests.get(video.uri, headers=headers)
                    resp.raise_for_status()
                    video_data = resp.content
                    print(f"Got video_data from URI download: {len(video_data)} bytes")

            if video_data is None:
                raise Exception(f"Could not extract video bytes from generated video")

            print(f"Video generation complete! Size: {len(video_data)} bytes")

            # Veo 2 doesn't return a revised prompt, return original
            return prompt, video_data

        except Exception as e:
            raise Exception(f"Failed to generate video with Veo 3: {str(e)}")
