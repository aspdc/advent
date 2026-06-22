'use server';

import { serverEnv } from "@/lib/env";
import { tryCatch } from "@/lib/try-catch";
import { headers } from "next/headers";

const SECRET_KEY = serverEnv.CLOUDFLARE_TURNSTILE_SECRET;

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

async function fetchTurnstile(token: string, remoteip: string): Promise<TurnstileResponse> {
    const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                secret: SECRET_KEY,
                response: token,
                remoteip: remoteip,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(`Cloudflare API responded with status: ${response.status}`);
    }

    return await response.json();
}

export async function validateTurnstile(token: string) {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    
    const remoteip = forwardedFor ? forwardedFor.split(",")[0].trim() : "";

    const { data: turnstileData, error: fetchError } = await tryCatch(
        fetchTurnstile(token, remoteip)
    );

    if (fetchError) {
        return {
            success: false,
            error: "Failed to communicate with the verification server.",
        };
    }

    if (!turnstileData || !turnstileData.success) {
        const errorCodes = turnstileData?.["error-codes"]?.join(", ") || "invalid-input-response";
        return {
            success: false,
            error: `Turnstile verification failed: ${errorCodes}`,
        };
    }

    return {
        success: true,
        error: null,
    };
}
