import React, { useState } from 'react';
import axios from 'axios';

const VisualizationGenerator = () => {
  // State variables for language, output mode, user code, visualization output, loading, and error messages.
  const [language, setLanguage] = useState("python");
  const [outputMode, setOutputMode] = useState("interactive"); // Default set to interactive as in your sample payload.
  const [code, setCode] = useState(""); // User-provided code. They can type or paste their code here.
  const [visualizationUrl, setVisualizationUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // When the form is submitted, the frontend constructs the final code.
  // It prepends the output_mode setting to the user code.
  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setVisualizationUrl("");

    // The final code is built so that the first line sets the output_mode.
    // For example: output_mode = 'interactive'
    const finalCode = `output_mode = '${outputMode}'\n${code}`;

    try {
      const response = await axios.post("http://localhost:8080/launch-container", {
        language,
        code: finalCode,
      });

      if (response.data.visualization) {
        setVisualizationUrl(response.data.visualization);
      } else {
        setError("No visualization output returned by backend.");
      }
    } catch (err) {
      const errorMessage =
        typeof err.response?.data === "object"
          ? (err.response.data.error || JSON.stringify(err.response.data))
          : err.response?.data || "Error generating visualization";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render the visualization based on its type.
  // If the returned string starts with raw HTML (<html or <!DOCTYPE) or with a text/html data URI,
  // render it in an iframe. Otherwise, if it starts with data:image, render it in an img element.
  const renderVisualization = () => {
    if (!visualizationUrl) return null;
    const trimmedOutput = visualizationUrl.trim();

    if (trimmedOutput.startsWith("data:text/html")) {
      // If it's a data URI with HTML, use iframe with src.
      return (
        <iframe
          src={trimmedOutput}
          title="Interactive Visualization"
          style={{ width: "100%", height: "600px", border: "none" }}
        />
      );
    }
    
    if (trimmedOutput.startsWith("<html") || trimmedOutput.startsWith("<!DOCTYPE")) {
      // If raw HTML is returned, embed it using the srcDoc attribute.
      return (
        <iframe
          srcDoc={trimmedOutput}
          title="Interactive Visualization"
          style={{ width: "100%", height: "600px", border: "none" }}
        />
      );
    }
    
    if (trimmedOutput.startsWith("data:image")) {
      // Otherwise, assume it's a static image.
      return (
        <img
          src={trimmedOutput}
          alt="Visualization"
          style={{ width: "100%", height: "auto", border: "1px solid #ccc" }}
        />
      );
    }
    
    return <div>Unsupported visualization format.</div>;
  };

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Visualization Generator</h1>
      <form onSubmit={handleGenerate}>
        {/* Language Selection */}
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="language" style={{ marginRight: "10px" }}>
            Select Language:
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ padding: "5px", fontSize: "16px" }}
          >
            <option value="python">Python</option>
            <option value="R">R</option>
          </select>
        </div>
        {/* Output Mode Selection */}
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="outputMode" style={{ marginRight: "10px" }}>
            Select Output Mode:
          </label>
          <select
            id="outputMode"
            value={outputMode}
            onChange={(e) => setOutputMode(e.target.value)}
            style={{ padding: "5px", fontSize: "16px" }}
          >
            <option value="static">Static</option>
            <option value="interactive">Interactive</option>
            <option value="3d">3D</option>
          </select>
        </div>
        {/* Code Input Area */}
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="code" style={{ display: "block", marginBottom: "5px" }}>
            Enter your code:
          </label>
          <textarea
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows="10"
            placeholder="Enter your Python (or R) code here"
            style={{ width: "100%", padding: "10px", fontSize: "16px" }}
          />
        </div>
        {/* Generate Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#007BFF",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>
      {/* Display Error if Present */}
      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          {error}
        </div>
      )}
      {/* Display the Visualization */}
      {visualizationUrl && (
        <div style={{ marginTop: "20px" }}>
          <h2>Visualization:</h2>
          {renderVisualization()}
        </div>
      )}
    </div>
  );
};

export default VisualizationGenerator;
