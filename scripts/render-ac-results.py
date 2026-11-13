"""Render curated assertion-level AC evidence. Never infer execution from planned IDs.
The JSON is the reviewed canonical mapping; changes require actual assertion inspection.
"""
from pathlib import Path
import json
base = Path('docs/deliverable-1')
j = json.loads((base / 'release-ac-results.json').read_text())
rows = j['acceptanceCriteria']
assert len(rows) == len({a['id'] for a in rows}) == 113
original = json.loads(Path('docs/sprints/sprint-1/issue-22-coverage.json').read_text())
planned = {a['id']: a['plannedCases'] for a in original['acceptanceCriteria']}
for a in rows:
    assert a['plannedTests'] == planned[a['id']], a['id']
    for e in a['actual']:
        assert Path(e['file']).exists(), e['file']
        if 'lines' in e:
            lines = Path(e['file']).read_text().splitlines()
            start, end = e['lines']
            assert 1 <= start <= end <= len(lines)
            assert e['case'] in '\n'.join(lines[start - 1:end]), (a['id'], e['case'])
old = (base / 'release-ac-results.md').read_text()
intro = old[:old.index('## AC-F01-01')].rstrip()
lines = [intro, '']
for a in rows:
    lines += ['## ' + a['id'], a['requirement'], '', '**Planned STS:** ' + ', '.join(a['plannedTests'])]
    for e in a['actual']:
        kind = e['kind']
        label = 'PROCESS' if kind.startswith('Process') else 'HISTORICAL G04' if kind.startswith('Historical') else 'POST' if kind.startswith('Additional') else 'MAIN'
        loc = e['file'] + (':' + str(e['lines'][0]) + '-' + str(e['lines'][1]) if 'lines' in e else '')
        lines += ['**' + label + ' source/case:** ' + loc + ' - ' + e['case'], '**Demonstrated:** ' + e['demonstrated']]
    lines += ['**Disposition:** ' + a['result'], '**Remaining limit:** ' + a['limitation'], '']
(base / 'release-ac-results.md').write_text('\n'.join(lines) + '\n')
print('Validated 113 AC, unchanged planned STS mappings, existing sources and exact named callback ranges.')
