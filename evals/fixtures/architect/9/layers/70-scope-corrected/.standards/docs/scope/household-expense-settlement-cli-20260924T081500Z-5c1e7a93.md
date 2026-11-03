<!-- STANDARDS
Artifact: SCOPE
Cycle: household-expense-settlement-cli-20260924T081500Z-5c1e7a93
-->

# Household Expense Settlement CLI

## Goal

Housemates record shared purchases in a spreadsheet and export it as CSV. They
need a command-line tool that reads that export and tells them which payments
settle everyone up, so nobody has to work out balances by hand.

## Constraints

- Runs with Node.js 22 using only its standard library; no third-party packages
  (user request).
- Command-line use only; the input is a single CSV file whose path is given on
  the command line.
- Amounts are in a single currency with at most two decimal places.

## Non-goals

- Storing expenses or settlement history between runs.
- Multiple currencies or exchange rates.
- Editing or rewriting the CSV file.
- A graphical or web interface.
- Weighted or percentage-based splits.

## Work

### 1. Read expenses

**Intent:** Accept the spreadsheet export as-is so the household does not have
to reformat anything before running the tool.

**Done when:**

- `AC-001`: Given the path to a CSV file whose first line is the header
  `date,payer,amount,participants`, the tool reads every following row as one
  expense; `participants` lists one or more names separated by semicolons, and
  the payer need not be one of the participants.
- `AC-004`: When any data row has a missing field, an amount that is not a
  positive number with at most two decimal places, or an empty participant
  list, the tool exits with status 1, writes a message naming the offending
  line number to standard error, and prints no payments.

**Depends on:** None

### 2. Settle balances

**Intent:** Tell each person exactly whom to pay and how much, with as few
transfers as is reasonable.

**Done when:**

- `AC-006`: Each expense is divided equally among its participants in whole
  cents; when the amount does not divide evenly, the leftover cents are
  assigned one each to the participants in the order they are listed in that
  row.
- `AC-003`: The tool prints one line per payment in the form
  `<debtor> pays <creditor> <amount>`, with the amount shown to two decimal
  places; applying the printed payments brings every person's balance to
  exactly zero, and no more than N-1 payments are printed when N people have a
  nonzero balance.

**Depends on:** 1

### 3. Usage documentation

**Intent:** Let a housemate who did not build the tool run it correctly.

**Done when:**

- `AC-005`: The repository README explains how to run the tool and describes
  the expected CSV format with an example.

**Depends on:** 1, 2

## Retired Acceptance Identifiers

- `AC-002`: Retired because "split evenly among the people listed" did not say
  how leftover cents are assigned when an amount does not divide evenly;
  replaced by AC-006.

## Assumptions

- Exported fields are not quoted, and names contain no commas or semicolons.
- Names are matched exactly, including letter case.
