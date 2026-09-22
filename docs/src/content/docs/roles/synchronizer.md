---
title: Synchronizer
description: Reconcile completed work before user sign-off.
sidebar:
  badge:
    text: WIP
    variant: caution
---

:::caution[Work in progress] This role's implementation and detailed usage
documentation are WIP. :::

Synchronizer owns reconciliation in `SYNCHRONIZING`. The workflow must not
advance to user sign-off while a current acceptance condition lacks sufficient
verification evidence or has an unresolved blocker.

The [protocol](../../reference/protocol/) defines the shared ownership and
transition rules. This page will expand with inputs, outputs, invocation
examples, and the role's completion procedure as the implementation is
completed.
