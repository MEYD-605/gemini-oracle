---
name: tdd
description: '[engineering] E-SKLL | Test-driven development — red-green-refactor via vertical slices. Use when building features or fixing bugs test-first, user says "tdd", "red-green-refactor", or wants integration tests. Source: utarn/engineer-skills.'
origin: utarn/engineer-skills
---

# /tdd — Test-Driven Development

## Philosophy

Tests verify **behavior through public interfaces**, not implementation details. Good tests survive refactors.

See `references/tests.md`, `references/mocking.md`, `references/refactoring.md`.

## Anti-pattern: horizontal slices

**WRONG**: write all tests, then all code.
**RIGHT**: vertical tracer bullets — one test → minimal code → repeat.

## Workflow

### 1. Plan (confirm with Bo)

- What interface changes?
- Which behaviors to test (prioritized)?
- Deep modules? → use `/codebase-design` vocabulary
- Get approval before coding

### 2. Tracer bullet

```
RED:   one test → fails
GREEN: minimal code → passes
```

### 3. Incremental loop

One test at a time. No speculative features.

### 4. Refactor

Only when GREEN. Run tests after each refactor step.

## Per-cycle checklist

- [ ] Test describes behavior, not implementation
- [ ] Uses public interface only
- [ ] Would survive internal refactor
- [ ] Code minimal for this test only

## maclab

- Use `rtk` for test output (`rtk test`, project-native runner)
- Survey repo test setup before assuming framework