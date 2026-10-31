<!-- STANDARDS
Artifact: SCOPE
Cycle: add-assistant-chat-to-the-help-center-20260923T101500Z-3c9e71ab
-->

# Help Center Assistant Chat

## Goal

Let help-center visitors ask questions in a chat and read the assistant's reply
while it is being generated, so they can get answers without opening a support
ticket.

## Constraints

- Replies come from the hosted LLM provider the team already has an account
  with; the provider key stays on the server.
- The chat lives on its own page. Article search, article pages, and article
  feedback keep their current behavior.

## Non-goals

- Saving conversations across visits or tying them to an account.
- Answering from a search index of the help articles.
- Handing a conversation over to a human support agent.

## Work

### 1. Streamed replies

**Intent:** Visitors see the answer build up instead of waiting for a complete
reply, and know when it is finished.

**Done when:**

- `AC-001`: The assistant's reply streams to the user as it is generated, and
  the stream ends cleanly when the reply is finished.

**Depends on:** None

### 2. Blocked replies

**Intent:** When the provider's content filter blocks a reply, the visitor gets
a clear, consistent answer rather than a fragment or an empty bubble.

**Done when:**

- `AC-002`: When the provider blocks a reply with its content filter, the user
  sees a fixed safe message.

**Depends on:** Work item 1

### 3. Useful answers

**Intent:** The chat is only worth offering if visitors get answers they can act
on.

**Done when:**

- `AC-003`: Replies are helpful and accurate.

**Depends on:** Work item 1
