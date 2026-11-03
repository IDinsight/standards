# The quiet pager

*Originally posted on the team wiki in March 2024. Kept for history; some of
the tooling it mentions has since been replaced.*

A pager that goes off every night teaches people to ignore it. We learned that
the slow way during the first winter of the admin tool, when a dozen alerts
fired for every deploy and the person on call stopped reading past the
subject line.

Since then we have tried to follow a few habits.

**Page only for things a user would notice.** If nobody outside the team can
tell that something is wrong, it can wait for the morning. Dashboards are for
curiosity; pages are for people who are blocked.

**Every page gets an owner and a note.** Whoever is woken up writes two or
three sentences before going back to sleep: what fired, what they did, and
what they would like someone to look at in daylight. Those notes have been
worth more than any monitoring tool we bought.

**Rotate weekly and hand over in person.** A short call on Monday morning
between the outgoing and incoming person catches the things that never make it
into tickets.

**Review without blame.** When something goes badly, we ask what made the
mistake easy to make, not who made it. The answer is almost always a missing
guard rail, a confusing message, or a step that only one person knew about.

**Delete alerts that never lead to action.** Once a quarter we go through the
list and remove anything that fired without anyone needing to do something.
It is uncomfortable every time and it has never been a mistake.

None of this is new. It is mostly what other teams told us when we asked, and
it has made being on call something people volunteer for instead of dread.
