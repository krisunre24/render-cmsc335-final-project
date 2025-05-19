const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", (req, res) => {
  res.send("Please return to the home page and use the form to search for a team's stats.");
});

router.get("/retrieveData", async (req, res) => {
  const { teamName, seasonYear } = req.query;
  const apiKey = process.env.API_KEY;
  const options = {
    method: "GET",
    url: `https://api-nba-v1.p.rapidapi.com/teams`,
    params: { search: teamName },
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const teamId = response.data.response[0]?.id;

    if (!teamId) {
      return res.send("Team not found.");
    }

    const statsOptions = {
      method: "GET",
      url: `https://api-nba-v1.p.rapidapi.com/teams/statistics`,
      params: { id: teamId, season: seasonYear },
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    };

    const statsResponse = await axios.request(statsOptions);
    const stats = statsResponse.data.response;

    res.render("stats", {
      team: teamName,
      games: stats.games,
      points: stats.points,
      turnovers: stats.turnovers,
      blocks: stats.blocks,
    });
  } catch (error) {
    console.error(error);
    res.send("An error occurred while retrieving team data.");
  }
});

module.exports = router;