const clientId = "3061de51036d4f2fa286954bcd47935b"; // Replace with your client ID
const imageLimit = 9
const imagesUl = document.getElementById('images')
const imagesUl2 = document.getElementById('images2')


// for (let index = 0; index < imageLimit; index++) {
//     imagesUl2.insertAdjacentHTML("afterend",`<li><span class="image"></span></li>`)
    
//   }
// imagesUl.style ='display:flex;flex-wrap:wrap;list-style: none;'
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

const loginButton = document.getElementById('login')
loginButton.addEventListener('click', async () => {
  await redirectToAuthCodeFlow(clientId);
  loginButton.remove()
})
const accessToken = await getAccessToken(clientId, code);
const profile = await fetchProfile(accessToken);
const topTracks = await getTopTracks()
const topArtists = await getTopArtists()
console.log(topTracks);
console.log(
  topTracks?.map(
    ({name, artists}) =>
      `${name} by ${artists.map(artist => artist.name).join(', ')}`
  )
);


console.log(profile);
// console.log(artists);
populateUI(profile);


export async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:5173/callback");
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
  params.append("redirect_uri", "http://localhost:5173/callback"); // TODO: Change to test page
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
  console.log(accessToken);
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

function populateUI(profile) {
  document.getElementById("displayName").innerText = profile.display_name;
  if (profile.images[1]) {
      const profileImage = new Image(400, 400);
      profileImage.src = profile.images[1].url;
      document.getElementById("avatar").appendChild(profileImage);
      document.getElementById("imgUrl").innerText = profile.images[1].url;
  }
  document.getElementById("id").innerText = profile.id;
  document.getElementById("email").innerText = profile.email;
  document.getElementById("uri").innerText = profile.uri;
  document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url").innerText = profile.href;
  document.getElementById("url").setAttribute("href", profile.href);
  document.getElementById("topArtists").innerText = topArtists.map((artist) => artist.name).join(', ')
  document.getElementById("topTracks").innerText = topTracks.map((track) => track.name).join(', ')
  const imageElements = document.getElementsByClassName('image');
  
  for (let i = 0; i < imageElements.length && i < topTracks.length; i++) {
    const imageUrl = topTracks[i].album.images[1].url;
    topAlbumCovers.push(imageUrl)
    imageElements[i].innerHTML = `<img src=${imageUrl}>`;
}

//   Array.from(document.getElementsByClassName('image')).forEach(element => {
//     element.innerHTML = topTracks.map((track) => track.album.images[0].url)

// });
  // .innerText = topTracks.map((track) => track.album.images[0].url)

}
