# Claude Code Instructions — IHP Greenville Website

## ⚠️ MANDATORY: Read MASTERMIND.md before every response

Before answering any question or making any change, read `MASTERMIND.md` in this project root. It contains:
- The most recent task and what was done
- All hard-learned lessons and rules
- Complete architecture overview
- All known issues (resolved and active)
- Progress tracker

**After completing any task, update `MASTERMIND.md`:**
1. Add a new entry at the top of `## 🎯 MOST RECENT TASK`
2. Update the `## 📈 PROGRESS TRACKER` (move completed items to ✅, add new planned items)
3. Update `Last updated:` date at the top
4. Add any new lessons to `## 🐛 KNOWN ISSUES & HARD-LEARNED LESSONS`

## Build Command
```
npx tsx script/generate-static.ts
```
Run from project root. Outputs 325 files to `dist/`. Always run and verify before committing.

## Deploy
Git push to `main` → Netlify auto-deploys.
