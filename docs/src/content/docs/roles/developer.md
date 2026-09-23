---
title: Developer
description: Build the agreed design or a small expedited change.
sidebar:
  badge:
    text: WIP
    variant: caution
---

:::caution[Work in progress]

Implementation and detailed usage instructions are still in progress.

:::

Developer owns implementation in `DEVELOPING`. After it first creates or makes a
significant change to project implementation, it permanently changes the project
mode from `GREENFIELD` to `BROWNFIELD`.

In `EXPEDITED`, Developer implements the change defined by `Active Work.Request`
and performs implementation self-checks; these do not become Tester-owned formal
verification. If it needs a skipped role,
[promote the cycle](../../concepts/states-and-handoffs/#promote-an-expedited-cycle).
