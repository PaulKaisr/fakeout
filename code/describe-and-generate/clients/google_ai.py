"""
Google AI (Gemini) client for vision and image generation
"""

import os
import base64
from typing import Optional
from google import genai
from google.genai import types


class GoogleAIClient:
    """Client for Google Gemini Vision API and Imagen/Nano Banana Pro for image generation"""

    VISION_SYSTEM_PROMPT = """You are an expert image analyst. Your task is to provide detailed, accurate descriptions of images. The descriptions should be used as prompt for generating the same image using text-to-image models.

Your descriptions should:
- Be comprehensive and capture all important visual elements
- Describe the main subject, setting, colors, mood, and composition
- Note any interesting details, textures, or lighting
- Be objective and factual, avoiding subjective interpretations unless clearly evident
- Be as detailed as necessary to recreate the image accurately

Focus on what makes the image unique and visually interesting."""

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
