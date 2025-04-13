FROM rocker/r-ver:4.2.0

# Install system dependencies, including Pandoc.
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libpng-dev \
    libfreetype6-dev \
    libgl1-mesa-dev \
    libglu1-mesa-dev \
    pandoc \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and run the package installation script.
COPY install_packages.R .
RUN Rscript install_packages.R

# Copy your external R script.
COPY your_script.R .

# Set the default command (can be overridden by backend command).
CMD ["Rscript", "your_script.R"]
