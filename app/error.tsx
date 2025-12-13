'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900">Something went wrong!</h2>
            <p className="mt-2 text-gray-500">{error.message || 'An unexpected error occurred.'}</p>
            <button
                onClick={() => reset()}
                className="mt-4 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
                Try again
            </button>
        </div>
    )
}
