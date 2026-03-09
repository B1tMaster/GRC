from typing import List, Optional, Dict, Any, Union, Iterable
from dataclasses import dataclass, field
from pydantic import BaseModel


@dataclass
class ZeroxArgs:
    """
    Dataclass to store the arguments for the Zerox class.
    """

    file_path: str
    cleanup: bool = True
    concurrency: int = 10
    maintain_format: bool = False
    model: str = "gpt-4o-mini",
    output_dir: Optional[str] = None
    temp_dir: Optional[str] = None
    custom_system_prompt: Optional[str] = None
    select_pages: Optional[Union[int, Iterable[int]]] = None
    kwargs: Dict[str, Any] = field(default_factory=dict)

@dataclass
class Page:
    """
    Dataclass to store the page content.
    """

    content: str
    content_length: int
    page: int


class Page(BaseModel):
    content: str
    page: int
    content_length: int
    status: str = "success"
    error: Optional[str] = None

class Summary(BaseModel):
    total_pages: int
    ocr: Optional[Dict[str, int]] = None
    extracted: Optional[Dict[str, int]] = None

class ZeroxOutput(BaseModel):
    completion_time: float
    file_name: str
    input_tokens: int
    output_tokens: int
    pages: List[Page]
    extracted: Optional[Dict[str, Any]] = None
    summary: Optional[Summary] = None
    bookmarks: Optional[List[Dict[str, Any]]] = None