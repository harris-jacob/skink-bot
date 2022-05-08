import fetch from "node-fetch";

/** exchange a auth code for JWT */
export const fetchToken = async (code: string) => {
  const response = await fetch(
    TOKEN_URL +
      new URLSearchParams({
        code: code,
        client_id: process.env.CLIENT_ID || "",
        client_secret: process.env.CLIENT_SECRET || "",
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000",
      }),
    { method: "POST" }
  );

  const result = await response.json();

  return result.access_token;
};

/** Validate authorization token */
export const validateToken = async (token: string) => {
  const response = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: { Authorization: `OAuth ${token}` },
  });

  const result = await response.json();

  console.log(result);
};

/** construct the redirect URL which sends the user to the authorize endpoint */
export const buildAuthorizeURI = () =>
  AUTHORIZE_URL +
  new URLSearchParams({
    response_type: "code",
    client_id: process.env.CLIENT_ID || "",
    redirect_uri: "http://localhost:3000",
    scope: "chat:edit chat:read",
  });

const BASE_URL = "https://id.twitch.tv/oauth2/";
const TOKEN_URL = `${BASE_URL}token?`;
const AUTHORIZE_URL = `${BASE_URL}authorize?`;
