import express from "express";
import Database from "better-sqlite3";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const db = new Database("game-zone-fans.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    genre TEXT,
    platform TEXT
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS releases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game TEXT NOT NULL,
    release_date TEXT
  );
`);

const gameCount = db
  .prepare("SELECT COUNT(*) AS count FROM games")
  .get().count;

if (gameCount === 0) {
  const insert = db.prepare(
    "INSERT INTO games (name, genre, platform) VALUES (?, ?, ?)"
  );

  insert.run("GTA VI", "Action", "PS5 • Xbox Series X/S");
  insert.run("EA Sports FC 26", "Sports", "PS5 • Xbox • PC");
  insert.run("Minecraft", "Adventure", "PC • Console • Mobile");
  insert.run("Fortnite", "Battle Royale", "PC • Console • Mobile");
}

app.get("/api/games", (req, res) => {
  const games = db.prepare("SELECT * FROM games ORDER BY id DESC").all();
  res.json(games);
});

app.post("/api/games", (req, res) => {
  const { name, genre, platform } = req.body;

  if (!name) {
    return res.status(400).json({ error: "اسم اللعبة مطلوب" });
  }

  const result = db
    .prepare(
      "INSERT INTO games (name, genre, platform) VALUES (?, ?, ?)"
    )
    .run(name, genre || "", platform || "");

  res.json({
    id: result.lastInsertRowid,
    name,
    genre,
    platform
  });
});

app.delete("/api/games/:id", (req, res) => {
  db.prepare("DELETE FROM games WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/news", (req, res) => {
  const news = db
    .prepare("SELECT * FROM news ORDER BY id DESC")
    .all();

  res.json(news);
});

app.post("/api/news", (req, res) => {
  const { title, content } = req.body;

  if (!title) {
    return res.status(400).json({ error: "عنوان الخبر مطلوب" });
  }

  const result = db
    .prepare("INSERT INTO news (title, content) VALUES (?, ?)")
    .run(title, content || "");

  res.json({
    id: result.lastInsertRowid,
    title,
    content
  });
});

app.delete("/api/news/:id", (req, res) => {
  db.prepare("DELETE FROM news WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/releases", (req, res) => {
  const releases = db
    .prepare("SELECT * FROM releases ORDER BY release_date")
    .all();

  res.json(releases);
});

app.post("/api/releases", (req, res) => {
  const { game, release_date } = req.body;

  if (!game) {
    return res.status(400).json({ error: "اسم اللعبة مطلوب" });
  }

  const result = db
    .prepare(
      "INSERT INTO releases (game, release_date) VALUES (?, ?)"
    )
    .run(game, release_date || "");

  res.json({
    id: result.lastInsertRowid,
    game,
    release_date
  });
});

app.delete("/api/releases/:id", (req, res) => {
  db.prepare("DELETE FROM releases WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Game Zone Fans API تعمل بنجاح 🎮"
  });
});

app.listen(PORT, () => {
  console.log(`Game Zone Fans server running on port ${PORT}`);
});
