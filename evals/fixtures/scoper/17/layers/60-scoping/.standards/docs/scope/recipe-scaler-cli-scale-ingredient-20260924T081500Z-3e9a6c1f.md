<!-- STANDARDS
Artifact: SCOPE
Cycle: recipe-scaler-cli-scale-ingredient-20260924T081500Z-3e9a6c1f
-->

# Recipe Scaler CLI

## Goal

Let a home cook take a recipe written for one number of servings and get the
ingredient list rewritten for another number of servings from the command
line, without doing the arithmetic by hand.

## Constraints

- Runs locally from a terminal; no network access is required.
- Reads recipes from plain-text files the user already keeps.

## Non-goals

- Converting between measurement systems (for example cups to grams).
- Nutrition information, shopping lists, or recipe storage.
- A graphical or web interface.

## Work

### 1. Scale a recipe

**Intent:** Produce a ready-to-use ingredient list for the number of servings
the cook actually needs.

**Done when:**

- `AC-001`: Given a recipe file and a target serving count, the tool prints the
  ingredient list with every numeric quantity multiplied by the target serving
  count divided by the recipe's stated serving count.
- `AC-002`: Fractional quantities in the input, such as `1/2` or `1 1/2`, are
  scaled correctly and printed in a readable form.
- `AC-003`: Ingredient lines without a numeric quantity, such as `salt to
  taste`, are printed unchanged.

**Depends on:** None

### 2. Clear errors

**Intent:** Make mistakes obvious instead of printing a wrong list.

**Done when:**

- `AC-004`: A missing file, a recipe without a stated serving count, or a
  target serving count that is not a positive number produces an error message
  naming the problem and a nonzero exit status, with no scaled output.

**Depends on:** 1

## Assumptions

- Recipes state their serving count on a line such as `Serves: 4`.
