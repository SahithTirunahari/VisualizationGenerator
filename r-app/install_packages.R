packages <- c("ggplot2", "plotly", "htmlwidgets", "base64enc")
install_if_missing <- function(pkg) {
  if (!require(pkg, character.only = TRUE, quietly = TRUE)) {
    install.packages(pkg, repos = "https://cloud.r-project.org")
    library(pkg, character.only = TRUE)
  }
}
invisible(sapply(packages, install_if_missing))

