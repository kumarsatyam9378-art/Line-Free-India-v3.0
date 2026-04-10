import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`API listening on :${port}`);
  });
}

export default app;
