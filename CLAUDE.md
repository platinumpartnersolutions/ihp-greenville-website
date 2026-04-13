# Claude Code Instructions — IHP Greenville Website

## ⚠️ MANDATORY: Read MASTERMIND.md before every response

Before answering any question or making any change, read `MASTERMIND.md` in this project root. It contains:
- The most recent task and what was done
- All hard-learned lessons and rules
- Complete architecture overview
- All known issues (resolved and active)
- Progress tracker

## 🔴 NON-NEGOTIABLE: Update MASTERMIND.md after EVERY task

**This is not optional. After completing ANY task — no matter how small — you MUST update `MASTERMIND.md` before considering the task done:**

1. Add a new entry at the top of `## 🎯 MOST RECENT TASK` with:
   - What the task was
   - Root cause (if a bug fix)
   - Exactly what was changed and in which files
   - Current status (✅ Complete / 🔲 In Progress)
2. Update `## 📈 PROGRESS TRACKER` — move completed items to ✅, add new planned items
3. Update `Last updated:` date at the top to today's date
4. Add any new lessons, gotchas, or rules to `## 🐛 KNOWN ISSUES & HARD-LEARNED LESSONS`

**If you finish a task without updating MASTERMIND.md, you have not finished the task.**

## Build Command
```
npx tsx script/generate-static.ts
```
Run from project root. Outputs 325 files to `dist/`. Always run and verify before committing.

## Deploy
Git push to `main` → Netlify auto-deploys.
