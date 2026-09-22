---
title: Developer
description: Implement the standard design or bounded expedited request.
sidebar:
  badge:
    text: WIP
    variant: caution
---

:::caution[Work in progress] This role's implementation and detailed usage
documentation are WIP. :::

Developer owns implementation in `DEVELOPING`. During initial greenfield work,
its first successful material implementation change permanently changes the
project mode to `BROWNFIELD`.

In `EXPEDITED`, Developer implements the bounded `Active Work.Request` and
performs implementation self-checks; these do not become Tester-owned formal
verification. A need for any skipped responsibility requires promotion to
`STANDARD` through Auditor, not an expansion of Developer's ownership.

The [protocol](../../reference/protocol/) defines the shared ownership and
transition rules. This page will expand with inputs, outputs, invocation
examples, and the role's completion procedure as the implementation is
completed.
