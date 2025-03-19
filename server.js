const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = 4000;

// cors stuff
app.use(cors());
app.use(express.json());

// /api/search
app.get("/api/search", async (req, res) => {
  const { category, query } = req.query;
  const payload = {
    part_category: category || "PCCase",
    // inc limit to avoid pagination (later feature if needed)
    limit: 100,
    skip: 0,
    sort: 0,
    filters: [],
    search_query: query || "",
    show_disabled_interactive_models: true,
    show_interactive_first: false,
    // compatibility_build: ,
  };

  try {
    const buildCoresResponse = await fetch(
      "https://www.api.buildcores.com/api/official/database/parts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await buildCoresResponse.json();
    res.json(data);
    // log to see req data 
    console.log(data);
  } catch (error) {
    console.error("Error proxying search:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
