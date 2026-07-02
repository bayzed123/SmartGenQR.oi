import os
import re

ROOT = "."

modified = 0
skipped = 0
errors = 0

START_PATTERN = re.compile(
    r'<section\s+class="seo-content-container"[^>]*>',
    re.IGNORECASE
)

for root, dirs, files in os.walk(ROOT):
    for file in files:
        if file.lower() != "index.html":
            continue

        path = os.path.join(root, file)

        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            start_match = START_PATTERN.search(content)

            if not start_match:
                skipped += 1
                continue

            start = start_match.start()

            main_pos = content.find("</main>", start)

            if main_pos == -1:
                skipped += 1
                continue

            last_section = content.rfind("</section>", start, main_pos)

            if last_section == -1:
                skipped += 1
                continue

            end = last_section + len("</section>")

            new_content = content[:start].rstrip() + "\n\n" + content[end:].lstrip()

            if new_content != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)

                print(f"✔ Modified: {path}")
                modified += 1
            else:
                skipped += 1

        except Exception as e:
            print(f"✖ Error: {path}")
            print(e)
            errors += 1

print("\n==============================")
print(f"Modified : {modified}")
print(f"Skipped  : {skipped}")
print(f"Errors   : {errors}")
print("==============================")