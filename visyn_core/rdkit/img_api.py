import logging

from fastapi import APIRouter
from rdkit import rdBase
from rdkit.Chem import Mol  # type: ignore
from rdkit.Chem.Scaffolds import MurckoScaffold  # type: ignore
from starlette.responses import Response
from starlette.status import HTTP_204_NO_CONTENT
from uvicorn.logging import DefaultFormatter

from ..settings.constants import default_logging_dict
from .models import (
    SmilesMolecule,
    SmilesSmartsMolecule,
    SubstructuresResponse,
    SvgResponse,
)
from .util.draw import draw, draw_similarity
from .util.molecule import aligned, maximum_common_substructure_query_mol

app = APIRouter(prefix="/api/rdkit", tags=["RDKit"])


# Send RDKit's C++ logs to python logger
# see https://greglandrum.github.io/rdkit-blog/posts/2024-02-23-custom-transformations-and-logging.html#connecting-the-rdkit-logs-to-the-python-logger
logger = logging.getLogger("rdkit")  # defined here: https://github.com/rdkit/rdkit/blob/Release_2023_09_6/rdkit/__init__.py#L14
# set the log level for the default log handler (the one which sends output to the console/notebook):
# default is WARNING, see https://github.com/rdkit/rdkit/blob/Release_2023_09_6/rdkit/__init__.py#L32
logger.handlers[0].setLevel(logging.INFO)
# Set formatter to match the uvicorn logger we use:
logger.handlers[0].setFormatter(
    DefaultFormatter(
        default_logging_dict["formatters"]["default"]["format"], datefmt=default_logging_dict["formatters"]["default"]["datefmt"]
    )
)

# Tell the RDKit's C++ backend to use the python logger:
rdBase.LogToPythonLogger()


@app.get("/", response_class=SvgResponse)
def draw_smiles(
    structure: SmilesMolecule, substructure: SmilesMolecule | None = None, align: SmilesMolecule | None = None, size: int = 300
):
    return draw(structure.mol, size=size, substructure=aligned(structure.mol, align and align.mol) or (substructure and substructure.mol))


@app.post("/")
def multiple_images(structures: set[SmilesMolecule], size: int = 300):
    return {m: draw(m.mol, size=size) for m in structures}


@app.get("/murcko/", response_class=SvgResponse)
def draw_murcko(structure: SmilesMolecule, size: int = 300):
    """https://www.rdkit.org/docs/GettingStartedInPython.html#murcko-decomposition"""
    murcko = MurckoScaffold.GetScaffoldForMol(structure.mol)
    return draw(murcko, size=size)


@app.get("/similarity/", response_class=SvgResponse)
def draw_molecule_similarity(structure: SmilesMolecule, reference: SmilesMolecule):
    return draw_similarity(structure.mol, reference.mol)


#######################
# Multi mol endpoints #
#######################


@app.post("/mcs/", response_class=SvgResponse)
def draw_maximum_common_substructure_molecule(structures: list[SmilesMolecule], size: int = 300):
    unique = [m.mol for m in set(structures)]
    mcs = maximum_common_substructure_query_mol(unique)
    if not mcs or not isinstance(mcs, Mol):
        return Response("null", status_code=HTTP_204_NO_CONTENT)
    return draw(mcs, size=size)


@app.post("/substructures/")
def substructures_count(structures: set[SmilesMolecule], substructure: SmilesSmartsMolecule) -> SubstructuresResponse:
    """Check and return number of possible substructures in a set of structures"""
    ssr = SubstructuresResponse()
    for smiles in set(structures):
        ssr.valid[smiles] = smiles.mol.HasSubstructMatch(substructure.mol)
        # returns the indices of molecules matching
        ssr.count[smiles] = len(smiles.mol.GetSubstructMatch(substructure.mol))
    return ssr
