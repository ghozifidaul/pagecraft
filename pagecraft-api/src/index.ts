import { Hono } from "hono";
import { cors } from "hono/cors";
import artStylesRouter from "./routes/art-styles";
import booksRouter from "./routes/books";
import pagesRouter from "./routes/pages";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(
  "/api/*",
  cors({
    origin: (origin, c) => c.env.FRONTEND_URL,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/", (c) => {
  return c.text("PageCraft API");
});

app.route("/api/art-styles", artStylesRouter);
app.route("/api/books", booksRouter);
app.route("/api/books", pagesRouter);

export default app;
