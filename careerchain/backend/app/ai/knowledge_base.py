import os
import json
import logging
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
# pyrefly: ignore [missing-import]
import numpy as np

logger = logging.getLogger("careerchain.ai.knowledge_base")


class CareerKnowledgeBase:
    def __init__(self, data_dir: str = None):
        if data_dir is None:
            # Locate backend/data/career_knowledge relative to this file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.abspath(os.path.join(current_dir, "..", "..", "data", "career_knowledge"))
        
        self.data_dir = data_dir
        self.documents: List[Dict[str, Any]] = []
        self.doc_texts: List[str] = []
        self.vectorizer: TfidfVectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            lowercase=True
        )
        self.tfidf_matrix = None
        self.load_knowledge_base()

    def load_knowledge_base(self):
        """Load and parse all JSON files from the data directory and build the TF-IDF index."""
        self.documents = []
        self.doc_texts = []

        if not os.path.exists(self.data_dir):
            logger.warning(f"Knowledge data directory does not exist: {self.data_dir}")
            return

        for filename in sorted(os.listdir(self.data_dir)):
            if filename.endswith(".json"):
                filepath = os.path.join(self.data_dir, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        items = json.load(f)
                        if isinstance(items, list):
                            for item in items:
                                self._process_item(item, source_file=filename)
                        elif isinstance(items, dict):
                            self._process_item(items, source_file=filename)
                except Exception as e:
                    logger.error(f"Error loading {filepath}: {e}")

        if self.doc_texts:
            try:
                self.tfidf_matrix = self.vectorizer.fit_transform(self.doc_texts)
                logger.info(f"Loaded {len(self.documents)} career knowledge chunks into vector index.")
            except Exception as e:
                logger.error(f"Error vectorizing knowledge documents: {e}")

    def _process_item(self, item: Dict[str, Any], source_file: str):
        title = item.get("role") or item.get("topic") or item.get("title", "Career Topic")
        category = item.get("category", "General")
        overview = item.get("overview") or item.get("description", "")
        
        skills_str = ", ".join(item.get("core_skills", []))
        roadmap_str = "\n".join([f"- {step}" for step in item.get("learning_roadmap", [])])
        interview_str = "\n".join([f"- {tip}" for tip in item.get("interview_topics", item.get("key_guidelines", []))])
        advice_str = item.get("diu_campus_advice", "")
        project_ideas = item.get("project_ideas", [])
        common_mistakes = item.get("common_mistakes", [])

        projects_str = "\n".join(project_ideas)
        mistakes_str = "\n".join(common_mistakes)
        full_searchable_text = f"{title} {category} {overview} {skills_str} {roadmap_str} {interview_str} {projects_str} {mistakes_str} {advice_str}".strip()

        doc_payload = {
            "id": item.get("id", str(len(self.documents) + 1)),
            "title": title,
            "category": category,
            "overview": overview,
            "core_skills": item.get("core_skills", []),
            "learning_roadmap": item.get("learning_roadmap", []),
            "interview_topics": item.get("interview_topics", item.get("key_guidelines", [])),
            "diu_campus_advice": advice_str,
            "project_ideas": project_ideas,
            "common_mistakes": common_mistakes,
            "raw_text": full_searchable_text,
            "source_file": source_file
        }

        self.documents.append(doc_payload)
        self.doc_texts.append(full_searchable_text)

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Search the knowledge base using TF-IDF cosine similarity."""
        if not self.doc_texts or self.tfidf_matrix is None:
            return []

        try:
            query_vec = self.vectorizer.transform([query])
            cosine_scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
            
            # Rank indices by score descending
            top_indices = np.argsort(cosine_scores)[::-1][:top_k]
            
            results = []
            for idx in top_indices:
                score = float(cosine_scores[idx])
                doc_copy = self.documents[idx].copy()
                doc_copy["relevance_score"] = round(score, 4)
                results.append(doc_copy)

            return results
        except Exception as e:
            logger.error(f"Search failed for query '{query}': {e}")
            return []


# Global singleton instance
knowledge_base = CareerKnowledgeBase()
