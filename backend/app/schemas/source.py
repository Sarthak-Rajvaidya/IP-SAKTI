from __future__ import annotations

from typing import List

from pydantic import BaseModel

from app.schemas.common import Source


class SourcesResponse(BaseModel):
    india: List[Source]
    international: List[Source]
