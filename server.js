const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

/*
=========================
⚡ PULSE BACKEND v2
=========================
- auth (signup/login)
- posts + feed
- follow system
- profile system
- topics ready (onboarding support)
*/

const users = {};
const posts = [];

//////////////////////////////////////////////////////
// 👤 SIGNUP
//////////////////////////////////////////////////////
app.post("/signup", (req, res) => {
  const { username, password, pin } = req.body;

  if (!username || !password || !pin) {
    return res.json({ ok: false, msg: "Missing fields" });
  }

  if (users[username]) {
    return res.json({ ok: false, msg: "User already exists" });
  }

  users[username] = {
    username,
    password,
    pin,
    followers: [],
    following: [],
    topics: [] // for onboarding later
  };

  res.json({ ok: true });
});

//////////////////////////////////////////////////////
// 🔐 LOGIN
//////////////////////////////////////////////////////
app.post("/login", (req, res) => {
  const { username, password, pin } = req.body;

  const user = users[username];

  if (!user) return res.json({ ok: false });
  if (user.password !== password) return res.json({ ok: false });
  if (user.pin !== pin) return res.json({ ok: false });

  res.json({ ok: true, user });
});

//////////////////////////////////////////////////////
// 🧠 SAVE TOPICS (READY FOR ONBOARDING)
//////////////////////////////////////////////////////
app.post("/topics", (req, res) => {
  const { username, topics } = req.body;

  if (!users[username]) {
    return res.json({ ok: false });
  }

  users[username].topics = topics;

  res.json({ ok: true });
});

//////////////////////////////////////////////////////
// 📝 CREATE POST
//////////////////////////////////////////////////////
app.post("/post", (req, res) => {
  const { username, text } = req.body;

  if (!users[username]) return res.json({ ok: false });

  posts.unshift({
    id: Date.now(),
    user: username,
    text,
    createdAt: Date.now()
  });

  res.json({ ok: true });
});

//////////////////////////////////////////////////////
// 🏠 FEED
//////////////////////////////////////////////////////
app.get("/feed/:username", (req, res) => {
  const user = users[req.params.username];

  if (!user) return res.json([]);

  const feed = posts.filter(
    p =>
      p.user === user.username ||
      user.following.includes(p.user)
  );

  res.json(feed);
});

//////////////////////////////////////////////////////
// 🤝 FOLLOW
//////////////////////////////////////////////////////
app.post("/follow", (req, res) => {
  const { from, to } = req.body;

  if (!users[from] || !users[to]) {
    return res.json({ ok: false });
  }

  if (from === to) return res.json({ ok: false });

  if (!users[from].following.includes(to)) {
    users[from].following.push(to);
  }

  if (!users[to].followers.includes(from)) {
    users[to].followers.push(from);
  }

  res.json({ ok: true });
});

//////////////////////////////////////////////////////
// ❌ UNFOLLOW
//////////////////////////////////////////////////////
app.post("/unfollow", (req, res) => {
  const { from, to } = req.body;

  if (!users[from] || !users[to]) {
    return res.json({ ok: false });
  }

  users[from].following =
    users[from].following.filter(u => u !== to);

  users[to].followers =
    users[to].followers.filter(u => u !== from);

  res.json({ ok: true });
});

//////////////////////////////////////////////////////
// 👤 PROFILE
//////////////////////////////////////////////////////
app.get("/profile/:username", (req, res) => {
  const user = users[req.params.username];

  if (!user) return res.json(null);

  const userPosts = posts.filter(
    p => p.user === user.username
  );

  res.json({
    username: user.username,
    followers: user.followers.length,
    following: user.following.length,
    topics: user.topics,
    posts: userPosts
  });
});

//////////////////////////////////////////////////////
// ⚡ START SERVER
//////////////////////////////////////////////////////
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("⚡ Pulse backend running on port", PORT);
});