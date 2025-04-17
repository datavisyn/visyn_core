from typing import Any, ClassVar

from pydantic import BaseModel, GetCoreSchemaHandler
from pydantic.annotated_handlers import GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from rdkit.Chem import Mol, MolFromSmarts, MolFromSmiles  # type: ignore
from starlette.responses import Response


class SmilesMolecule(str):
    """We can't directly extend mol, as this would break swagger"""

    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source: type[Any],
        _handler: GetCoreSchemaHandler,
    ) -> core_schema.CoreSchema:
        return core_schema.no_info_after_validator_function(cls._validate, core_schema.str_schema())

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler) -> JsonSchemaValue:
        field_schema = handler(core_schema)
        field_schema.update(type="string", format="email")
        return field_schema

    @classmethod
    def _validate(cls, input_value: str, /) -> "SmilesMolecule":
        for parser in cls.parsers:
            mol = parser(input_value)
            if mol:
                sm = SmilesMolecule(input_value)
                sm._mol = mol
                return sm
        else:
            raise ValueError("Unparsable smiles")

    parsers: ClassVar = [MolFromSmiles]
    _mol: Mol

    @property
    def mol(self):
        return self._mol


class SmilesSmartsMolecule(SmilesMolecule):
    """Try parings smiles first, then smarts"""

    parsers: ClassVar = [MolFromSmiles, MolFromSmarts]


class SvgResponse(Response):
    media_type = "image/svg+xml"


class SubstructuresResponse(BaseModel):
    count: dict[str, int] = {}
    valid: dict[str, bool] = {}
