import os
import re

# Root folder (বর্তমান ফোল্ডার)
ROOT = "."

modified = 0
skipped = 0

# যে section থেকে শুরু হবে
START_PATTERN = r'<section\s+class="seo-content-container"'

for root, dirs, files in os.walk(ROOT):
    for file in files:
        if file.lower() != "index.html":
            continue

        path = os.path.join(root, file)

        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            start_match = re.search(START_PATTERN, content)

            if not start_match:
                skipped += 1
                continue

            start = start_match.start()

            # </main> এর আগের শেষ </section> খুঁজবে
            before_main = content.find("</main>", start)

            if before_main == -1:
                skipped += 1
                continue

            last_section = content.rfind("</section>", start, before_main)

            if last_section == -1:
                skipped += 1
                continue

            end = last_section + len("</section>")

            new_content = content[:start] + "\n\n" + content[end:]

            with open(path, "w", encoding="utf-8") as f:
                f.write(new_content)

            print(f"✔ Modified: {path}")
            modified += 1

        except Exception as e:
            print(f"✖ Error: {path}")
            print(e)

print("\n========== DONE ==========")
print(f"Modified : {modified}")
print(f"Skipped  : {skipped}")