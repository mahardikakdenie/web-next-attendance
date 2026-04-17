untuk code di src\components\dashboard-user\ClockCard.tsx, bisa ga di optimasi dan refactor dalam fetching user information nya Gunakan 
const {user} = useAuthStore(); 

karena response nya 

{
    "data": {
        "id": 2,
        "name": "Admin PT Friendship",
        "email": "admin@friendship.com",
        "role": {
            "id": 2,
            "name": "admin",
            "description": "Tenant Owner / Administrator",
            "base_role": "ADMIN",
            "is_system": true
        },
        "position_id": 1,
        "position_name": "",
        "tenant_id": 2,
        "employee_id": "ADM-001",
        "department": "Owner",
        "address": "Friendship Office",
        "media_url": "",
        "phone_number": "0811111111",
        "manager_id": null,
        "delegate_id": null,
        "created_at": "2026-04-12T00:44:53.175161+07:00",
        "base_role": "ADMIN",
        "permissions": [
            "attendance.view",
            "attendance.create",
            "attendance.edit",
            "attendance.delete",
            "attendance.export",
            "leave.view",
            "leave.create",
            "leave.approve",
            "leave.reject",
            "overtime.view",
            "overtime.create",
            "overtime.approve",
            "payroll.view",
            "payroll.calculate",
            "payroll.approve",
            "user.view",
            "user.create",
            "user.edit",
            "user.delete",
            "tenant.view",
            "tenant.edit",
            "role.view",
            "role.manage",
            "support.manage"
        ],
        "is_owner": true,
        "tenant": {
            "id": 2,
            "name": "PT Friendship Logistics",
            "tenant_settings": {
                "id": 2,
                "tenant_id": 2,
                "tenant": {
                    "ID": 0,
                    "Name": "",
                    "Code": "",
                    "Plan": "",
                    "CreatedAt": "0001-01-01T00:00:00Z",
                    "UpdatedAt": "0001-01-01T00:00:00Z"
                },
                "office_latitude": -6.2924299,
                "office_longitude": 106.8485303,
                "max_radius_meter": 100,
                "allow_remote": false,
                "require_location": true,
                "clock_in_start_time": "00:00",
                "clock_in_end_time": "00:00",
                "late_after_minute": 480,
                "clock_out_start_time": "17:00",
                "clock_out_end_time": "23:59",
                "require_selfie": true,
                "allow_multiple_check": false,
                "tenant_logo": "https://naraworld.com/assets/img/Logo%20Nara.png",
                "created_at": "2026-04-12T00:44:53.190914+07:00",
                "updated_at": "2026-04-12T21:36:24.573596+07:00"
            }
        },
        "tenant_setting": {
            "id": 2,
            "tenant_id": 2,
            "tenant": {
                "ID": 0,
                "Name": "",
                "Code": "",
                "Plan": "",
                "CreatedAt": "0001-01-01T00:00:00Z",
                "UpdatedAt": "0001-01-01T00:00:00Z"
            },
            "office_latitude": -6.2924299,
            "office_longitude": 106.8485303,
            "max_radius_meter": 100,
            "allow_remote": false,
            "require_location": true,
            "clock_in_start_time": "00:00",
            "clock_in_end_time": "00:00",
            "late_after_minute": 480,
            "clock_out_start_time": "17:00",
            "clock_out_end_time": "23:59",
            "require_selfie": true,
            "allow_multiple_check": false,
            "tenant_logo": "https://naraworld.com/assets/img/Logo%20Nara.png",
            "created_at": "2026-04-12T00:44:53.190914+07:00",
            "updated_at": "2026-04-12T21:36:24.573596+07:00"
        },
        "shift": {
            "id": "00000000-0000-0000-0000-000000000000",
            "name": "Sedang Cuti",
            "startTime": "00:00",
            "endTime": "23:59",
            "type": "Morning",
            "color": "bg-orange-500",
            "isDefault": false
        },
        "attendances": [
            {
                "id": "89db3262-0ddd-4481-8a85-107f76785ab8",
                "user_id": 2,
                "clock_in_time": "2026-04-12T03:31:04.256666+07:00",
                "clock_out_time": "2026-04-12T21:36:46.678776+07:00",
                "clock_in_latitude": -6.29243,
                "clock_in_longitude": 106.84853,
                "clock_out_latitude": -6.292366,
                "clock_out_longitude": 106.848595,
                "clock_in_media_url": "https://i.ibb.co.com/V0fPVGgb/attendance-1775939458785.png",
                "clock_out_media_url": "https://i.ibb.co.com/JwTZZwb4/attendance-1776004601380.png",
                "status": "done",
                "created_at": "2026-04-12T03:31:04.256666+07:00"
            }
        ],
        "recent_activities": [
            {
                "id": 4,
                "title": "Clocked in",
                "action": "Attendance",
                "status": "Late",
                "created_at": "2026-04-12T00:14:53.195504+07:00"
            },
            {
                "id": 14,
                "title": "User Login",
                "action": "Login",
                "status": "success",
                "created_at": "2026-04-12T03:30:15.87757+07:00"
            },
            {
                "id": 15,
                "title": "Attendance Clock In",
                "action": "ClockIn",
                "status": "success",
                "created_at": "2026-04-12T03:31:04.265049+07:00"
            },
            {
                "id": 16,
                "title": "User Logout",
                "action": "Logout",
                "status": "success",
                "created_at": "2026-04-12T04:50:36.44097+07:00"
            },
            {
                "id": 35,
                "title": "User Login",
                "action": "Login",
                "status": "success",
                "created_at": "2026-04-12T17:37:38.449763+07:00"
            },
            {
                "id": 36,
                "title": "User Logout",
                "action": "Logout",
                "status": "success",
                "created_at": "2026-04-12T18:36:07.697932+07:00"
            },
            {
                "id": 37,
                "title": "User Login",
                "action": "Login",
                "status": "success",
                "created_at": "2026-04-12T18:46:20.432377+07:00"
            },
            {
                "id": 38,
                "title": "User Logout",
                "action": "Logout",
                "status": "success",
                "created_at": "2026-04-12T20:55:25.997842+07:00"
            },
            {
                "id": 39,
                "title": "User Login",
                "action": "Login",
                "status": "success",
                "created_at": "2026-04-12T20:55:47.829485+07:00"
            },
            {
                "id": 40,
                "title": "Attendance Clock Out",
                "action": "ClockOut",
                "status": "success",
                "created_at": "2026-04-12T21:36:46.697+07:00"
            },
            {
                "id": 41,
                "title": "User Logout",
                "action": "Logout",
                "status": "success",
                "created_at": "2026-04-12T23:51:17.80323+07:00"
            },
            {
                "id": 44,
                "title": "User Login",
                "action": "Login",
                "status": "success",
                "created_at": "2026-04-12T23:54:55.38136+07:00"
            },
            {
                "id": 45,
                "title": "User Management",
                "action": "Created new user: kucing (HR-004)",
                "status": "success",
                "created_at": "2026-04-12T23:57:05.299001+07:00"
            },
            {
                "id": 46,
                "title": "User Logout",
                "action": "Logout",
                "status": "success",
                "created_at": "2026-04-13T00:02:37.521724+07:00"
            },
            {
                "id": 70,
                "title": "User Login",
                "action": "Login",
                "status": "success",
                "created_at": "2026-04-14T14:29:26.979049+07:00"
            },
            {
                "id": 71,
                "title": "User Logout",
                "action": "Logout",
                "status": "success",
                "created_at": "2026-04-14T15:51:46.38699+07:00"
            },
            {
                "id": 72,
                "title": "User Login",
                "action": "Login",
                "status": "success",
                "created_at": "2026-04-14T16:00:27.370759+07:00"
            },
            {
                "id": 73,
                "title": "Requested Annual Leave for 8 days",
                "action": "Leave Request",
                "status": "Pending",
                "created_at": "2026-04-14T16:03:41.429758+07:00"
            },
            {
                "id": 74,
                "title": "Leave Approval",
                "action": "Approved leave for Admin PT Friendship",
                "status": "success",
                "created_at": "2026-04-14T16:04:03.170715+07:00"
            },
            {
                "id": 75,
                "title": "Leave Approved",
                "action": "Your Annual Leave request was approved",
                "status": "success",
                "created_at": "2026-04-14T16:04:03.172375+07:00"
            },
            {
                "id": 76,
                "title": "User Logout",
                "action": "Logout",
                "status": "success",
                "created_at": "2026-04-14T16:37:59.491126+07:00"
            },
            {
                "id": 77,
                "title": "User Login",
                "action": "Login",
                "status": "success",
                "created_at": "2026-04-14T18:03:38.987249+07:00"
            },
            {
                "id": 78,
                "title": "User Logout",
                "action": "Logout",
                "status": "success",
                "created_at": "2026-04-14T18:23:19.325097+07:00"
            },
            {
                "id": 81,
                "title": "User Login",
                "action": "Login",
                "status": "success",
                "created_at": "2026-04-14T21:04:08.475492+07:00"
            },
            {
                "id": 82,
                "title": "User Logout",
                "action": "Logout",
                "status": "success",
                "created_at": "2026-04-15T01:24:08.29396+07:00"
            },
            {
                "id": 85,
                "title": "User Login",
                "action": "Login",
                "status": "success",
                "created_at": "2026-04-15T01:27:20.169369+07:00"
            },
            {
                "id": 86,
                "title": "User Logout",
                "action": "Logout",
                "status": "success",
                "created_at": "2026-04-15T02:01:24.331783+07:00"
            },
            {
                "id": 88,
                "title": "User Login",
                "action": "Login",
                "status": "success",
                "created_at": "2026-04-15T02:06:13.999712+07:00"
            },
            {
                "id": 89,
                "title": "User Logout",
                "action": "Logout",
                "status": "success",
                "created_at": "2026-04-15T03:39:34.686921+07:00"
            },
            {
                "id": 91,
                "title": "User Login",
                "action": "Login",
                "status": "success",
                "created_at": "2026-04-16T17:45:10.639232+07:00"
            }
        ]
    },
    "includes": [
        "tenant",
        "tenant.tenant_settings",
        "attendances",
        "role",
        "recent_activities",
        "role.permissions",
        "tenant_setting"
    ]
}

check dulu jika shift nya itu work_shift_tenant makan ambil data dari tenant_setting, jika datanya itu buka "work_shift_tenant", maka ambil start_date dan end_date nya dari data shift, untuk kondisi ini shift nya bukan work_shift_tenant berarti ambil dari shift
