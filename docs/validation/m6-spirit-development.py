from pathlib import Path
import json
V=Path('docs/validation')
def read(name):return json.loads((V/name).read_text(encoding='utf-8'))
names=['m6-spirit-target.json']
for name in ('m6-spirit-recheck.json','m6-spirit-recheck2.json'):
    if (V/name).exists():names.append(name)
data={'completedTargetRuns':[{'report':name,'stats':read(name)['stats']} for name in names],
      'firstFailures':'Four failed: three assumed inspect primary button would attack near S06 vine; one expected a hit in the first S03 recovery despite existing prior-hit invulnerability/lightning overlap.',
      'repairs':['Wait for the actual primary action to offer attack before tapping; keyboard attacks still use J.',
                 'Observe actual later cycles when the first cycle is invulnerable; S03 HP observation explicitly includes lightning, not isolated contact damage.',
                 'Require checkpoint resume at the configured x and grounded state.'],
      'secondFailure':'Second target run 3 passed/1 failed: tablet S32 approach momentum crossed the moving spirit, but the test fixed expected left facing. Read actual spirit x after approach and align a second real movement; game AI/physics unchanged.',
      'failureEvidence':['docs/screenshots/m6-spirit/first-target-failure/','docs/screenshots/m6-spirit/second-target-failure/'],
      'runtimeRulesChangedForRepairs':False,'deletedOriginals':False,'artStatus':'ART_DRAFT'}
(V/'m6-spirit-development.json').write_bytes((json.dumps(data,indent=2)+'\n').encode('utf-8'))
print(json.dumps(data['completedTargetRuns']))
