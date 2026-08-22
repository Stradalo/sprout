"use client"

import { useLinkStatus } from "next/link";

// Inline hint for a Link whose navigation has not resolved yet. Must be
// rendered inside the Link. Kept at a fixed size and toggled with opacity so it
// never shifts the layout around it.
export default function LinkPending() {
    const { pending } = useLinkStatus()

    return (
        <span
            className={`spinner shrink-0 text-muted transition-opacity ${pending ? "opacity-100" : "opacity-0"}`}
            aria-hidden="true"
        />
    )
}
