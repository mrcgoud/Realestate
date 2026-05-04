import os
import redis.asyncio as redis
import json
import logging
from typing import Optional, Any

logger = logging.getLogger(__name__)

# Redis client
redis_client: Optional[redis.Redis] = None

async def init_redis():
    """Initialize Redis connection"""
    global redis_client
    try:
        redis_client = await redis.from_url(
            f"redis://{os.getenv('REDIS_HOST', 'localhost')}:{os.getenv('REDIS_PORT', 6379)}",
            encoding="utf8",
            decode_responses=True,
        )
        await redis_client.ping()
        logger.info("✅ Redis connected successfully")
    except Exception as e:
        logger.error(f"❌ Redis connection error: {e}")
        raise

async def get_cache(key: str) -> Optional[Any]:
    """Get value from cache"""
    if not redis_client:
        return None
    try:
        value = await redis_client.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception as e:
        logger.warning(f"Cache get error: {e}")
        return None

async def set_cache(key: str, value: Any, ttl: int = 3600):
    """Set value in cache with TTL"""
    if not redis_client:
        return
    try:
        await redis_client.setex(key, ttl, json.dumps(value))
    except Exception as e:
        logger.warning(f"Cache set error: {e}")

async def delete_cache(key: str):
    """Delete cache key"""
    if not redis_client:
        return
    try:
        await redis_client.delete(key)
    except Exception as e:
        logger.warning(f"Cache delete error: {e}")

async def clear_pattern(pattern: str):
    """Clear cache by pattern"""
    if not redis_client:
        return
    try:
        keys = await redis_client.keys(pattern)
        if keys:
            await redis_client.delete(*keys)
    except Exception as e:
        logger.warning(f"Cache clear error: {e}")
