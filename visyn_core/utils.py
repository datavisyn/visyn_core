import logging

_log = logging.getLogger(__name__)


def clean_query(query):
    if callable(query):
        return "custom function"
    import re

    q = query.strip()
    q_clean = re.sub(r"(\s)+", " ", q)
    return q_clean
