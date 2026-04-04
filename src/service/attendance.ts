export type AttendanceRecordPayload = {
  userId: string
  attendanceType: 'clock_in' | 'clock_out'
  clockAt: string
  latitude?: number
  longitude?: number
  note?: string
}

export type AttendanceRecordResponse<T = unknown> = {
  success: boolean
  message: string
  data: T
}

const ATTENDANCE_ENDPOINT = '/api/attendances/record'

export async function recordAttendances<T = unknown>(payload: AttendanceRecordPayload): Promise<AttendanceRecordResponse<T>> {
  const response = await fetch(ATTENDANCE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const json = (await response.json().catch(() => null)) as AttendanceRecordResponse<T> | null

  if (!response.ok) {
    throw new Error(json?.message || 'Failed to record attendance')
  }

  if (!json) {
    throw new Error('Invalid response from attendance service')
  }

  return json
}
