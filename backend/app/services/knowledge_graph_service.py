"""
Knowledge graph service.

For the MVP this is a simple in-memory JSON graph (loaded once, cached),
matching the exact node/edge shape the frontend's Knowledge Explorer
already expects. The service is deliberately expressed behind a small
interface (`get_graph`, `neighbors`) so a real graph database (Neo4j) can
replace the storage layer later without changing the API contract at
`GET /api/knowledge-graph`.
"""
from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Optional

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "knowledge_graph.json"


class KnowledgeGraphService:
    _instance: Optional["KnowledgeGraphService"] = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        self._graph: Optional[dict] = None

    @classmethod
    def instance(cls) -> "KnowledgeGraphService":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = KnowledgeGraphService()
        return cls._instance

    def get_graph(self) -> dict:
        if self._graph is None:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                self._graph = json.load(f)
        return self._graph

    def neighbors(self, node_id: str) -> list[dict]:
        graph = self.get_graph()
        nodes_by_id = {n["id"]: n for n in graph["nodes"]}
        result = []
        for edge in graph["edges"]:
            if edge["from"] == node_id and edge["to"] in nodes_by_id:
                result.append({"edge": edge, "node": nodes_by_id[edge["to"]]})
        return result


def get_knowledge_graph_service() -> KnowledgeGraphService:
    return KnowledgeGraphService.instance()
