"""
OpenAI Vision and Image Generation API client
"""

import os
import base64
import requests
from typing import Optional
from openai import OpenAI


class VisionClient:
    """Client for OpenAI Vision API to analyze images and DALL-E for image generation"""

    SYSTEM_PROMPT = """You are an expert image analyst. Your task is to provide detailed, accurate descriptions of images. The descriptions should be used as prompt for generating the same image using text-to-image models.

Your descriptions should:
- Be comprehensive and capture all important visual elements
- Describe the main subject, setting, colors, mood, and composition
- Note any interesting details, textures, or lighting
- Be objective and factual, avoiding subjective interpretations unless clearly evident
- Be as detailed as necessary to recreate the image accurately

Focus on what makes the image unique and visually interesting."""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize OpenAI Vision client

        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "OpenAI API key is required. Provide via constructor or OPENAI_API_KEY environment variable."
            )

        self.client = OpenAI(api_key=self.api_key)

    def describe_image(
        self,
        image_data: bytes,
        max_tokens: int = 300,
        model: str = "gpt-4o-mini",
    ) -> str:
        """
        Generate a detailed description of an image using OpenAI Vision API

        Args:
            image_data: Image data as bytes
            max_tokens: Maximum tokens in the response
            model: OpenAI model to use (gpt-4o, gpt-4o-mini, etc.)

        Returns:
            Description of the image
        """
        try:
            # Encode image to base64
            base64_image = base64.b64encode(image_data).decode("utf-8")

            # Call OpenAI Vision API
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": self.SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Please provide a detailed description of this image.",
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                },
                            },
                        ],
                    },
                ],
                max_tokens=max_tokens,
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            raise Exception(f"Failed to describe image with OpenAI Vision API: {str(e)}")

    def describe_image_from_url(
        self,
        image_url: str,
        max_tokens: int = 300,
        model: str = "gpt-4o-mini",
    ) -> str:
        """
        Generate a detailed description of an image from a URL using OpenAI Vision API

        Args:
            image_url: Public URL of the image
            max_tokens: Maximum tokens in the response
            model: OpenAI model to use (gpt-4o, gpt-4o-mini, etc.)

        Returns:
            Description of the image
        """
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": self.SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Please provide a detailed description of this image.",
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_url,
                                },
                            },
                        ],
                    },
                ],
                max_tokens=max_tokens,
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            raise Exception(f"Failed to describe image from URL with OpenAI Vision API: {str(e)}")

    def generate_image(
        self,
        prompt: str,
        model: str = "dall-e-3",
        size: str = "1024x1024",
        quality: str = "standard",
        style: str = "vivid",
    ) -> tuple[str, bytes]:
        """
        Generate an image using DALL-E based on a text prompt

        Args:
            prompt: Text description of the image to generate
            model: Model to use (dall-e-3 or dall-e-2)
            size: Image size - dall-e-3: 1024x1024, 1024x1792, 1792x1024
            quality: Image quality - "standard" or "hd" (dall-e-3 only)
            style: Image style - "vivid" or "natural" (dall-e-3 only)

        Returns:
            Tuple of (revised_prompt, image_data_bytes)
        """
        try:
            # Generate image using DALL-E
            response = self.client.images.generate(
                model=model,
                prompt=prompt,
                size=size,
                quality=quality,
                style=style,
                n=1,
            )

            # Get the generated image URL
            image_url = response.data[0].url
            revised_prompt = response.data[0].revised_prompt

            # Download the image data
            import requests
            image_response = requests.get(image_url, timeout=30)
            image_response.raise_for_status()
            image_data = image_response.content

            return revised_prompt, image_data

        except Exception as e:
            raise Exception(f"Failed to generate image with DALL-E API: {str(e)}")
