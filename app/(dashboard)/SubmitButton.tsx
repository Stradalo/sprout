"use client"

import { useFormStatus } from "react-dom";

// Shows the pending state of whichever form it sits in, so a submit that waits
// on the server (grading especially) stops looking like a dead button.
export default function SubmitButton({
    children,
    className = "btn-primary",
    pendingLabel,
    title,
}: {
    children: React.ReactNode,
    className?: string,
    pendingLabel?: string,
    title?: string,
}) {
    const { pending } = useFormStatus()

    return (
        <button type="submit" className={className} disabled={pending} title={title}>
            { pending && <span className="spinner" /> }
            { pending ? (pendingLabel ?? children) : children }
        </button>
    )
}
