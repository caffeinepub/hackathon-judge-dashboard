# Hackathon Judge Dashboard

## Current State
- Full-stack hackathon scoring app with leaderboard, teams management, and scoring modals
- Backend `addTeam` and `deleteTeam` require admin role -- blocks non-admin users from adding teams
- No bulk/spreadsheet import feature for teams
- Frontend shows "Add Team" button to everyone but the call fails for non-admins

## Requested Changes (Diff)

### Add
- `addTeams(names: [Text])` backend function (no auth restriction) for bulk team addition
- "Import from Spreadsheet" button in TeamsPage header that opens a dialog
- Spreadsheet import dialog: textarea where user pastes team names (one per line or comma-separated), previews parsed names, then submits all at once

### Modify
- Backend `addTeam(name, description)`: remove admin restriction so any caller can add a team
- Backend `deleteTeam`: keep admin-only restriction (admin can still delete)
- TeamsPage: show a second import button alongside "Add Team"

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo`: remove `admin` permission check from `addTeam`; add `addTeams` bulk function (no auth restriction) that loops and adds multiple teams by name
2. Regenerate backend bindings
3. Update `useQueries.ts`: add `useAddTeams` mutation calling `addTeams`
4. Create `ImportTeamsDialog.tsx`: textarea input, parse names on newline/comma, preview list, submit via `useAddTeams`
5. Update `TeamsPage.tsx`: add import button + wire `ImportTeamsDialog`
