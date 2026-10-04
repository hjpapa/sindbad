from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
p=ROOT/'PROJECT_STATUS.md';s=p.read_text(encoding='utf-8');start='<!-- M6_KITE_STATUS_START -->';end='<!-- M6_KITE_STATUS_END -->'
assert s.count(start)==s.count(end)==1
chunk=(ROOT/'docs/validation/m6-kite-status-final.md').read_text(encoding='utf-8').rstrip()
p.write_bytes((s[:s.index(start)]+chunk+s[s.index(end)+len(end):]).encode('utf-8'))
