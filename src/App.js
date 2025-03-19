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

  return(
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Varun Patel - BuildCores - PC Case Comparison</h1>

      {/* Search */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={searchTerm}
          placeholder="Search PC Cases"
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "0.5rem", width: "250px" }}
        />
        <button onClick={searchProducts} style={{ marginLeft: "0.5rem" }}>
          Search
        </button>
      </div>

      {loading && <p>Loading search results...</p>}



      {/* Search Results */}




      <div style={{ marginBottom: "2rem" }}>
        <h2>Search Results</h2>
        {results.length === 0 && <p>No results found.</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {results.map((product) => {
            const productId = product.buildcores_id || product.id;
            return (
              <li
                key={productId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                  border: "1px solid #ccc",
                  padding: "0.5rem",
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  width="50"
                  style={{ marginRight: "1rem" }}
                />
                <div style={{ flex: 1 }}>
                  <strong>{product.name}</strong>
                  {product.price && <p>${product.price}</p>}
                </div>
                <button onClick={() => addToCompare(product)}>
                  Add to Compare
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>




  );
};

export default App;
