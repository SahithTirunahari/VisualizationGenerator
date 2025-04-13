# your_script.R

# Load required libraries.
# (We assume that the Docker image installs these packages via the Dockerfile.)
suppressPackageStartupMessages({
  library(ggplot2)
  library(plotly)
  library(htmlwidgets)
  library(base64enc)
})

# Get command-line arguments: we expect one argument, the path to the user code file.
args <- commandArgs(trailingOnly = TRUE)
if(length(args) < 1){
  stop("Error: No code file specified", call.=FALSE)
}
code_file <- args[1]

# Execute the user-provided R code.
# This code can create plots or interactive figures and should also set the global variable "output_mode".
tryCatch({
  source(code_file, local=TRUE)
}, error = function(e) {
  cat("Error in user code:", e$message, "\n", file=stderr())
  quit(status = 2)
})

# Decide the output mode based on a global variable set in the user code.
# Valid modes: "static" (default), "interactive", "3d"
output_mode <- tolower(ifelse(exists("output_mode", inherits=FALSE), output_mode, "static"))

if(output_mode == "interactive" || output_mode == "3d") {
  # Interactive branch: we expect the user code to have created a plotly figure in global variable `fig`
  if(exists("fig", inherits=FALSE)){
    tmp_file <- tempfile(fileext = ".html")
    # Save the Plotly figure as a full HTML document. selfcontained=TRUE bundles resources.
    tryCatch({
      saveWidget(fig, tmp_file, selfcontained = TRUE)
    }, error = function(e){
      cat("<html><body><p>Error in saving Plotly figure: ", e$message, "</p></body></html>")
      quit(status = 2)
    })
    # Read the HTML file content.
    html_str <- paste(readLines(tmp_file, warn=FALSE), collapse="\n")
    unlink(tmp_file)
    # Output raw HTML (interactive output)
    cat(html_str)
  } else {
    cat("<html><body><p>Error: No interactive figure ('fig') defined.</p></body></html>")
  }
} else {
  # Static branch: use ggplot2 to capture the last plot from the plotting system.
  tmp_file <- tempfile(fileext = ".png")
  # Try to capture the last created ggplot; if none exists, create a default one.
  p <- tryCatch({
    last_plot <- ggplot2::last_plot()
    if(is.null(last_plot)){
      stop("No ggplot available")
    }
    last_plot
  }, error = function(e){
    ggplot(data.frame(x=c(0,1), y=c(0,1)), aes(x=x, y=y)) +
      geom_line() +
      ggtitle("Default Chart")
  })

  # Save the plot as PNG.
  ggsave(filename = tmp_file, plot = p, width = 6, height = 4, dpi = 150)
  img_binary <- readBin(tmp_file, "raw", file.info(tmp_file)$size)
  unlink(tmp_file)
  image_base64 <- base64encode(img_binary)
  cat("data:image/png;base64," , image_base64, sep = "")
}
