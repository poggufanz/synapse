"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Something went wrong!</h2>
            <button
                onClick={() => reset()}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
