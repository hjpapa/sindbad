from pathlib import Path
from hashlib import sha256
import json,sys
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
path=ROOT/f'art-source/webtoon/generated/spirit-m6/spirit-actions-{sys.argv[1]}.png'
data={'tool':'OpenAI built-in imagegen','date':'2026-10-06','toolPath':sys.argv[2],
      'reference':'art-source/webtoon/hero-webtoon.webp (project original style only)',
      'prompt':sys.argv[3],'status':sys.argv[4],'sha256':sha256(path.read_bytes()).hexdigest(),
      'nativeSize':list(Image.open(path).size),'artStatus':'ART_DRAFT'}
path.with_suffix('.json').write_bytes((json.dumps(data,indent=2)+'\n').encode('utf-8'))
