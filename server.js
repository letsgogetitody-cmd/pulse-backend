const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// health check route
app.get("/", (req, res) => {
  res.send("PULSE backend is running ⚡");
});

// simple in-memory storage (temporary for now)
let users = [];
let posts = [];

/* SIGNUP */
app.post("/signup", (req, res) => {
  const { username, password, pin } = req.body;

  if (!username || !password || !pin) {
    return res.json({ ok: false, msg: "Missing fields" });
  }

  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.json({ ok: false, msg: "Username taken" });
  }

  const user = {
    username,
    password,
    pin,
    followers: [],
    following: []
  };

  users.push(user);

  res.json({ ok: true, user });
});

/* LOGIN */
app.post("/login", (req, res) => {
  const { username, password, pin } = req.body;

  const user = users.find(u => u.username === username);

  if (!user) return res.json({ ok: false });

  if (user.password === password || user.pin === pin) {
    return res.json({ ok: true, user });
  }

  res.json({ ok: false });
});

/* CREATE POST */
app.post("/post", (req, res) => {
  const { username, text } = req.body;

  const post = {
    id: Date.now(),
    user: username,
    text,
    recharge: []
  };

  posts.push(post);

  res.json({ ok: true, post });
});

/* FEED */
app.get("/feed/:username", (req, res) => {
  const user = users.find(u => u.username === req.params.username);

  if (!user) return res.json([]);

  const feed = posts.filter(
    p => p.user === user.username || user.following.includes(p.user)
  );

  res.json(feed.reverse());
});

/* FOLLOW (LOCK IN SYSTEM) */
app.post("/follow", (req, res) => {
  const { me, target } = req.body;

  const a = users.find(u => u.username === me);
  const b = users.find(u => u.username === target);

  if (!a || !b) return res.json({ ok: false });

  if (!a.following.includes(target)) a.following.push(target);
  if (!b.followers.includes(me)) b.followers.push(me);

  res.json({ ok: true });
});

/* RECHARGE (REPOST FEATURE) */
app.post("/recharge", (req, res) => {
  const { postId, user } = req.body;

  const post = posts.find(p => p.id === postId);

  if (!post) return res.json({ ok: false });

  if (!post.recharge.includes(user)) {
    post.recharge.push(user);
  }

  res.json({ ok: true, post });
});

// IMPORTANT FOR RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("PULSE backend running on port", PORT);
});
