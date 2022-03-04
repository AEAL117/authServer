require("dotenv").config()
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const lyricsFinder = require("lyrics-finder")
const SpotifyWebApi = require("spotify-web-api-node")
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
var whitelist = ['https://wonderful-wing-d56c28.netlify.app/']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
//('/', cors(corsOptions)
app.post("/refresh",cors(corsOptions), (req, res) => {
  const refreshToken = req.body.refreshToken
  const spotifyApi = new SpotifyWebApi({
    redirectUri: 'https://wonderful-wing-d56c28.netlify.app',
    clientId: '20b403ab2d1d4197abc74cf55ff79a0d',
    clientSecret: '82a2eb405f5b419388f394ba13a96fe1',
    refreshToken,
  })

  spotifyApi
    .refreshAccessToken()
    .then(data => {
      res.json({
        accessToken: data.body.accessToken,
        expiresIn: data.body.expiresIn,
      })
    })
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    })
})

app.post("/login",cors(corsOptions), (req, res) => {
  const code = req.body.code
  var credentials = {
    clientId: '20b403ab2d1d4197abc74cf55ff79a0d',
    clientSecret: '82a2eb405f5b419388f394ba13a96fe1',
    redirectUri: 'https://wonderful-wing-d56c28.netlify.app'
  };
  var spotifyApi = new SpotifyWebApi(credentials);

  console.log(spotifyApi);
  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      })
    })
    .catch(err => {
      console.log("Error 400:"+err);
      res.sendStatus(400)
    })
})

app.get("/lyrics",cors(corsOptions), async (req, res) => {
  const lyrics =
    (await lyricsFinder(req.query.artist, req.query.track)) || "No Lyrics Found"
  res.json({ lyrics })
})

app.listen(3001)
