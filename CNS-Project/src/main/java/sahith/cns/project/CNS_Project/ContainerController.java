package sahith.cns.project.CNS_Project;




import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/launch-container")
public class ContainerController {

    @PostMapping
    public ResponseEntity<Map<String, String>> launchContainer(@RequestBody Map<String, String> payload) {
        String language = payload.get("language");
        String userCode = payload.get("code");

        // Validate language and code
        if (language == null || (!language.equalsIgnoreCase("python") && !language.equalsIgnoreCase("R"))) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Unsupported language: " + language);
            return ResponseEntity.badRequest().body(err);
        }

        if (userCode == null || userCode.trim().isEmpty()) {
            // You can decide to return an error or use a default placeholder.
            userCode = "# No user code provided. You can set output_mode = \"static\", \"interactive\", or \"3d\"\n";
        }

        // Create a temporary file to hold the user code.
        File tempFile;
        try {
            String extension = language.equalsIgnoreCase("python") ? ".py" : ".R";
            tempFile = File.createTempFile("user_code_", extension);
            try (FileWriter writer = new FileWriter(tempFile)) {
                writer.write(userCode);
            }
        } catch (IOException e) {
            e.printStackTrace();
            Map<String, String> err = new HashMap<>();
            err.put("error", "Error creating temporary file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }

        // Build the Docker run command.
        String command;
        if (language.equalsIgnoreCase("python")) {
            // For Python, we assume your updated image contains your_script.py at /app/your_script.py.
            // The temporary user code is mounted to /app/user_code.py.
            command = "docker run --rm -v " + tempFile.getAbsolutePath() +
                    ":/app/user_code.py your-python-image:latest python /app/your_script.py /app/user_code.py";
        } else { // language is "R"
            // For R, we assume your updated image contains your_script.R at /app/your_script.R.
            // The temporary user code is mounted to /app/user_code.R.
            command = "docker run --rm -v " + tempFile.getAbsolutePath() +
                    ":/app/user_code.R your-r-image:latest Rscript your_script.R /app/user_code.R";
        }

        System.out.println("Executing command: " + command);

        // Execute the command and capture the output.
        String visualizationOutput = "";
        try {
            ProcessBuilder pb = new ProcessBuilder("sh", "-c", command);
            // Redirect error stream to capture all output.
            pb.redirectErrorStream(true);
            Process process = pb.start();

            // Capture output
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder outputBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                outputBuilder.append(line).append("\n");
            }
            int exitCode = process.waitFor();
            System.out.println("Script exit code: " + exitCode);
            System.out.println("Script output: " + outputBuilder.toString());

            if (exitCode != 0) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Script exited with code " + exitCode + ". Output: " + outputBuilder.toString());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
            }
            visualizationOutput = outputBuilder.toString().trim();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> err = new HashMap<>();
            err.put("error", "Exception occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        } finally {
            try {
                Files.deleteIfExists(tempFile.toPath());
            } catch (IOException ioe) {
                System.err.println("Warning: Unable to delete temp file: " + tempFile.getAbsolutePath());
            }
        }

        if (visualizationOutput.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "No visualization output from container.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }

        // Return the captured output as the visualization.
        Map<String, String> response = new HashMap<>();
        response.put("visualization", visualizationOutput);
        return ResponseEntity.ok(response);
    }
}
