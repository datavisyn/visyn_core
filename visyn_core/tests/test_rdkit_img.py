from pathlib import Path

import pytest
from starlette.testclient import TestClient

mol_expected = ["C", "O", "OO", "[He]"]

# Whenever the images need to be regenerated, set this to True and run the tests.
# This will overwrite the existing images with the new ones, such that you can compare them easily.
REGENERATE_IMAGES = False


def test_regenerate_images_is_false():
    # Safety measure to prevent accidentally overwriting the images.
    assert not REGENERATE_IMAGES


@pytest.mark.parametrize("structure", ["H", "He"])
def test_invalid(client: TestClient, structure):
    """A single H atom isn't a valid molecule"""
    res = client.get("/api/rdkit/", params={"structure": structure})
    assert res.status_code == 422


@pytest.mark.parametrize("structure", mol_expected)
def test_valid(client: TestClient, structure):
    res = client.get("/api/rdkit/", params={"structure": structure})
    existing = Path(__file__).parent.joinpath(f"rdkit/valid_{structure}.svg")
    if REGENERATE_IMAGES:
        existing.write_text(res.text)
    assert res.text == existing.read_text()


def test_align(client: TestClient):
    res = client.get("/api/rdkit/", params={"structure": "C", "align": "C"})
    existing = Path(__file__).parent.joinpath("rdkit/align.svg")
    if REGENERATE_IMAGES:
        existing.write_text(res.text)
    assert res.text == existing.read_text()


def test_substructure(client: TestClient):
    res = client.get("/api/rdkit/", params={"structure": "C", "substructure": "C"})
    existing = Path(__file__).parent.joinpath("rdkit/substructure.svg")
    if REGENERATE_IMAGES:
        existing.write_text(res.text)
    assert res.text == existing.read_text()


def test_murcko(client: TestClient):
    curcumin = "O=C(\\C=C\\c1ccc(O)c(OC)c1)CC(=O)\\C=C\\c2cc(OC)c(O)cc2"
    res = client.get("/api/rdkit/murcko/", params={"structure": curcumin})
    existing = Path(__file__).parent.joinpath("rdkit/murcko.svg")
    if REGENERATE_IMAGES:
        existing.write_text(res.text)
    assert res.text == existing.read_text()


@pytest.mark.parametrize(
    ("mol", "ref"),
    [
        ("CC", "CCCC"),
        ("CCCC", "CC"),
    ],
)
def test_similarity(client: TestClient, mol, ref):
    res = client.get("/api/rdkit/similarity/", params={"structure": mol, "reference": ref})
    existing = Path(__file__).parent.joinpath(f"rdkit/similarity_{mol}_{ref}.svg")
    if REGENERATE_IMAGES:
        existing.write_text(res.text)
    assert res.text == existing.read_text()


# MULTI TESTS


def test_maximum_common_substructure(client: TestClient):
    res = client.post("/api/rdkit/mcs/", json=["C#CCP", "C=CCO"])
    existing = Path(__file__).parent.joinpath("rdkit/maximum_common_substructure.svg")
    if REGENERATE_IMAGES:
        existing.write_text(res.text)
    assert res.text == existing.read_text()


def test_maximum_common_substructure_inconsistent(client: TestClient):
    """This method sometimes returns None -> 500 and sometimes a questionmark"""
    res = client.post("/api/rdkit/mcs/", json=["C1COCCO1", "CC(COC)OC", "CC1(OCCO1)C", "CCCCCCCO", "CCCCCCO"])
    if res.status_code == 200:
        existing = Path(__file__).parent.joinpath("rdkit/maximum_common_substructure_inconsistent.svg")
        if REGENERATE_IMAGES:
            existing.write_text(res.text)
        assert res.text == existing.read_text()
    else:
        assert res.status_code == 204
        assert res.content == b"null"


def test_substructures(client: TestClient):
    res = client.post("/api/rdkit/substructures/", params={"substructure": "C"}, json=["CCC", "[He]", "CC"])
    assert res.status_code == 200
    assert res.json() == {"count": {"CCC": 1, "[He]": 0, "CC": 1}, "valid": {"CCC": True, "[He]": False, "CC": True}}


def test_draw_multi(client: TestClient):
    res = client.post("/api/rdkit/", json=mol_expected)
    assert res.status_code == 200
    assert set(mol_expected) == set(res.json().keys())
    for mol, svg in res.json().items():
        existing = Path(__file__).parent.joinpath(f"rdkit/valid_{mol}.svg")
        assert svg == existing.read_text()
