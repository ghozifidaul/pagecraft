import { Hono } from "hono"
import { getArtStyles } from "../db/art-styles"

const router = new Hono<{ Bindings: CloudflareBindings }>()

router.get("/", (c) => {
  const styles = getArtStyles()
  const baseUrl = new URL(c.req.url).origin
  return c.json(styles.map((s) => ({ ...s, imageUrl: `${baseUrl}${s.imageUrl}` })))
})

export default router
