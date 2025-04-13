# Interactive Visualization Generator

This project demonstrates a full-stack application for generating interactive visualizations from user-supplied code using Docker containers. The application consists of:

- **Spring Boot Backend:**  
  Receives code and language choices from the frontend, writes the code to a temporary file, and runs a Docker container to execute that code.

- **Python and R Docker Containers:**  
  These containers execute external scripts (`your_script.py` for Python and `your_script.R` for R) that read the mounted user code and generate visualizations. The output mode (static, interactive, or 3d) is determined by a global variable `output_mode` set by the user code.  
  - For Python:  
    The external script supports both static matplotlib plots and interactive output (using Plotly, for example).
  - For R:  
    The external script supports static output (using ggplot2) or interactive output (using Plotly via `htmlwidgets`).

- **React Frontend:**  
  Provides a form where the user selects the language and output mode (static, interactive, or 3d) and enters their code. The frontend sends the request to the backend and renders the returned visualization accordingly. If interactive HTML is returned, it is rendered in an `<iframe>`.

## Architecture Overview

1. **Frontend (React):**
   - User selects language (Python or R) and output mode.
   - Code is entered (or pasted) into a text area.
   - On submission, the frontend sends a POST request to the backend (`/launch-container`).

2. **Backend (Spring Boot):**
   - Receives payload with `language` and `code`.
   - Writes user code into a temporary file.
   - Invokes Docker run command to mount the file into the appropriate container.
   - Executes the external script (either `your_script.py` or `your_script.R`) which processes the user code and generates the output visualization.
   - Captures script output and returns it in a JSON response with the key `"visualization"`.

3. **Docker Containers (Python & R):**
   - **Python Container:**  
     Runs a script (`your_script.py`) that executes the mounted code and produces either a static image (Base64 PNG) or interactive HTML using Plotly depending on `output_mode`.
   - **R Container:**  
     Runs a script (`your_script.R`) that reads and executes the mounted code, then produces a visualization using ggplot2 (static) or interactive Plotly output (via `htmlwidgets`) based on `output_mode`.

## Prerequisites

- **Docker:** Make sure Docker is installed and running.  
  On macOS/Windows, ensure the directories for temporary file creation are added to Docker Desktop's File Sharing.
  
- **Java 11 or later:** For running the Spring Boot backend.
  
- **Maven:** For building the Spring Boot project.
  
- **Node.js and npm:** For running the React frontend.

## Project Setup

### Backend (Spring Boot)

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/yourusername/interactive-visualization-generator.git
   cd interactive-visualization-generator/backend


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.


### `Navigate to the Python App Folder:`
cd ../python-app
docker build -t your-python-image:latest .
### `Navigate to the R App Folder:`
cd ../r-app
docker build -t your-r-image:latest .
### `Build and Run Maven`
mvn clean package
mvn spring-boot:run

The backend will be available at http://localhost:8080.

