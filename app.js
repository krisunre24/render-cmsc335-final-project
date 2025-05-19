const express = require("express");
const app = express();
const path = require("path");
const port = process.argv[2] || 3000;
const bodyParser = require("body-parser");
const axios = require("axios");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const teamStatsRouter = require("./routes/teamStatsRouter");

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));

const dbName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
const databaseAndCollection = { db: dbName, collection: collectionName };

app.get("/", async (req, res) => {
  await client.connect();
  const opinions = await client
    .db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find({})
    .toArray();

  const baseURL = process.env.BASE_URL || `http://localhost:${port}`;
  res.render("index", { opinions, baseURL });
});

app.use("/teamStats", teamStatsRouter);

app.post("/submitOpinion", async (req, res) => {
  const { name, opinion } = req.body;
  const newOpinion = { name, opinion };
  await client.connect();
  await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newOpinion);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

process.stdin.on("data", (input) => {
  const command = input.toString().trim();
  if (command === "stop") {
    console.log("Shutting down the server");
    process.exit(0);
  } else {
    console.log(`Invalid command: ${command}`);
    console.log("Stop to shutdown the server: ");
  }
});