'use client'

import { FormEvent, useMemo, useState } from 'react'
import { recordAttendances } from '@/service/attendance'

type ClockCardProps = {
  userId: string
}

type AttendanceType = 'clock_in' | 'clock_out'

const ACTION_OPTIONS: { label: string; value: AttendanceType }[] = [
  { label: 'Clock In', value: 'clock_in' },
  { label: 'Clock Out', value: 'clock_out' }
]

export default function ClockCard({ userId }: ClockCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [attendanceType, setAttendanceType] = useState<AttendanceType>('clock_in')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const submitLabel = useMemo(() => (attendanceType === 'clock_in' ? 'Submit Clock In' : 'Submit Clock Out'), [attendanceType])

  const closeModal = () => {
    if (isLoading) {
      return
    }
    setIsOpen(false)
  }

  const openModal = (type: AttendanceType) => {
    setAttendanceType(type)
    setErrorMessage('')
    setSuccessMessage('')
    setNote('')
    setIsOpen(true)
  }

  const getLocation = async () => {
    if (!navigator.geolocation) {
      return null
    }

    return new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000 }
      )
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const location = await getLocation()
      const result = await recordAttendances({
        userId,
        attendanceType,
        clockAt: new Date().toISOString(),
        note: note.trim() || undefined,
        latitude: location?.latitude,
        longitude: location?.longitude
      })

      setSuccessMessage(result.message || 'Attendance recorded successfully')
      setTimeout(() => {
        setIsOpen(false)
      }, 900)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to record attendance'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
        <p className="mt-1 text-sm text-gray-500">Record your attendance with one tap.</p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ACTION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              onClick={() => openModal(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {successMessage && <p className="mt-3 text-sm font-medium text-green-600">{successMessage}</p>}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">{attendanceType === 'clock_in' ? 'Clock In' : 'Clock Out'}</h3>
            <p className="mt-1 text-sm text-gray-500">Confirm attendance record before submit.</p>

            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="attendance-note" className="mb-1 block text-sm font-medium text-gray-700">
                  Note
                </label>
                <textarea
                  id="attendance-note"
                  className="min-h-[96px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none ring-blue-300 transition focus:border-blue-500 focus:ring"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Optional note"
                />
              </div>

              {errorMessage && <p className="text-sm font-medium text-red-600">{errorMessage}</p>}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  onClick={closeModal}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : submitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
