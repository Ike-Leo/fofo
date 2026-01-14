# Ralph Agent Instructions

You are an autonomous coding agent working on the **UCCP (Universal Commerce Control Platform)** project.

## Project Context

- **Stack**: Next.js 16 + Convex + Convex Auth + Tailwind CSS + TypeScript
- **Project Root**: The main application code is in `my-app/`
- **Convex Functions**: Located in `my-app/convex/`
- **Frontend**: Located in `my-app/app/`
- **Backend Philosophy**: Follow `ultrathink.md` principles (Resilient Simplicity, Ecosystem Discipline)

## Your Task

1. Read the PRD at `scripts/ralph/prd.json`
2. Read the progress log at `scripts/ralph/progress.txt` (check Codebase Patterns section first)
3. Check you're on the correct branch from PRD `branchName`. If not, check it out or create from main.
4. Pick the **highest priority** user story where `passes: false`
5. Implement that single user story
6. Run quality checks (see below)
7. Update AGENTS.md files if you discover reusable patterns
8. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
9. Update the PRD to set `passes: true` for the completed story
10. Append your progress to `scripts/ralph/progress.txt`

## Quality Checks (MUST PASS)

Run these from the `my-app/` directory:

```bash
# TypeScript check
cd my-app && npm run typecheck

# If typecheck script doesn't exist, use:
cd my-app && npx tsc --noEmit

# Lint check
cd my-app && npm run lint
```

For Convex functions, ensure the dev server can start without errors:
```bash
cd my-app && npx convex dev --once
```

## Progress Report Format

APPEND to `scripts/ralph/progress.txt` (never replace, always append):
```
## [Date/Time] - [Story ID]
Thread: https://antigravity.dev/threads/$CURRENT_THREAD_ID
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered (e.g., "this codebase uses X for Y")
  - Gotchas encountered (e.g., "don't forget to update Z when changing W")
  - Useful context (e.g., "Convex schema is in my-app/convex/schema.ts")
---
```

The learnings section is critical - it helps future iterations avoid repeating mistakes.

## Consolidate Patterns

If you discover a **reusable pattern**, add it to the `## Codebase Patterns` section at the TOP of progress.txt:

```
## Codebase Patterns
- Convex schema is in `my-app/convex/schema.ts`
- Use `v.id("tableName")` for foreign key references in Convex
- Auth helpers should go in `my-app/convex/helpers/auth.ts`
- Always use `getAuthUserId(ctx)` from `@convex-dev/auth/server` for auth checks
- Frontend components go in `my-app/components/`
- Use `useQuery` and `useMutation` from `convex/react` for data
```

## Convex-Specific Patterns

### Schema Changes
- Schema is in `my-app/convex/schema.ts`
- Use `defineTable` and `defineSchema` from `convex/server`
- Use `v` validators from `convex/values`
- Add indexes with `.index("by_field", ["field"])` for query performance

### Queries & Mutations
- Export functions from separate files (e.g., `organizations.ts`, `organizationMembers.ts`)
- Use `query` and `mutation` from `./_generated/server`
- Access database via `ctx.db`
- For auth: `import { getAuthUserId } from "@convex-dev/auth/server"`

### Frontend Data Fetching
- Use `useQuery(api.moduleName.functionName, { args })` for real-time data
- Use `useMutation(api.moduleName.functionName)` for mutations
- Queries auto-update when data changes (real-time by default)

## Update AGENTS.md Files

Before committing, check if edited files have learnings worth preserving:

1. Check for existing AGENTS.md in modified directories
2. Add valuable learnings for future developers/agents:
   - Convex patterns or conventions
   - Auth/authorization requirements
   - Component dependencies

## Browser Testing (Required for Frontend Stories)

For any story that changes UI, you MUST verify it works:

1. Ensure dev server is running: `cd my-app && npm run dev`
2. Navigate to the relevant page (default: http://localhost:3000)
3. Verify the UI changes work as expected
4. Use the dev-browser skill for visual verification

A frontend story is NOT complete until browser verification passes.

## Stop Condition

After completing a user story, check if ALL stories have `passes: true`.

If ALL stories are complete and passing, reply with:
<promise>COMPLETE</promise>

If there are still stories with `passes: false`, end your response normally.

## Important

- Work on ONE story per iteration
- Commit frequently
- Keep all quality checks green
- Read the Codebase Patterns section in progress.txt before starting
- Follow the `ultrathink.md` principles for backend architecture decisions
