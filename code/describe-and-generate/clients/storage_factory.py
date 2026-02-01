"""
Storage client factory for creating R2 or Supabase storage clients
"""

from typing import Literal, Protocol
from clients.r2 import R2Client
from clients.supabase_storage import SupabaseStorageClient


class StorageClient(Protocol):
    """Protocol defining storage client interface"""

    def get_object(self, bucket_name: str, key: str) -> bytes:
        """Retrieve an object as bytes"""
        ...

    def get_json(self, bucket_name: str, key: str) -> dict:
        """Retrieve and parse a JSON object"""
        ...

    def put_object(
        self, bucket_name: str, key: str, body: bytes, content_type: str | None, cache_control: str | None
    ) -> dict:
        """Upload an object"""
        ...

    def put_json(self, bucket_name: str, key: str, data: dict, cache_control: str) -> dict:
        """Upload a JSON object"""
        ...

    def list_objects(self, bucket_name: str, prefix: str | None, max_keys: int, delimiter: str | None) -> dict:
        """List objects in a bucket"""
        ...


def create_storage_client(provider: Literal["r2", "supabase"] = "r2") -> StorageClient:
    """
    Factory function to create storage client based on provider

    Args:
        provider: Storage provider - "r2" or "supabase" (default: "r2")

    Returns:
        Storage client instance (R2Client or SupabaseStorageClient)
    """
    if provider == "supabase":
        print("Initializing Supabase Storage client")
        return SupabaseStorageClient()
    else:
        print("Initializing R2 Storage client")
        return R2Client()
