from pathlib import Path
v=Path('docs/validation')
text=(v/'m6-siren-finish.py').read_text(encoding='utf-8').replace('m6-siren','m6-bat').replace('siren-m6','bat-m6').replace('siren-actions','bat-actions').replace("('01','02')","('01',)").replace("'units':111","'units':113").replace("'previousCommit':'9727657'","'previousCommit':'934c421'").replace("'push':'blocked by automatic review; explicit payload/destination approval pending'","'push':'not requested this turn; local work'")
(v/'m6-bat-finish.py').write_bytes(text.encode('utf-8'))
text=(v/'m6-siren-archive-reports.py').read_text(encoding='utf-8').replace('m6-siren','m6-bat')
(v/'m6-bat-archive-reports.py').write_bytes(text.encode('utf-8'))
