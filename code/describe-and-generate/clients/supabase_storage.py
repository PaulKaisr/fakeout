"""
Supabase Storage client wrapper
"""

import os
import json
from supabase import create_client, Client
from typing import Optional, Dict, Any


class SupabaseStorageClient:
    """Client for interacting with Supabase Storage"""

    def __init__(
        self,
        url: Optional[str] = None,
        service_role_key: Optional[str] = None,
    ):
        """
        Initialize Supabase Storage client with credentials

        Args:
            url: Supabase project URL (defaults to SUPABASE_URL env var)
            service_role_key: Supabase service role key (defaults to SUPABASE_SERVICE_ROLE_KEY env var)
        """
        self.url = url or os.getenv("SUPABASE_URL")
        self.service_role_key = service_role_key or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not all([self.url, self.service_role_key]):
            raise ValueError(
                "Supabase credentials are required. Provide via constructor or environment variables "
                "(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)."
            )

        self.client: Client = create_client(self.url, self.service_role_key)

    def get_object(self, bucket_name: str, key: str) -> bytes:
        """
        Retrieve an object from Supabase Storage

        Args:
            bucket_name: Name of the Supabase bucket
            key: Object key/path

        Returns:
            Object data as bytes
        """
        try:
            response = self.client.storage.from_(bucket_name).download(key)
            return response
        except Exception as e:
            raise Exception(f"Failed to get object {key} from bucket {bucket_name}: {str(e)}")

    def get_json(self, bucket_name: str, key: str) -> Dict[str, Any]:
        """
        Retrieve a JSON object from Supabase Storage and parse it

        Args:
            bucket_name: Name of the Supabase bucket
            key: Object key/path

        Returns:
            Parsed JSON data as dictionary
        """
        data = self.get_object(bucket_name, key)
        return json.loads(data.decode("utf-8"))

    def put_object(
        self,
        bucket_name: str,
        key: str,
        body: bytes,
        content_type: Optional[str] = None,
        cache_control: Optional[str] = None,
    ) -> Dict[str, str]:
        """
        Upload an object to Supabase Storage

        Args:
            bucket_name: Name of the Supabase bucket
            key: Object key/path
            body: Object data as bytes
            content_type: MIME type of the object
            cache_control: Cache-Control header value

        Returns:
            Dictionary with upload details (key, success)
        """
        try:
            file_options = {}
            if content_type:
                file_options["content-type"] = content_type
            if cache_control:
                file_options["cache-control"] = cache_control

            # Use upsert to allow overwriting existing files
            file_options["upsert"] = "true"

            response = self.client.storage.from_(bucket_name).upload(
                path=key,
                file=body,
                file_options=file_options
            )

            return {
                "key": key,
                "success": True,
            }
        except Exception as e:
            raise Exception(f"Failed to put object {key} to bucket {bucket_name}: {str(e)}")

    def put_json(
        self,
        bucket_name: str,
        key: str,
        data: Dict[str, Any],
        cache_control: str = "max-age=0, no-cache",
    ) -> Dict[str, str]:
        """
        Upload a JSON object to Supabase Storage

        Args:
            bucket_name: Name of the Supabase bucket
            key: Object key/path
            data: Dictionary to serialize as JSON
            cache_control: Cache-Control header value (default: 'max-age=0, no-cache' for metadata)

        Returns:
            Dictionary with upload details (key, success)
        """
        json_bytes = json.dumps(data, indent=2).encode("utf-8")
        return self.put_object(
            bucket_name,
            key,
            json_bytes,
            content_type="application/json",
            cache_control=cache_control,
        )

    def list_objects(
        self,
        bucket_name: str,
        prefix: Optional[str] = None,
        max_keys: int = 1000,
        delimiter: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        List objects in a Supabase Storage bucket

        Args:
            bucket_name: Name of the Supabase bucket
            prefix: Filter objects by prefix (path)
            max_keys: Maximum number of keys to return (not strictly enforced by Supabase)
            delimiter: Delimiter for folder-like listing (e.g., "/")

        Returns:
            Dictionary containing 'Contents' (list of objects) and optionally 'CommonPrefixes' (folders)
        """
        try:
            # Supabase Storage list API
            # If prefix is provided, list that path; otherwise list root
            path = prefix.rstrip("/") if prefix else ""

            response = self.client.storage.from_(bucket_name).list(path=path)

            # Convert Supabase response to S3-compatible format
            contents = []
            common_prefixes = []

            for item in response:
                item_name = item.get("name", "")
                # Build full key path
                full_key = f"{prefix or ''}{item_name}"

                # Check if this is a folder (has 'id' field set to null or is a folder type)
                if item.get("id") is None:
                    # It's a folder
                    if delimiter == "/":
                        common_prefixes.append({"Prefix": full_key + "/"})
                else:
                    # It's a file
                    contents.append({
                        "Key": full_key,
                        "Size": item.get("metadata", {}).get("size", 0),
                        "LastModified": item.get("updated_at", item.get("created_at", "")),
                    })

            result = {"Contents": contents}
            if delimiter == "/" and common_prefixes:
                result["CommonPrefixes"] = common_prefixes

            return result
        except Exception as e:
            raise Exception(f"Failed to list objects in bucket {bucket_name}: {str(e)}")
