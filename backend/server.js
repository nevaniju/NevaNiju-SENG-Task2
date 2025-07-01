const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
const PORT = 3000;

// ✅ DB setup
const dbPath = path.resolve(__dirname, "database", "users.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to database:", err.message);
  } else {
    console.log("✅ Connected to the SQLite database.");
  }
});

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password TEXT,
  failed_attempts INTEGER DEFAULT 0,
  lockout_time INTEGER DEFAULT 0
)`);

// ✅ Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "super-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ Register POST
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.send("❌ All fields required.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Note: Comparing raw password here for uniqueness is not secure practice.
  db.all(`SELECT password FROM users`, [], async (err, rows) => {
    if (err) {
      console.error(err);
      return res.send("❌ DB error.");
    }

    for (let row of rows) {
      const same = await bcrypt.compare(password, row.password);
      if (same) {
        return res.send("❌ Password already used, choose a different one.");
      }
    }

    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.run(query, [username, email, hashedPassword], function (err) {
      if (err) {
        if (err.message.includes("users.email")) return res.send("❌ Email already registered.");
        if (err.message.includes("users.username")) return res.send("❌ Username taken.");
        console.error(err);
        return res.send("❌ Something went wrong.");
      }
      req.session.username = username; // auto login
      console.log("✅ Registration successful");
      return res.redirect("/typing.html");
    });
  });
});

// ✅ Login POST
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err) {
      console.error(err);
      return res.send("❌ DB error.");
    }
    if (!user) return res.send("❌ User not found.");

    const now = Date.now();
    if (user.lockout_time && user.lockout_time > now) {
      const remaining = Math.ceil((user.lockout_time - now) / 1000);
      return res.send(`❌ Locked out. Try again in ${remaining} seconds.`);
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      db.run(
        `UPDATE users SET failed_attempts = 0, lockout_time = 0 WHERE username = ?`,
        [username]
      );
      req.session.username = username;
      console.log("✅ Login successful");
      return res.redirect("/typing.html");
    } else {
      const attempts = user.failed_attempts + 1;
      const lockout = attempts >= 5 ? now + 5 * 60 * 1000 : user.lockout_time;
      db.run(
        `UPDATE users SET failed_attempts = ?, lockout_time = ? WHERE username = ?`,
        [attempts, lockout, username]
      );
      return res.send("❌ Incorrect password.");
    }
  });
});

// ✅ Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/loginsignup.html");
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
