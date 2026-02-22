import { toNextJsHandler } from "better-auth/next-js"
import { getAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

const { POST, GET } = toNextJsHandler(getAuth())

export { POST, GET }
