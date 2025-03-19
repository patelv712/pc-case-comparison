import React, { useState } from "react";

const server = "https://pc-case-comparison.onrender.com/api";

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
      const aPrices = a.price || [];
      console.log("a", aPrices);
      const bPrices = b.price || [];
      console.log("b", bPrices);
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

      {/* search */}


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

      {/* comparison */}

      <div>
        <h2>Comparison</h2>
        { /* only sort it if there are things to compare */ }
        {compareList.length > 0 ? (
          <div>
            <button onClick={sortByPrice} style={{ marginBottom: "1rem" }}>
              Sort by Price
            </button>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  minWidth: "600px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                        background: "#f0f0f0",
                      }}
                    >
                      Specification
                    </th>
                    {compareList.map((product) => {
                      const productId = product.buildcores_id || product.id;
                      return (
                        <th
                          key={productId}
                          style={{
                            border: "1px solid #ccc",
                            padding: "0.5rem",
                            background: "#f0f0f0",
                          }}
                        >
                          {product.name}
                          <br />
                          <button
                            onClick={() => removeFromCompare(productId)}
                            style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}
                          >
                            Remove
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>

                  {/* each spec for all prod */}

                  {getAllSpecsKeys().map((specKey) => (
                    <tr key={specKey}>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "0.5rem",
                          fontWeight: "bold",
                        }}
                      >
                        {specKey}
                      </td>
                      {compareList.map((product) => {
                        const productId = product.buildcores_id || product.id;
                        return (
                          <td
                            key={productId + specKey}
                            style={{
                              border: "1px solid #ccc",
                              padding: "0.5rem",
                            }}
                          >
                            {product.specifications
                              ? renderSpecValue(product.specifications[specKey])
                              : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* price */}

                  <tr>
                    <td
                      style={{
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                        fontWeight: "bold",
                      }}
                    >
                      Lowest Price
                    </td>
                    {compareList.map((product) => {
                      const productId = product.buildcores_id || product.id;
                      // console.log(product.v2_lowest_prices?);
                      // some cases dont have field
                      const lowestPrice = product.price || [];
                      console.log("price", product.price);
                      console.log(product.v2_lowest_prices?.US);
                      return (
                        <td
                          key={productId + "price"}
                          style={{
                            border: "1px solid #ccc",
                            padding: "0.5rem",
                          }}
                        >
                          {lowestPrice ? `$${lowestPrice}` : "-"}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p>Add PC cases to compare.</p>
        )}
      </div>
    </div>


  );
};

export default App;
