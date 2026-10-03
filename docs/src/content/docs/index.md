---
title: S.T.A.N.D.A.R.D.S.
description:
  Build software with coding agents, clear responsibilities, and saved progress.
---

S.T.A.N.D.A.R.D.S. helps you take a software change from an idea to checked,
documented work. Its nine roles cover planning, design, coding, assessment,
documentation, and understanding the project.

You choose which role to run, approve the implementation plan, and decide
whether to accept the finished work. Progress stays in project files so you can
continue in another chat.

## Quickstart

1. In your project directory, with Node.js 22.12 or newer, install STANDARDS:

   ```sh
   npx @idinsight/standards@latest install
   ```

2. Open the project in Codex or Claude Code. Give the first role your request
   (adapt to your actual request):
   - **New project:** `$scoper Build a task tracker.` in Codex or
     `/scoper Build a task tracker.` in Claude Code.
   - **Existing project:** `$auditor Add search to the app.` in Codex or
     `/auditor Add search to the app.` in Claude Code.
3. Follow each role's handoff, approve Developer's plan, and decide whether to
   sign off when the checks are complete.

See [Installation and Setup](./getting-started/installation/) for setup options
and [Your First Workflow](./getting-started/first-workflow/) for a walkthrough.

## Find your next step

- [Introduction](./getting-started/introduction/): understand how the framework
  works and when to use it.
- [Your First Workflow](./getting-started/first-workflow/): follow an example
  from request to sign-off.
- [Workflow map](./concepts/states-and-handoffs/#the-paths-at-a-glance): see the
  standard and expedited paths at a glance.
- [Roles](./roles/overview/): find the right role for a task.
- [Roadmap](./roadmap/): see the directions we are exploring each quarter.
- [Guides](./guides/starting-a-cycle/): start, resume, or change ongoing work.
- [Reference](./reference/protocol/): look up exact rules and document formats.
- [Skill eval report](./reference/skill-eval-report/): see how the role skills
  were tested and how they scored.
- [FAQ](./faq/): get short answers to common questions.
- [Need Help?](./need-help/): ask a question, report a bug, or suggest an
  improvement.

For a project question, use [Navigator](./roles/navigator/). It can explain the
code, investigate behavior, or quiz you without changing files or starting a
workflow.

## Why We Built This

> **Note:** This section reflects the personal views of
> [Tony Zhao](https://www.idinsight.org/person/tony-zhao/), a data scientist at
> IDinsight. These views do not necessarily reflect those of IDinsight or the
> broader
> [data science and engineering team](https://www.idinsight.org/methodology/data-science/)
> at IDinsight.

Coding agents came onto the scene in 2025, and by 2026 they seemed to be
everywhere. Engineering and data science teams (including ours) were figuring
out how, where, and whether to use them.

And the appeal is definitely there. Coding with agents is _very_ addictive, to
say the least. The sheer speed and volume at which they can generate what you
ask for is enough to make you seriously reconsider how you work.

At IDinsight, we started experimenting with coding agents like Codex and Claude
Code in our own work. Some of us were early adopters. Others remained skeptical
for much longer.

I was firmly in the second camp.

I held off on using coding agents until fairly recently in 2026. Part of that
was practical: I wanted the technology and models to mature. But part of it was
also personal. I was reluctant to cede too much control to a model and, frankly,
I didn't want to lose the "joy of coding".

Then one weekend, I decided to give coding agents a real try.

It was for a personal project: something I was perfectly comfortable vibe
coding, with basically no expectations for how elegantly the code was written or
how well it performed. Despite having worked as a data scientist in NLP for a
long time and being very familiar with how language models work, I made quite a
few mistakes in my first attempts at agentic coding.

For example:

- I tried to zero-shot an entire feature on my first attempt, mostly just to see
  how well the agent could handle it.
- I had the same agent that wrote the code also test and review it which is
  hardly an independent review and can reinforce the agent's own mistakes.
- I didn't start with a clear plan. I literally gave it a sentence describing
  what I wanted to build and hit Enter.
- And the list goes on. You get the idea.

Eventually, I started using agents in my work at IDinsight as well. As I made
that transition, I talked with several colleagues about their own experiences:
what worked, what failed, what frustrated them, and the habits they had
developed along the way.

We didn't all use agents in the same way, and we certainly didn't agree on
everything. But we kept running into many of the same problems: unclear
requirements, agents wandering away from the original intent, weak or circular
review, lost context, inconsistent documentation that was often too wordy or
sounded too much like "AI speak", and the general temptation to accept something
simply because it _looked_ finished.

That was when I started thinking we needed a framework—not to make coding agents
autonomous, but almost the opposite: to make their use more structured,
disciplined, and accountable.

So we built S.T.A.N.D.A.R.D.S.

S.T.A.N.D.A.R.D.S. is designed to help teams and individuals **code with
standards** by following a well-defined protocol around planning,
implementation, testing, review, documentation, and human sign-off.

It is not a silver bullet. Not even close.

In fact, one of my biggest issues with S.T.A.N.D.A.R.D.S. is also a consequence
of its design: it can use a _lot_ of tokens. Every step of the agentic coding
process is intentionally made explicit, traceable, and relatively rigid. That
has benefits, but it also has a cost and I fully expect the token usage to give
some developers sticker shock. We're working on reducing that, by the way!

And that's a real tradeoff for developers looking to adopt a coding agent
framework.

These days, I do code with agents, but I still don't want to cede control to
them. There are parts of software development where I expect I will always want
to be directly involved, even if that comes at the cost of some efficiency or
even at the cost of producing the theoretically "best-performing" code possible.

S.T.A.N.D.A.R.D.S. gives me room to do that. For example, the Developer role
includes a `CODE_WITH_ME` mode specifically for cases where I want the agent to
work _with_ me rather than simply go off and implement something on its own.

And, without giving too much away, there are other places in the framework where
I get pulled deliberately back into the process.

That matters to me a lot.

I don't want agentic coding to mean pressing Enter and waiting for software to
appear. I still want to understand the code. I still want to make decisions.
Sometimes, I still want to write the tricky part myself. I want the speed and
leverage that agents provide without completely giving up the joy (and
occasionally the sweat) of actually coding.

That's probably the part of S.T.A.N.D.A.R.D.S. I value most.

So, is S.T.A.N.D.A.R.D.S. the right framework for you?

Probably not in every case. And if you're a die-hard holdout who still refuses
to use coding agents, then I would love to meet you one day and buy you a cup of
☕.

There are plenty of other approaches to working with coding agents. Some are
lighter-weight. Some are cheaper. Some may fit your workflow better. They all
come with their own tradeoffs, and ultimately the choice is yours.

And if you're just vibe coding something over the weekend?

You probably don't need to code with standards. 😉
