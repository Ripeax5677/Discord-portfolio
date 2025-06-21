const fetch = require("node-fetch");

let storedUser = null;  // Temporärer Speicher

exports.handler = async (event, context) => {
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;

  const code = event.queryStringParameters.code;
  if (!code) {
    return {
      statusCode: 400,
      body: "No code provided"
    };
  }
  if (storedUser) {
    return {
      statusCode: 302,
      headers: { Location: "/" }
    };
  }

  // Token holen
  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("scope", "identify");

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: params,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const tokenData = await tokenRes.json();

  // Userdaten holen
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `${tokenData.token_type} ${tokenData.access_token}`
    }
  });
  const userData = await userRes.json();

  storedUser = {
    username: `${userData.username}#${userData.discriminator}`,
    avatar: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=1024`
  };

  return {
    statusCode: 302,
    headers: {
      Location: "/"
    }
  };
};
