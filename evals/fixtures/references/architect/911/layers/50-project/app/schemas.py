from pydantic import BaseModel, ConfigDict, Field


class WarehouseIn(BaseModel):
    code: str = Field(max_length=16)
    name: str


class WarehouseOut(WarehouseIn):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ItemIn(BaseModel):
    sku: str = Field(max_length=64)
    name: str
    quantity: int = Field(default=0, ge=0)
    warehouse_id: int


class ItemOut(ItemIn):
    model_config = ConfigDict(from_attributes=True)

    id: int


class Adjustment(BaseModel):
    delta: int
