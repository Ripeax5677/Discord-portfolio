const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const app = express();
require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/callback";

let userData;

if (fs.existsSync("user.json")) {
  userData = JSON.parse(fs.readFileSync("user.json"));
}

app.use(express.static("."));

app.get("/login", (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify`;
  res.redirect(url);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code || userData) return res.redirect("/");

  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("scope", "identify");

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: params,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const data = await response.json();

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `${data.token_type} ${data.access_token}` },
  });

  const user = await userRes.json();
  userData = {
    username: `${user.username}#${user.discriminator}`,
    avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024`
  };

  fs.writeFileSync("user.json", JSON.stringify(userData));
  res.redirect("/");
});

app.get("/user", (req, res) => {
  if (!userData) return res.status(404).send("No user stored");
  res.json(userData);
});

app.listen(3000, () => {
  console.log("Server läuft auf http://localhost:3000");
});
