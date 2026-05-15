"use client";

import { useState, useEffect } from "react";
import { Shield, X } from "lucide-react";
import Link from "next/link";

const DISMISS_KEY = "gynaeasy_2fa_banner_dismissed_at";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // re-show after 7 days

export default function TwoFABanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem(DISMISS_KEY);
        const dismissedAt = raw ? parseInt(raw, 10) : 0;
        if (Date.now() - dismissedAt > DISMISS_DURATION_MS) {
            setVisible(true);
        }
    }, []);

    const dismiss = () => {
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
                <Shield className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800 font-medium truncate">
                    Sécurisez votre compte en activant la{" "}
                    <Link
                        href="/parametres?tab=securite"
                        className="font-bold underline underline-offset-2 hover:text-amber-900"
                    >
                        double authentification (2FA)
                    </Link>
                    .
                </p>
            </div>
            <button
                onClick={dismiss}
                aria-label="Fermer"
                className="text-amber-500 hover:text-amber-700 transition-colors flex-shrink-0"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
