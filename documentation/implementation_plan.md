# Implementation Plan - Adopting Badge Schema in UI

Implement a dedicated `BadgeService` in the frontend to manage badge data, backed by a new API endpoint.

## User Review Required

> [!NOTE]
> **New Service**: `BadgeService` will be created in `shared/services`.
> **New Endpoint**: `GET /api/badges` will be added to the backend.

## Proposed Changes

### Backend

#### [NEW] [badges.py](file:///c:/Users/Ram/dev/acharya/habit-buddy/backend/app/routers/badges.py)
- Create a new router `routers/badges.py`.
- Endpoint: `GET /` (mapped to `/api/badges`)
- Returns: List of `Badge` (ordered by ID or Days).
- Access: Authenticated (consistent with other endpoints).

#### [MODIFY] [main.py](file:///c:/Users/Ram/dev/acharya/habit-buddy/backend/main.py)
- Include `badges_router`.

### Frontend

#### [MODIFY] [habit.model.ts](file:///c:/Users/Ram/dev/acharya/habit-buddy/projects/habit-buddy/src/app/shared/models/habit.model.ts)
- Update `HabitBadge`.
- Define `Badge` interface matching backend.

#### [MODIFY] [api.service.ts](file:///c:/Users/Ram/dev/acharya/habit-buddy/projects/habit-buddy/src/app/shared/services/api.service.ts)
- Add `getBadges(): Observable<Badge[]>`

#### [NEW] [badge.service.ts](file:///c:/Users/Ram/dev/acharya/habit-buddy/projects/habit-buddy/src/app/shared/services/badge.service.ts)
- `getBadges()`: Returns `Observable<Badge[]>`. caching result.
- `get(id: number)`: Returns specific badge.

## Verification Plan
1.  Verify backend endpoint `/api/badges` returns the list.
2.  Verify `BadgeService` caches data.
