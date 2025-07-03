const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
const PORT = 3000;

// DB setup
const dbPath = path.resolve(__dirname, "database", "users.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ Failed to connect to database:", err.message);
  else console.log("✅ Connected to SQLite database.");
});

// Tables
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password TEXT,
  failed_attempts INTEGER DEFAULT 0,
  lockout_time INTEGER DEFAULT 0
)`);

db.run(`CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  wpm INTEGER,
  accuracy INTEGER,
  duration INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: "super-secret",
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, "../frontend")));

// Register
app.post("/register", express.json(), async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.send("❌ All fields required.");
  const hashed = await bcrypt.hash(password, 10);

  db.all(`SELECT password FROM users`, [], async (err, rows) => {
    if (err) return res.send("❌ DB error.");
    for (let row of rows) {
      if (await bcrypt.compare(password, row.password)) {
        return res.send("❌ Password already used.");
      }
    }
    db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, hashed],
      function (err) {
        if (err) {
          if (err.message.includes("users.email") || err.message.includes("users.username"))
            return res.send("❌ Username or email taken.");
          return res.send("❌ Something went wrong.");
        }
        req.session.username = username;
        return res.send(`<script>window.location.href='/typing.html'</script>`);
      });
  });
});

// Login
app.post("/login", express.json(), (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username=?`, [username], async (err, user) => {
    if (err) return res.send("❌ DB error.");
    if (!user) return res.send("❌ User not found.");
    const now = Date.now();

    if (user.lockout_time && user.lockout_time > now) {
      const remaining = Math.ceil((user.lockout_time - now) / 1000);
      return res.send(`❌ Locked out. Try again in ${remaining}s.`);
    }

    if (await bcrypt.compare(password, user.password)) {
      db.run(`UPDATE users SET failed_attempts=0, lockout_time=0 WHERE username=?`, [username]);
      req.session.username = username;
      return res.send(`<script>window.location.href='/typing.html'</script>`);
    } else {
      const attempts = user.failed_attempts + 1;
      const lockout = attempts >= 5 ? now + 5*60*1000 : user.lockout_time;
      db.run(`UPDATE users SET failed_attempts=?, lockout_time=? WHERE username=?`, [attempts, lockout, username]);
      return res.send("❌ Incorrect password.");
    }
  });
});


// Save stats
app.post("/savestats", (req, res) => {
  if (!req.session.username) return res.status(401).send("Not logged in.");
  const { wpm, accuracy, duration } = req.body;

  db.get(`SELECT id FROM users WHERE username=?`, [req.session.username], (err, user) => {
    if (err || !user) return res.status(400).send("User not found.");
    db.run(`INSERT INTO stats (user_id, wpm, accuracy, duration) VALUES (?, ?, ?, ?)`,
      [user.id, wpm, accuracy, duration], err => {
        if (err) return res.send("❌ Failed to save stats.");
        res.send("✅ Stats saved.");
      });
  });
});

// Get stats
app.get("/getstats", (req, res) => {
  if (!req.session.username) return res.status(401).json([]);
  db.get(`SELECT id FROM users WHERE username=?`, [req.session.username], (err, user) => {
    if (err || !user) return res.json([]);
    db.all(`SELECT * FROM stats WHERE user_id=? ORDER BY created_at DESC`, [user.id], (err, rows) => {
      if (err) return res.json([]);
      res.json(rows);
    });
  });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/loginsignup.html"));
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
