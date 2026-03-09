# Hackathon Judge Dashboard

## Current State
A full-stack hackathon judging dashboard with:
- Backend: Teams, Round1Score, Round2Score stored in stable Maps. `getLeaderboard()` returns `LeaderboardEntry` with only totals (round1Total, round2Total, combinedTotal) — individual per-criteria scores are NOT included.
- Frontend: Leaderboard page with Download CSV button that tries to access `round1Score` and `round2Score` on each entry, but those fields don't exist on `LeaderboardEntry` — so CSV always shows 0s for individual criteria.
- Teams page: add/import/delete/score teams.
- ScoreModal: sliders for all 10 criteria across 2 rounds.
- Authorization component included.

## Requested Changes (Diff)

### Add
- `round1Score: ?Round1Score` and `round2Score: ?Round2Score` fields to the `LeaderboardEntry` type in the backend, so individual criteria scores are available.
- Update `getLeaderboard()` to populate these fields from `round1Scores` and `round2Scores` maps.

### Modify
- `LeaderboardEntry` type: add optional round1Score and round2Score fields alongside the existing totals.
- Frontend `LeaderboardPage.tsx`: update `downloadCSV` to use the actual `round1Score` and `round2Score` from each leaderboard entry (they now exist on the type). Also add a "Details" expandable row or tooltip showing individual criteria breakdown.
- Frontend `LeaderboardPage.tsx`: the leaderboard table should show individual score columns for each criterion (all 10 criteria) so judges can see the breakdown at a glance.

### Remove
- Nothing removed.

## Implementation Plan
1. Regenerate backend with updated `LeaderboardEntry` type that includes `round1Score: ?Round1Score` and `round2Score: ?Round2Score`.
2. Update `LeaderboardPage.tsx`:
   - Fix `downloadCSV` to use `entry.round1Score` and `entry.round2Score` (now typed correctly).
   - Expand the leaderboard table to show all individual criteria columns (R1: Problem Understanding, Innovation, System Design, Prototype Progress, Team Explanation; R2: Final Prototype, Technical Complexity, Functionality, UI/UX, Real-world Impact) with the totals and combined total.
   - Make the table horizontally scrollable for smaller screens.
