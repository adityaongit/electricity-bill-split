import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { getAuth } from "@/lib/auth"

export async function getSessionOrUnauthorized() {
  const auth = getAuth()
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    }
  }

  return { session, error: null }
}

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}
