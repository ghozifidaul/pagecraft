import { Hono } from "hono";
import artStylesRouter from "./routes/art-styles";
import booksRouter from "./routes/books";
import pagesRouter from "./routes/pages";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", (c) => {
  return c.text("PageCraft API");
});

app.route("/api/art-styles", artStylesRouter);
app.route("/api/books", booksRouter);
app.route("/api/books", pagesRouter);

export default app;
