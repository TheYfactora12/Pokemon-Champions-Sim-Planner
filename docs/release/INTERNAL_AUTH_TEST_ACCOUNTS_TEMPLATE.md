# Internal Auth Test Accounts Template

Purpose:

- test free vs premium separation
- test saved profile memory
- test cross-account isolation
- test cross-device restore

Rule:

- never hardcode these credentials in frontend code
- store real credentials in the team password manager, not this file

## Minimum MVP account set

### 1. Guest / anonymous

- no login
- expected access: free local only
- expected persistence: none beyond browser-local cache

### 2. Internal free account

- label: `internal_free_01`
- email alias: `TBD`
- role/tier: `free`
- expected access:
  - sign in
  - team identity tied to `user_id`
  - no premium saved-memory claims

### 3. Internal premium account

- label: `internal_premium_01`
- email alias: `TBD`
- role/tier: `premium`
- expected access:
  - signed-in profile memory
  - saved team profiles
  - replay history
  - team-version continuity

### 4. QA / admin account

- label: `internal_qa_admin_01`
- email alias: `TBD`
- role/tier: `premium` or `qa_admin`
- expected access:
  - regression and isolation testing
  - manual verification of account switching

### 5. Cross-device persistence account

- label: `internal_cross_device_01`
- email alias: `TBD`
- role/tier: `premium`
- expected access:
  - same saved history visible across two browsers/devices

### 6. Optional community opt-in account

- label: `internal_community_optin_01`
- email alias: `TBD`
- role/tier: `premium`
- expected access:
  - community sharing toggle enabled
  - aggregate-only testing

## Required test checklist

1. Sign in as free account:
- verify auth state renders
- verify `user_id` scoping exists
- verify no premium continuity overclaim

2. Sign in as premium account:
- save profile-backed team memory
- save replay-derived history
- verify Sources shows durable profile path

3. Switch accounts:
- verify no cross-account saved history leakage
- verify prior profile data disappears when unauthorized

4. Cross-device:
- verify premium saved memory restores on second browser/device

5. Guest fallback:
- sign out
- verify free mode still works
- verify paid history is not exposed

## Role metadata recommendation

Use trusted Supabase `app_metadata` only:

```json
{
  "subscription_tier": "free"
}
```

or

```json
{
  "subscription_tier": "premium"
}
```

Do not use `user_metadata` to grant premium.
`user_metadata` is client-controlled and should not unlock paid access.

The app should treat unknown values as `free`.
