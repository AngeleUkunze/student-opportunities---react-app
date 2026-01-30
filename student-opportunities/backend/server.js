const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "YOUR_SECRET_KEY";

// Initialize SQLite database
const db = new sqlite3.Database('./database.db');

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT UNIQUE,
    password TEXT
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS user_opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    opportunity_id INTEGER,
    status TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    // Insert some dummy opportunities if table is empty
    db.all("SELECT COUNT(*) as count FROM opportunities", (err, rows) => {
        if (rows[0].count === 0) {
            const ops = [
                { title: "Internship at Google", type: "Internship" },
                { title: "Scholarship for STEM", type: "Scholarship" },
                { title: "Hackathon 2026", type: "Event" },
            ];
            ops.forEach(op => {
                db.run("INSERT INTO opportunities (title, type) VALUES (?, ?)", [op.title, op.type]);
            });
        }
    });
});

// Test route
app.get("/", (req, res) => res.send("Backend is running"));

// Sign Up
app.post("/api/signup", (req, res) => {
    const { username, email, password } = req.body;
    const hashed = bcrypt.hashSync(password, 10);
    db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashed], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        const token = jwt.sign({ id: this.lastID }, SECRET);
        res.json({ token, username });
    });
});

// Login
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (!user) return res.status(400).json({ error: "User not found" });
        if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: "Wrong password" });
        const token = jwt.sign({ id: user.id }, SECRET);
        res.json({ token, username: user.username });
    });
});

// Get all opportunities
app.get("/api/opportunities", (req, res) => {
    db.all("SELECT * FROM opportunities", (err, rows) => {
        res.json(rows);
    });
});

// Set Apply / Interest status
app.post("/api/opportunity/status", (req, res) => {
    const { token, opportunity_id, status } = req.body;
    if (!token) return res.status(401).json({ error: "No token" });
    let userId;
    try { userId = jwt.verify(token, SECRET).id; }
    catch { return res.status(401).json({ error: "Invalid token" }); }

    db.get("SELECT * FROM user_opportunities WHERE user_id=? AND opportunity_id=?", [userId, opportunity_id], (err, row) => {
        if (row) {
            db.run("UPDATE user_opportunities SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", [status, row.id]);
        } else {
            db.run("INSERT INTO user_opportunities (user_id, opportunity_id, status) VALUES (?, ?, ?)", [userId, opportunity_id, status]);
        }
        res.json({ success: true });
    });
});

// Get user status
app.get("/api/user/status/:userId", (req, res) => {
    const userId = req.params.userId;
    db.all("SELECT * FROM user_opportunities WHERE user_id = ?", [userId], (err, rows) => {
        res.json(rows);
    });
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
