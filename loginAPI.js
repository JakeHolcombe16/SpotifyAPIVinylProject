const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const imageLimit = 50
const url = "http://localhost:5173/display.html"


// for (let index = 0; index < imageLimit; index++) {
//     imagesUl2.insertAdjacentHTML("afterend",`<li><span class="image"></span></li>`)
    
//   }
// imagesUl.style ='display:flex;flex-wrap:wrap;list-style: none;'
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
// We only need the try except so we can delete the button and have no error on redirect page
try {
  const loginButton = document.getElementById('login')
  loginButton.addEventListener('click', async () => {
    await redirectToAuthCodeFlow(clientId);
    loginButton.style.display = 'none'
  })
} catch {
  
}
const accessToken = await getAccessToken(clientId, code);
export const profile = await fetchProfile(accessToken);
export const topTracks = await getTopTracks()
export const topArtists = await getTopArtists()

export async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  // params.append("redirect_uri", "http://localhost:5173/callback");
  params.append("redirect_uri", url);
  params.append("scope", "user-read-private user-read-email user-top-read");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
}

export async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  // params.append("redirect_uri", "http://localhost:5173/callback"); // TODO: Change to test page
  params.append("redirect_uri", url);
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
  });

  const { access_token } = await result.json();
  return access_token;
}

async function fetchProfile() {
  const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
  });

  return await result.json();
} 
async function getTopTracks(){
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  return (await fetchWebApi(
    `v1/me/top/tracks?time_range=long_term&limit=${imageLimit}`, 'GET'
  )).items;
}
async function getTopArtists(){
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  return (await fetchWebApi(
    `v1/me/top/artists?time_range=long_term&limit=${imageLimit}`, 'GET'
  )).items;
}


async function fetchWebApi(endpoint, method, body) {
  // console.log(accessToken);
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method,
    body:JSON.stringify(body)
  });
  return await res.json();
}

export const topAlbumCovers = []
