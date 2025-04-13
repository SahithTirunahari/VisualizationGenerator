import sys
import matplotlib.pyplot as plt
import io
import base64
import traceback

# Remove mpld3 import since we won't use it
# import mpld3

# Execute the user code (mounted at /app/user_code.py)
def run_user_code():
    try:
        with open('/app/user_code.py', 'r') as f:
            user_code = f.read()
        # Execute user code in the global namespace.
        # (In production, consider security implications and sandboxing.)
        exec(user_code, globals())
    except Exception as e:
        traceback.print_exc()
        sys.exit(2)

# Generate static output: a Base64-encoded PNG from the current matplotlib figure
def generate_static_chart():
    buf = io.BytesIO()
    try:
        plt.savefig(buf, format='png', bbox_inches='tight')
    except Exception as e:
        # If no figure exists, create a default chart.
        plt.figure(figsize=(6, 4))
        plt.plot([0, 1], [0, 1])
        plt.title("Default Chart")
        plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close()
    buf.seek(0)
    image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    return "data:image/png;base64," + image_base64

# Generate interactive output using Plotly.
# It assumes that the user code has defined a Plotly figure in a variable named 'fig'.
import plotly.io as pio

def generate_interactive_chart():
    try:
        # Check if a Plotly figure 'fig' exists in globals.
        if 'fig' in globals():
            html_str = globals()['fig'].to_html(full_html=True)
            return html_str  # raw HTML output
        else:
            return "<html><body><p>Error: No Plotly figure variable 'fig' found.</p></body></html>"
    except Exception as e:
        return "<html><body><p>Interactive conversion failed: " + str(e) + "</p></body></html>"

# For interactive 3D output, we can use the same interactive branch (the user figure should be a Plotly figure)
def generate_3d_chart():
    return generate_interactive_chart()

def main():
    # Expect a file argument (user code file path) from the caller.
    if len(sys.argv) < 2:
        print("Error: No code file specified", file=sys.stderr)
        sys.exit(2)

    code_file = sys.argv[1]

    # Execute the user code from /app/user_code.py (mounted file)
    run_user_code()

    # Determine output mode based on a global variable set by user code.
    # Valid values: "static" (default), "interactive" or "3d".
    output_mode = globals().get("output_mode", "static").lower()

    if output_mode == "interactive" or output_mode == "3d":
        result = generate_interactive_chart()
        print(result)  # Print the raw HTML for interactive output.
    else:
        result = generate_static_chart()
        print(result)  # Print the static PNG data URI.

if __name__ == "__main__":
    main()
