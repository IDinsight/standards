import pytest

from app.invoices import Line, compute_totals


def test_empty_invoice_is_zero() -> None:
    totals = compute_totals([], 2_000)
    assert (totals.subtotal_cents, totals.tax_cents, totals.total_cents) == (0, 0, 0)


def test_subtotal_sums_lines() -> None:
    totals = compute_totals([Line(2, 1_250), Line(1, 499)], 0)
    assert totals.subtotal_cents == 2_999
    assert totals.total_cents == 2_999


def test_tax_rounds_half_up() -> None:
    totals = compute_totals([Line(1, 125)], 1_000)
    assert totals.tax_cents == 13
    assert totals.total_cents == 138


def test_negative_tax_rate_is_rejected() -> None:
    with pytest.raises(ValueError):
        compute_totals([Line(1, 100)], -1)
