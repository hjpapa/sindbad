"""Record the dimensions and hashes of the actual committed illustrations."""
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
files = []
for path in sorted((root / 'public' / 'assets' / 'webtoon').glob('*.webp')):
    with Image.open(path) as illustration:
        illustration.load()
        files.append({
            'path': path.relative_to(root).as_posix(),
            'width': illustration.width,
            'height': illustration.height,
            'bytes': path.stat().st_size,
            'mode': illustration.mode,
            'sha256': sha256(path.read_bytes()).hexdigest(),
            'artStatus': 'ART_DRAFT',
        })
assert len(files) == 25, f'Expected 25 illustrations, got {len(files)}'
output = root / 'docs' / 'validation' / 'illustrations.json'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps({
    'date': datetime.now(timezone.utc).isoformat(),
    'method': 'decode real WebP files with Pillow, record dimensions and SHA256; not animation or visual approval',
    'files': files,
}, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'PASS: decoded {len(files)} real illustrations; {sum(item["bytes"] for item in files):,} bytes.')
