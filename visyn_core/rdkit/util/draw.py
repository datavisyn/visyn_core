from collections.abc import Callable

from rdkit.Chem import Mol  # type: ignore
from rdkit.Chem.Draw import SimilarityMaps, rdMolDraw2D  # type: ignore
from rdkit.Chem.Draw.rdMolDraw2D import MolDraw2DSVG  # type: ignore
from rdkit.Chem.Draw.SimilarityMaps import GetSimilarityMapForFingerprint  # type: ignore


def draw_wrapper(trim: bool):
    def _draw_wrapper(draw_inner: Callable[[MolDraw2DSVG, ...], None]) -> Callable[..., str]:  # type: ignore
        """Function wrapper for drawing

        Can annotate any function that takes a drawer as first arg, ignores its return type
        Passes a drawer into annotated function
        Passes on args and kwargs
        Returns a svg as string
        """

        def inner(*args, **kwargs):
            size = -1 if trim else 300
            drawer = rdMolDraw2D.MolDraw2DSVG(size, size)
            _options = drawer.drawOptions()
            _options.clearBackground = False

            draw_inner(drawer, *args, **kwargs)

            drawer.FinishDrawing()
            return drawer.GetDrawingText().replace("<?xml version='1.0' encoding='iso-8859-1'?>\n", "")

        return inner

    return _draw_wrapper


@draw_wrapper(trim=True)
def draw(drawer: MolDraw2DSVG, structure, substructure=None, trim=False):
    highlight_atoms = structure.GetSubstructMatch(substructure) if substructure else None
    drawer.DrawMolecule(structure, highlightAtoms=highlight_atoms, highlightBonds=None, highlightAtomColors=None, highlightBondColors=None)


def _similarity(m, i):
    """https://github.com/rdkit/rdkit/blob/master/rdkit/Chem/Draw/SimilarityMaps.py"""
    return SimilarityMaps.GetMorganFingerprint(m, i, radius=2, fpType="bv")


@draw_wrapper(trim=False)
def draw_similarity(drawer: MolDraw2DSVG, ref: Mol, probe=Mol, *_):  # ignore args after probe
    GetSimilarityMapForFingerprint(ref, probe, fpFunction=_similarity, draw2d=drawer)
