# Database Schema Documentation

This document describes the database schema for the Habit Buddy application. The application uses **PostgreSQL** as the database backend and **SQLAlchemy** as the ORM.

## Overview

- **Database System**: PostgreSQL
- **ORM**: SQLAlchemy
- **Declarative Base**: Defined in `backend/app/database.py`

## Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ HABITS : "has"
    USERS ||--o{ CATEGORIES : "has"
    USERS ||--o{ USER_BADGES : "earns"
    CATEGORIES ||--o{ HABITS : "categorizes"
    HABITS ||--o{ CHECK_INS : "records"
    HABITS ||--|| REMINDERS : "has"
    BADGES ||--o{ USER_BADGES : "awarded_to"
    BADGES ||--o| BADGES : "next_level"

    USERS {
        string id PK "Firebase UID"
        string email "Unique, Indexed"
        string display_name "Nullable"
        string hashed_password "Nullable"
        string avatar_url "Nullable"
        string timezone "Default: UTC"
        bigint created_at
        bigint updated_at
    }

    CATEGORIES {
        string id PK
        string user_id FK "Nullable"
        string name
        string color
        string icon "Nullable"
        bigint created_at
    }

    HABITS {
        string id PK
        string user_id FK
        string category_id FK "Nullable"
        string title
        int days_target
        string color
        bigint created_at
        bigint updated_at
    }

    CHECK_INS {
        string id PK
        string habit_id FK
        bigint check_in_date
        enum status "completed, skipped, failed"
        text note "Nullable"
        bigint created_at
    }

    REMINDERS {
        string id PK
        string habit_id FK
        string time "HH:MM format"
        json days "Array of day numbers (0-6)"
        int window "Default: 30 min"
        boolean is_active "Default: True"
        bigint created_at
        bigint updated_at
    }

    BADGES {
        int id PK
        string slug "Unique, e.g., 'novice'"
        string name
        string description
        string icon
        int days_required
        int next_badge_id FK "Nullable, Self-Ref"
    }

    USER_BADGES {
        string id PK
        string user_id FK
        int badge_id FK
        bigint earned_at
    }
```

## Tables Definition

### 1. Users (`users`)
Stores user account information.
- **id** (`String`, PK): Firebase UID.
- **email** (`String`, Unique): User's email address.
- **display_name** (`String`): User's display name.
- **hashed_password** (`String`): For native auth (nullable).
- **avatar_url** (`String`): URL to user's avatar.
- **timezone** (`String`): User's timezone (default "UTC").
- **created_at** (`BigInteger`): Timestamp (ms).
- **updated_at** (`BigInteger`): Timestamp (ms).

### 2. Categories (`categories`)
Groups habits together.
- **id** (`String`, PK): Unique identifier.
- **user_id** (`String`, FK -> `users.id`): Owner of the category. Nullable for global categories.
- **name** (`String`): Category name.
- **color** (`String`): Hex color code.
- **icon** (`String`): Icon name/URL.
- **created_at** (`BigInteger`): Timestamp (ms).

### 3. Habits (`habits`)
The core entity representing habits to be tracked.
- **id** (`String`, PK): Unique identifier.
- **user_id** (`String`, FK -> `users.id`): Owner of the habit.
- **category_id** (`String`, FK -> `categories.id`): Associated category (nullable).
- **title** (`String`): Name of the habit.
- **days_target** (`Integer`): Target number of days.
- **color** (`String`): Hex color code.
- **created_at** (`BigInteger`): Timestamp (ms).
- **updated_at** (`BigInteger`): Timestamp (ms).

### 4. Check-Ins (`check_ins`)
Records daily progress for habits.
- **id** (`String`, PK): Unique identifier.
- **habit_id** (`String`, FK -> `habits.id`): The habit being checked in.
- **check_in_date** (`BigInteger`): Timestamp (ms) representing the date of check-in.
- **status** (`Enum`): 'completed', 'skipped', or 'failed'.
- **note** (`Text`): Optional note for the check-in.
- **created_at** (`BigInteger`): Timestamp (ms).

### 5. Reminders (`reminders`)
Configuration for habit notifications.
- **id** (`String`, PK): Unique identifier.
- **habit_id** (`String`, FK -> `habits.id`): The habit to remind for.
- **time** (`String`): Time in "HH:MM" format.
- **days** (`JSON`): List of days of the week (0-6) valid for the reminder.
- **window** (`Integer`): Notification window in minutes.
- **is_active** (`Boolean`): Toggle for the reminder.
- **created_at** (`BigInteger`): Timestamp (ms).
- **updated_at** (`BigInteger`): Timestamp (ms).

### 6. Badges (`badges`)
Gamification elements.
- **id** (`Integer`, PK): Unique numeric identifier.
- **slug** (`String`, Unique): Textual identifier for code mapping (e.g., 'novice').
- **name** (`String`): Badge name.
- **description** (`String`): Description of the achievement.
- **icon** (`String`): Icon identifier.
- **days_required** (`Integer`): Number of days required to earn this badge.
- **next_badge_id** (`Integer`, FK -> `badges.id`): Identifier of the following badge.

### 7. User Badges (`user_badges`)
Join table for Users and Badges to track earned achievements.
- **id** (`String`, PK): Unique identifier.
- **user_id** (`String`, FK -> `users.id`): The user who earned the badge.
- **badge_id** (`Integer`, FK -> `badges.id`): The badge earned.
- **earned_at** (`BigInteger`): Timestamp (ms).

## Data Types Note
- Timestamps are stored as `BigInteger` representing milliseconds since epoch to maintain consistency with frontend JavaScript dates.
- IDs are generally `String` (likely UUIDs), except for `users.id` which comes from Firebase, and `badges.id` which is Numeric.
