import os
from langfuse import Langfuse

_langfuse_kwargs = dict(
  public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
  secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
  host=os.getenv("LANGFUSE_HOST"),
)
try:
    langfuse = Langfuse(**_langfuse_kwargs, enabled=os.getenv("ENVIRONMENT") == "development")
except TypeError:
    langfuse = Langfuse(**_langfuse_kwargs)



