import { toNextJsHandler } from "better-auth/next-js"
import { getAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

// Lazy initialization to avoid build-time evaluation
let _handler: ReturnType<typeof toNextJsHandler> | null = null

function getHandler() {
  if (!_handler) {
    _handler = toNextJsHandler(getAuth())
  }
  return _handler
}

export async function GET(request: Request) {
  return getHandler().GET(request)
}

export async function POST(request: Request) {
  return getHandler().POST(request)
}
