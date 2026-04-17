import { secureRequest } from "@/lib/axios";
import { APIResponse } from "@/types/api";

export type EventCategory = "OFFICE_CLOSED" | "INFORMATION";

export interface CalendarEvent {
  id: string;
  date: string;
  name: string;
  type: string; // e.g., "Holiday", "Meeting", etc.
  category: EventCategory;
  description?: string;
  is_paid: boolean;
  is_all_users: boolean;
  user_ids?: number[];
}

/**
 * Calendar Events Service (formerly Holiday Calendar)
 */
export const getCalendarEvents = async (year: number) => {
  return secureRequest<APIResponse<CalendarEvent[]>>("get", `/v1/hr/calendar`, undefined, {
    params: { year }
  });
};

export const createCalendarEvent = async (data: Partial<CalendarEvent>) => {
  return secureRequest<APIResponse<CalendarEvent>>("post", "/v1/hr/calendar", data);
};

export const updateCalendarEvent = async (id: string, data: Partial<CalendarEvent>) => {
  return secureRequest<APIResponse<CalendarEvent>>("put", `/v1/hr/calendar/${id}`, data);
};

export const deleteCalendarEvent = async (id: string) => {
  return secureRequest<APIResponse<null>>("delete", `/v1/hr/calendar/${id}`);
};

// Backwards compatibility aliases (optional, but good for migration)
export const getHolidays = getCalendarEvents;
export const createHoliday = createCalendarEvent;
export const updateHoliday = updateCalendarEvent;
export const deleteHoliday = deleteCalendarEvent;
export type Holiday = CalendarEvent;
