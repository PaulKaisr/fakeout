"""
Cloudflare R2 client wrapper using boto3 (S3-compatible API)
"""

import os
import json
import boto3
from typing import Optional, Dict, Any


class R2Client:
    """Client for interacting with Cloudflare R2 storage"""

    def __init__(
        self,
        endpoint: Optional[str] = None,
        access_key_id: Optional[str] = None,
        secret_access_key: Optional[str] = None,
    ):
        """
        Initialize R2 client with credentials

        Args:
            endpoint: R2 endpoint URL (defaults to R2_ENDPOINT env var)
            access_key_id: R2 access key ID (defaults to R2_ACCESS_KEY_ID env var)
            secret_access_key: R2 secret access key (defaults to R2_SECRET_ACCESS_KEY env var)
        """
        self.endpoint = endpoint or os.getenv("R2_ENDPOINT")
        self.access_key_id = access_key_id or os.getenv("R2_ACCESS_KEY_ID")
        self.secret_access_key = secret_access_key or os.getenv("R2_SECRET_ACCESS_KEY")

        if not all([self.endpoint, self.access_key_id, self.secret_access_key]):
            raise ValueError(
                "R2 credentials are required. Provide via constructor or environment variables."
            )

        self.s3_client = boto3.client(
            "s3",
            endpoint_url=self.endpoint,
            aws_access_key_id=self.access_key_id,
            aws_secret_access_key=self.secret_access_key,
            region_name="auto",
        )

    def get_object(self, bucket_name: str, key: str) -> bytes:
        """
        Retrieve an object from R2

        Args:
            bucket_name: Name of the R2 bucket
            key: Object key/path

        Returns:
            Object data as bytes
        """
        try:
            response = self.s3_client.get_object(Bucket=bucket_name, Key=key)
            return response["Body"].read()
        except Exception as e:
            raise Exception(f"Failed to get object {key} from bucket {bucket_name}: {str(e)}")

    def get_json(self, bucket_name: str, key: str) -> Dict[str, Any]:
        """
        Retrieve a JSON object from R2 and parse it

        Args:
            bucket_name: Name of the R2 bucket
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
        Upload an object to R2

        Args:
            bucket_name: Name of the R2 bucket
            key: Object key/path
            body: Object data as bytes
            content_type: MIME type of the object
            cache_control: Cache-Control header value

        Returns:
            Dictionary with upload details (key, etag)
        """
        try:
            kwargs = {
                "Bucket": bucket_name,
                "Key": key,
                "Body": body,
            }
            if content_type:
                kwargs["ContentType"] = content_type
            if cache_control:
                kwargs["CacheControl"] = cache_control

            response = self.s3_client.put_object(**kwargs)
            return {
                "key": key,
                "etag": response["ETag"],
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
        Upload a JSON object to R2

        Args:
            bucket_name: Name of the R2 bucket
            key: Object key/path
            data: Dictionary to serialize as JSON
            cache_control: Cache-Control header value (default: 'max-age=0, no-cache' for metadata)

        Returns:
            Dictionary with upload details (key, etag)
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
        List objects in an R2 bucket

        Args:
            bucket_name: Name of the R2 bucket
            prefix: Filter objects by prefix
            max_keys: Maximum number of keys to return
            delimiter: A delimiter is a character you use to group keys.

        Returns:
            Dictionary containing 'Contents' (list of objects) and 'CommonPrefixes' (list of folders)
        """
        try:
            kwargs = {
                "Bucket": bucket_name,
                "MaxKeys": max_keys,
            }
            if prefix:
                kwargs["Prefix"] = prefix
            if delimiter:
                kwargs["Delimiter"] = delimiter

            response = self.s3_client.list_objects_v2(**kwargs)
            return {
                "Contents": response.get("Contents", []),
                "CommonPrefixes": response.get("CommonPrefixes", []),
            }
        except Exception as e:
            raise Exception(f"Failed to list objects in bucket {bucket_name}: {str(e)}")
