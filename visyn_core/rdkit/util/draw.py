from rdkit.Chem import Mol  # type: ignore
from rdkit.Chem.Draw import SimilarityMaps, rdMolDraw2D  # type: ignore
from rdkit.Chem.Draw.rdMolDraw2D import MolDraw2DSVG  # type: ignore
from rdkit.Chem.Draw.SimilarityMaps import GetSimilarityMapForFingerprint  # type: ignore


def get_drawer(size: int):
    drawer = rdMolDraw2D.MolDraw2DSVG(size, size)
    _options = drawer.drawOptions()
    _options.clearBackground = False
    return drawer


def finish_drawing(drawer: MolDraw2DSVG) -> str:
    drawer.FinishDrawing()
    return drawer.GetDrawingText().replace("<?xml version='1.0' encoding='iso-8859-1'?>\n", "")


def draw(structure, *, size: int, substructure: str | None = None):
    drawer = get_drawer(size)
    highlight_atoms = structure.GetSubstructMatch(substructure) if substructure else None
    drawer.DrawMolecule(structure, highlightAtoms=highlight_atoms, highlightBonds=None, highlightAtomColors=None, highlightBondColors=None)
    return finish_drawing(drawer)


def _similarity(m, i):
    """https://github.com/rdkit/rdkit/blob/master/rdkit/Chem/Draw/SimilarityMaps.py"""
    return SimilarityMaps.GetMorganFingerprint(m, i, radius=2, fpType="bv")


def draw_similarity(ref: Mol, probe=Mol, *_):  # ignore args after probe
    drawer = get_drawer(300)
    GetSimilarityMapForFingerprint(ref, probe, fpFunction=_similarity, draw2d=drawer)
    return finish_drawing(drawer)
