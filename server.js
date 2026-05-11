const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

/*
=====================================
⚡ IN-MEMORY DATABASE (V1)
=====================================
Later upgrade → MongoDB/Postgres
*/

const users = {};
const posts = [];

/*
USER MODEL:
{
  username,
  password,
  pin,
  followers: [],
  following: [],
  topics: []
}

POST MODEL:
{
  id,
  user,
  text,
  recharge: [],
  createdAt
}
*/

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
    topics: []
  };

  return res.json({ ok: true });
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

  return res.json({
    ok: true,
    user
  });
});

//////////////////////////////////////////////////////
// 📝 CREATE POST
//////////////////////////////////////////////////////
app.post("/post", (req, res) => {
  const { username, text } = req.body;

  if (!users[username]) {
    return res.json({ ok: false });
  }

  const post = {
    id: Date.now(),
    user: username,
    text,
    recharge: [],
    createdAt: Date.now()
  };

  posts.unshift(post);

  res.json({ ok: true });
});

//////////////////////////////////////////////////////
// ⚡ RECHARGE (LIKE SYSTEM)
//////////////////////////////////////////////////////
app.post("/recharge", (req, res) => {
  const { postId, user } = req.body;

  const post = posts.find(p => p.id === postId);

  if (!post) return res.json({ ok: false });

  if (!post.recharge.includes(user)) {
    post.recharge.push(user);
  }

  res.json({ ok: true });
});

//////////////////////////////////////////////////////
// 🏠 HOME FEED (FOLLOW BASED)
//////////////////////////////////////////////////////
app.get("/feed/:username", (req, res) => {
  const user = users[req.params.username];

  if (!user) return res.json([]);

  const feed = posts.filter(p =>
    p.user === user.username ||
    user.following.includes(p.user)
  );

  res.json(feed);
});

//////////////////////////////////////////////////////
// 🤝 FOLLOW USER
//////////////////////////////////////////////////////
app.post("/follow", (req, res) => {
  const { from, to } = req.body;

  if (!users[from] || !users[to]) {
    return res.json({ ok: false });
  }

  if (from === to) {
    return res.json({ ok: false, msg: "Cannot follow self" });
  }

  if (!users[from].following.includes(to)) {
    users[from].following.push(to);
  }

  if (!users[to].followers.includes(from)) {
    users[to].followers.push(from);
  }

  res.json({ ok: true });
});

//////////////////////////////////////////////////////
// ❌ UNFOLLOW USER
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

  const userPosts = posts.filter(p => p.user === user.username);

  res.json({
    username: user.username,
    followers: user.followers.length,
    following: user.following.length,
    posts: userPosts
  });
});

//////////////////////////////////////////////////////
// ⚡ SERVER START
//////////////////////////////////////////////////////
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("⚡ PULSE BACKEND V1 RUNNING ON PORT", PORT);
});