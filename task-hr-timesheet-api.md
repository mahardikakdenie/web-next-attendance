# Backend Task: High-Scale HR Timesheet Monitoring API

## 📌 Context
To support organizations with 100+ employees, we are shifting the **HR Monitoring** UI to a **"Master-Detail"** pattern. 
1. HR will see a **Sidebar Member Directory** with search/pagination.
2. Analytics will be aggregated at the organization level by default.
3. Clicking a member will trigger a targeted fetch for that specific employee's logs.

## 🎯 Required API Endpoints

### 1. `GET /v1/users` (ENHANCEMENT)
**Description:** Ensure this existing endpoint supports efficient pagination and name searching for the Sidebar Directory.
**Query Parameters:**
- `page` (optional)
- `limit` (optional, recommended: 100 for directory)
- `search` (optional) - Filter by name.

### 2. `GET /v1/timesheet/monitoring` (REFINED)
**Description:** This endpoint will now primarily be used to fetch the work logs of **ONE specific user** at a time once they are selected in the UI.
**Targeted Query:** `GET /v1/timesheet/monitoring?user_id=5&start_date=...&end_date=...`

### 3. `GET /v1/timesheet/analytics` (ORG-WIDE)
**Description:** Must return aggregate data for the entire organization if `user_id` is not provided.
**Expected Response:**
```json
{
  "data": {
    "total_hours": 4500,
    "active_employees": 120,
    "project_distribution": [
       { "project_name": "Project X", "total_hours": 1200, "percentage": 26.6 },
       { "project_name": "Internal", "total_hours": 800, "percentage": 17.7 }
    ]
  }
}
```

---

## 🛠️ Performance Requirements
- **Indexing:** Ensure `user_id`, `tenant_id`, and `date` columns in the `timesheet_entries` table are indexed to handle 10k+ rows efficiently.
- **Aggregation:** Use database `SUM()` and `COUNT()` for analytics rather than processing arrays in memory.
- **Scoping:** Strictly enforce `tenant_id` scoping to prevent data leakage between organizations.
