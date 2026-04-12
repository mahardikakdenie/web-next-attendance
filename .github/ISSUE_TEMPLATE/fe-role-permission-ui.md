---
name: "🎨 [FE] UI/UX: Role Management & Permission Matrix"
about: Desain dan implementasi antarmuka untuk manajemen jabatan (Role) dan pemetaan izin (Permission Mapping).
title: "[FE] Pembuatan UI Dashboard Role & Permission"
labels: frontend, ui/ux, security
assignees: ''
---

# 🎨 Role & Permission Management UI

Tujuan task ini adalah membangun dashboard manajemen akses yang intuitif, bersih, dan fungsional. Admin harus bisa membuat jabatan baru dan mencentang izin apa saja yang diberikan.

---

## 🖼️ 1. Layout Concept: Role Dashboard
- [x] **Role List**: Clean side-list with instant search and role badges.
- [x] **Role Card Details**: Display name, description, and base role.
- [x] **Actions**: Edit, Delete, and Manage Hierarchy.

---

## 🔐 2. Permission Matrix (The Grid)
- [x] **Categorized Checkbox Grid**: Grouped by modules (Attendance, Payroll, User, Analytics, Support).
- [x] **Dynamic Toggling**: Real-time UI updates with permission switches.
- [x] **System Lock**: Non-editable system roles for safety.

---

## 🌳 3. Hierarchy Builder (The Tree)
- [x] **Visual Tree Representation**: Show parent-child reporting lines.
- [x] **Dynamic Assigment**: Toggle available roles as subordinates.
- [x] **Bulk Save**: Persist hierarchy changes to backend.

---

## 📡 4. API Data Mapping (The Payload)
- [x] **Create/Update Role**: Integrated with `POST/PUT /api/v1/tenant-roles`.
- [x] **Save Hierarchy**: Integrated with `POST /api/v1/tenant-roles/hierarchy`.
- [x] **Role Deletion**: Integrated with `DELETE /api/v1/tenant-roles/{id}`.

---

## 🛠️ 5. Functional Requirements
- [x] **Search & Filter**: Real-time role name searching.
- [x] **Form Validation**: Minimum characters and required field checks.
- [x] **Loading States**: Skeletons and spinners for heavy transactions.
- [x] **Feedback**: Beautiful `sonner` toast notifications.

---
**Focus Scope**: ✅ Role Management | ✅ Permission Matrix | ✅ Hierarchy Tree
**Target API**: `/api/v1/tenant-roles`
**Status**: ✅ FRONTEND IMPLEMENTATION COMPLETE
