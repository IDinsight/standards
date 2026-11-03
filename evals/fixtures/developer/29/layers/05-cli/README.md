# parcels

Summarizes the weekly parcel export by destination country.

Run the tests from the repository root:

    python3 -m pytest

Print the report for an export:

    python3 -m parcels.cli parcels.csv

The CSV needs `parcel_id`, `destination`, and `weight_grams` columns.
