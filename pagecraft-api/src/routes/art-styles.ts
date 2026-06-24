import { Hono } from "hono"
import { getArtStyles } from "../db/art-styles"

const router = new Hono<{ Bindings: CloudflareBindings }>()

router.get("/", (c) => {
  return c.json(getArtStyles())
})

export default router
