# [BE] Project Management API Implementation

## 📝 Overview
Implement a backend suite to manage "Projects". These projects will be used for resource allocation, client billing tracking, and timesheet associations.

## 🛠 Technical Requirements

### 1. Database Schema

#### Table: `projects`
- `id`: Auto-increment / UUID
- `tenant_id`: BigInt (Foreign Key to tenants)
- `name`: String (Project Name)
- `client_name`: String
- `description`: Text (Optional)
- `start_date`: Date
- `end_date`: Date (Optional)
- `status`: Enum (`ACTIVE`, `COMPLETED`, `ON_HOLD`)
- `budget`: Decimal (Optional)
- `created_at` / `updated_at`: Timestamps

#### Table: `project_members` (Team Allocation)
- `project_id`: Foreign Key
- `user_id`: Foreign Key
- `role`: String (e.g., "Lead", "Member")
- `allocated_hours`: Integer (Optional)

### 2. API Endpoints

#### A. Project CRUD
- **List Projects:** `GET /api/v1/projects`
    - Filter by: `status`, `search` (name/client).
    - Scope: Must only return projects belonging to the user's `tenant_id`.
- **Create Project:** `POST /api/v1/projects`
- **Update Project:** `PUT /api/v1/projects/:id`
- **Delete Project:** `DELETE /api/v1/projects/:id` (Soft delete recommended).

#### B. Member Management
- **Assign Members:** `POST /api/v1/projects/:id/members`
- **Remove Member:** `DELETE /api/v1/projects/:id/members/:user_id`
- **Get Members:** `GET /api/v1/projects/:id/members`

### 3. Business Logic
- **Access Control:** 
    - `user.view`: View projects.
    - `project.manage`: Create/Update/Delete projects.
- **Auto-Status:** If `end_date` has passed, provide an optional mechanism to suggest status as `COMPLETED`.

## ✅ Acceptance Criteria
- [ ] Admins can create and manage project timelines and clients.
- [ ] Employees can be assigned to projects (team mapping).
- [ ] API responses match the frontend `Project` type in `src/types/api.ts`.
- [ ] Performance: Search should be indexed on `name` and `client_name`.
