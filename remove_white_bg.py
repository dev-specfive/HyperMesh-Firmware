#!/usr/bin/env python3
"""
Remove white background from specfive_trekker_bravo.png and make it transparent.
Uses a threshold so only near-white pixels become transparent (preserves cream/beige device).
"""

try:
    from PIL import Image
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def remove_white_background(input_path: str, output_path: str, threshold: int = 250) -> None:
    """Make white and near-white pixels transparent."""
    img = Image.open(input_path)
    img = img.convert("RGBA")
    data = list(img.getdata())

    new_data = []
    for item in data:
        r, g, b, a = item
        # Only make pixels transparent if they are very close to white
        # (so we don't remove cream/beige parts of the device)
        if r >= threshold and g >= threshold and b >= threshold:
            new_data.append((r, g, b, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved: {output_path}")

if __name__ == "__main__":
    remove_white_background(
        "specfive_trekker_bravo.png",
        "specfive_trekker_bravo.png",  # overwrite
        threshold=250,
    )
