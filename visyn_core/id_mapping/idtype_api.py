import logging
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from .. import manager

idtype_router = APIRouter(prefix="/api/idtype", tags=["idtype"])

_log = logging.getLogger(__name__)


def to_plural(s):
    if s[len(s) - 1] == "y":
        return s[0 : len(s) - 1] + "ies"
    return s + "s"


class IdType(BaseModel):
    id: str
    name: str
    names: list[str]


class IdTypeMappingRequest(BaseModel):
    q: list[str]
    mode: Literal["all", "first"] = "all"


class IdTypeMappingSearchRequest(BaseModel):
    q: str
    limit: int | None = 10


class IdTypeMappingSearchResponse(BaseModel):
    match: str
    to: str


@idtype_router.get("/", response_model=list[IdType])
def list_idtypes():
    # TODO: We probably don't want to have these idtypes as "all" idtypes
    # for d in list_datasets():
    #     for idtype in d.to_idtype_descriptions():
    #         tmp[idtype["id"]] = idtype

    # also include the known elements from the mapping graph
    return [IdType(id=idtype_id, name=idtype_id, names=to_plural(idtype_id)) for idtype_id in manager.id_mapping.known_idtypes()]


@idtype_router.get("/{idtype}/", response_model=list[IdType])
def maps_to(idtype: str):
    return manager.id_mapping.maps_to(idtype)


@idtype_router.get("/{idtype}/{to_idtype}/", response_model=list[str])
@idtype_router.post("/{idtype}/{to_idtype}/", response_model=list[str])
def mapping_to(body: IdTypeMappingRequest, idtype: str, to_idtype: str):
    first_only = body.mode == "first"

    names = body.q
    mapped_list = manager.id_mapping(idtype, to_idtype, names)

    if first_only:
        mapped_list = [None if a is None or len(a) == 0 else a[0] for a in mapped_list]

    return mapped_list


@idtype_router.get("/{idtype}/{to_idtype}/search/", response_model=list[IdTypeMappingSearchResponse])
def mapping_to_search(body: IdTypeMappingSearchRequest, idtype, to_idtype):
    query = body.q
    max_results = body.limit
    if hasattr(manager.id_mapping, "search"):
        return manager.id_mapping.search(idtype, to_idtype, query, max_results)
    return []


def create():
    return idtype_router
