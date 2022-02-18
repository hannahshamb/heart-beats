/* exported requestAuthorization */

var buttonsWhite = document.querySelectorAll('.button-white');
for (var buttonWhite of buttonsWhite) {
  buttonWhite.addEventListener('mouseover', whiteLogoHover);
  buttonWhite.addEventListener('mouseout', blackSpotifyLogo);
}
function whiteLogoHover(event) {
  var logoImg = buttonWhite.querySelector('.img-logo');
  if (logoImg !== null) {
    logoImg.setAttribute('src', 'images/Spotify-Logo-White.png');
  }

  var headphoneImg = buttonWhite.querySelector('.headphone-img');
  if (headphoneImg !== null) {
    headphoneImg.setAttribute('src', 'images/Headphones-icon-white.png');
  }
}
function blackSpotifyLogo(event) {
  var logoImg = buttonWhite.querySelector('.img-logo');
  if (logoImg !== null) {
    logoImg.setAttribute('src', 'images/Spotify-Logo-Black.png');
  }

  var headphoneImg = buttonWhite.querySelector('.headphone-img');
  if (headphoneImg !== null) {
    headphoneImg.setAttribute('src', 'images/Headphones-icon-black.png');
  }
}

// SPOTIFY AUTORIZATION CODE //
var redirectUri = 'http://127.0.0.1:5500/welcome.html';

var clientId = 'eee70f43701b49e893b70270e4e93447';
var clientSecret = '9ffca18e2fa54e4c84bb08141c3b8c5b';

var AUTHORIZE = 'https://accounts.spotify.com/authorize/';
var TOKEN = 'https://accounts.spotify.com/api/token';

function onPageLoad() {
  clientId = localStorage.getItem('client_id', clientId);
  clientSecret = localStorage.getItem('client_secret', clientSecret);
  if (window.location.search.length > 0) {
    handleRedirect();
  }
}

function handleRedirect() {
  var code = getCode();
  fetchAccessToken(code);
  window.history.pushState('', '', redirectUri);
}

function fetchAccessToken(code) {
  var body = 'grant_type=authorization_code';
  body += '&code=' + code;
  body += '&redirect_uri=' + encodeURI(redirectUri);
  body += '&client_id=' + clientId;
  body += '&client-secret=' + clientSecret;
  callAuthorizationApi(body);
}

function refreshAccessToken() {
  var refreshToken = localStorage.getItem('refresh_token');
  var body = 'grant_type=refresh_token';
  body += '&refresh_token=' + refreshToken;
  body += '&client_id=' + clientId;
  callAuthorizationApi(body);
}

function callAuthorizationApi(body) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', TOKEN, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Authorization', 'Basic ' + btoa(clientId + ':' + clientSecret));
  xhr.send(body);
  xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse() {
  if (this.status === 200) {
    var data = JSON.parse(this.responseText);
    if (data.access_token !== undefined) {
      var accessToken = data.access_token;
      localStorage.setItem('access_token', accessToken);
    }
    if (data.refresh_token !== undefined) {
      var refreshToken = data.refresh_token;
      localStorage.setItem('refresh_token', refreshToken);
    }
    onPageLoad();
  } else {
    alert(this.responseText);
  }
}

function getCode() {
  var code = null;
  var queryString = window.location.search;
  if (queryString.length > 0) {
    var urlParams = new URLSearchParams(queryString);
    code = urlParams.get('code');
  }
  return code;
}

function requestAuthorization() {
  localStorage.setItem('client_id', clientId);
  localStorage.setItem('client_secret', clientSecret);

  var url = AUTHORIZE;
  url += '?client_id=' + clientId;
  url += '&response_type=code';
  url += '&redirect_uri=' + encodeURI(redirectUri);
  url += '&show_dialog=true';
  url += '&scope=user-read-private playlist-modify-private playlist-modify-public user-read-email user-library-modify';
  window.location.href = url;
}

// SPOTIFY API REQUESTS //
var USERID = 'https://api.spotify.com/v1/me';
function getUserID() {
  callApi('GET', USERID, null, handlegetUserIDResponse);
}

function callApi(method, url, body, callback) {
  var accessToken = localStorage.getItem('access_token');
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
  xhr.send(body);
  xhr.onload = callback;
}

function handlegetUserIDResponse() {
  if (this.status === 200) {
    var userID = JSON.parse(this.responseText);
    localStorage.setItem('user_ID', userID.display_name);
  } else if (this.status === 401) {
    refreshAccessToken();
  } else {
    alert(this.responseText);
  }
}
getUserID();

function signedInAs() {
  var $userDisplayNameSpan = document.querySelector('span.user-display-name');
  if ($userDisplayNameSpan !== null) {
    $userDisplayNameSpan.innerHTML = localStorage.getItem('user_ID');
  }
}
signedInAs();
