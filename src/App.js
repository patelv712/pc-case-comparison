import React, { useState } from "react";

const server = "http://localhost:4000/api";

// - for missing fields and ensure vals are strings
function renderSpecValue(value) {
  if (value == null) return "-";
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [loading, setLoading] = useState(false);

  // search and send req to server w query
  const searchProducts = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const response = await fetch(
        // we can change category if needed
        `${server}/search?category=PCCase&query=${encodeURIComponent(
          searchTerm
        )}`
      );
      const data = await response.json();
      setResults(data.data || []);
    } catch (error) {
      console.error("error fetching search results:", error);
    }
    setLoading(false);
  };

  // create comparison list
  const addToCompare = (product) => {
    const productId = product.buildcores_id;
    // reomve duplicates in case 
    if (compareList.some((item) => (item.buildcores_id) === productId)) {
      return;
    }
    const productDetails = {
      ...product,
      specifications: product.v2Fields,
    };

    setCompareList((prev) => [...prev, productDetails]);
  };

  // remove from comparison list
  const removeFromCompare = (productId) => {
    setCompareList((prev) =>
      prev.filter((item) => (item.buildcores_id) !== productId)
    );
  };

  // price filter (ascending)
  const sortByPrice = () => {
    console.log("start");
    const sorted = [...compareList].sort((a, b) => {
      const aPrices = a.v2_lowest_prices?.US || [];
      console.log(aPrices);
      const bPrices = b.v2_lowest_prices?.US || [];
      console.log(bPrices);
      return aPrices - bPrices;
    });
    setCompareList(sorted);
  };

  // return specs
  const getAllSpecsKeys = () => {
    const keysSet = new Set();
    compareList.forEach((product) => {
      if (product.specifications) {
        Object.keys(product.specifications).forEach((key) => keysSet.add(key));
      }
    });
    return Array.from(keysSet);
  };

  return;
};

export default App;
