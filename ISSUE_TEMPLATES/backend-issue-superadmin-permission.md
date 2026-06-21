---
title: "[BUG] `superadmin.access` Permission Missing from System Roles Capabilities API"
labels: ["backend", "bug", "security"]
assignees: []
---

## Description
The `superadmin.access` permission is not appearing in the frontend Capabilities Matrix (`/admin/platform-roles`). Because of this, platform administrators cannot toggle or remove this critical permission from system roles (like the `admin` role), which currently causes a massive security bypass.

## Root Cause Analysis
The issue lies in the `ListAllPermissions` function within `internal/service/superadmin_service.go`.

When the frontend calls the API (`/v1/superadmin/permissions?scope=system` or similar), the service applies a scope filter using hardcoded maps:
```go
	systemModules := map[string]bool{
		"tenant":       true,
		"subscription": true,
		"support":      true,
		"role":         true,
		"user":         true,
		"analytics":    true,
	}
```
In `role_seeder.go`, the permission `superadmin.access` is defined with `Module: "superadmin"`. 
However, the `"superadmin"` module key is missing from the `systemModules` map above. As a result, the loop silently filters it out:
```go
		// Apply scope filter
		if scope == "system" && !systemModules[p.Module] {
			continue // <--- superadmin.access is dropped here!
		}
```

## Acceptance Criteria
- [ ] Open `internal/service/superadmin_service.go`
- [ ] Add `"superadmin": true` into the `systemModules` map.
- [ ] Add `"superadmin": "Platform Administration"` (or similar) into the `moduleNames` mapping for better UI display.
- [ ] Verify that hitting `GET /v1/superadmin/permissions` (with system scope) now returns the `superadmin` module containing the `superadmin.access` permission.

## Proposed Code Fix
```go
	// In moduleNames map
	moduleNames := map[string]string{
        // ... existing
		"superadmin":   "Platform Administration",
	}

	// In systemModules map
	systemModules := map[string]bool{
        // ... existing
		"superadmin":   true,
	}
```
