# AGENTS.md

## Debugging & Failure Memory Protocol

### Core Principle

When debugging a bug or error, do not guess, loop, or claim success without evidence.
Treat every debugging attempt as an experiment.

The goal is to: reproduce → identify root cause → fix → verify → preserve result.

---

## 1. Reproduce Before Fixing

Before modifying source code:
1. Reproduce the reported problem.
2. Capture exact error messages, stack traces, failing behavior.
3. Identify where the failure occurs.
4. Form a specific hypothesis about root cause.

Do not modify code based solely on assumptions.

---

## 2. One Hypothesis Per Attempt

Each debugging attempt tests ONE primary hypothesis:
1. State the hypothesis and evidence supporting it.
2. Make the smallest change necessary to test it.
3. Run the relevant verification.
4. Record the actual result.

Do not make multiple unrelated changes at the same time.

---

## 3. DEBUG_LOG.md Is Mandatory Failure Memory

`DEBUG_LOG.md` is the persistent record of all debugging attempts.

**Before EVERY debugging attempt:** Read `DEBUG_LOG.md` and check if the proposed approach has already been tried.

**After EVERY failed debugging attempt:** Immediately update `DEBUG_LOG.md` — do NOT modify code further until the failure is recorded.

**Format:**
```
## Attempt #N
Date:
Problem:
Hypothesis:
Evidence supporting hypothesis:
Changes made:
Verification performed:
Result: FAILED / SUCCESS
Why it failed / Why it worked:
What this failure rules out:
New evidence discovered:
```

Keep all previous attempts. Failures are evidence and must be preserved.

---

## 4. Never Repeat a Failed Approach Without New Evidence

Do NOT retry an approach that already failed merely because: wording changed, code was rearranged, or "it should work this time."

Retry only when NEW evidence provides a specific reason the previous attempt failed for a different reason.

---

## 5. Do Not Confuse Symptoms With Root Cause

Do not consider a bug fixed merely because: the app starts, an error disappears, the UI looks correct temporarily, an exception is suppressed, or the code looks correct.

Fix the underlying cause, not the symptom.

---

## 6. Never Hide Errors

Do not solve bugs by hiding symptoms. Do not: suppress exceptions, add empty `catch` blocks, weaken checks, or bypass safeguards merely to make the app appear successful.

---

## 7. Verification Is Mandatory

A code change is NOT successful until verified. Proof requires an actual verification result — not "the code looks correct."

Run the most relevant verification: reproduction steps, build, type check, or integration test.

---

## 8. Stop After Three Consecutive Failures

If three consecutive attempts fail: STOP. Do not continue modifying code randomly.

Enter **INVESTIGATION MODE:**
1. Read all of `DEBUG_LOG.md`.
2. Summarize all attempts and what they rule out.
3. Identify what information is still missing.
4. Gather that information before making another code change.

---

## 9. Maintain Explicit Debugging State

At all times, know:
```
CURRENT PROBLEM: (exact failing behavior)
LAST KNOWN GOOD STATE: (what worked before)
CURRENT HYPOTHESIS: (what is believed to be causing it)
FAILED APPROACHES: (what has already been tried and ruled out)
NEXT TEST: (specific test to distinguish remaining hypotheses)
```

---

## 10. Minimize Changes

Prefer the smallest change capable of fixing the suspected root cause. Do not perform broad refactoring while investigating an unrelated bug.

---

## 11. No Unsupported Success Claims

Never say "Fixed." or "Working now." unless verification has actually passed.
If not verified: state "The issue is not yet verified as fixed."

---

## 12. Preserve Success Memory

When a bug is successfully fixed, immediately record in `DEBUG_LOG.md`:
- Root cause (confirmed by evidence)
- Final fix applied
- Why the fix works
- Verification performed
- Failed approaches ruled out
- Conditions under which the fix is valid

---

## 13. No Source Code Modification During Analysis

When the task is to **analyze and document** (not fix), do NOT modify application source code.

If a bug is encountered during analysis: record it in `DEBUG_LOG.md` and note it for future work, but do not start a debugging session.

---

## 14. Maintain CURRENT_TASK.md

Keep `CURRENT_TASK.md` up to date whenever work changes direction, a task is completed, or a new problem is discovered. This file gives any resuming session instant context without needing to re-read everything.
