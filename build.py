#!/usr/bin/env python3
"""Build kid + parent pages for every YYYY-MM-DD/quiz.json and the root index.
Usage: python3 build.py   (then publish changed files, see README.md)"""
import json, glob, html, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
E = html.escape
KID = """<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>{child} Math Quiz {date}</title><link rel="stylesheet" href="../assets/quiz.css?v=4"></head><body>
<script>window.QUIZ={data};</script><script src="../assets/quiz.js?v=4"></script></body></html>
"""
packs = []
for f in sorted(glob.glob('20??-??-??/quiz.json')):
    d = json.load(open(f, encoding='utf-8')); day = os.path.dirname(f)
    kid = {k: d[k] for k in ('date', 'child', 'topic', 'level')}
    kid['questions'] = d['questions']  # MC: answers/explanations shown only after submit
    open(f'{day}/index.html', 'w', encoding='utf-8').write(KID.format(child=E(d['child']), date=d['date'],
        data=json.dumps(kid, ensure_ascii=False).replace('</', '<\\/')))
    qs = ''.join(f"""<div class="q"><h3>Q{d['questions'].index(q)+1} · {E(q['title'])}{' ⭐ Challenge 挑戰題' if q.get('challenge') else ''}</h3><p>{E(q['q'])}</p>
<ol type="A">{''.join(f"<li>{E(q['options'][k])}{' ✔' if k==q['answer'] else ''}</li>" for k in 'ABCD')}</ol>
<p class="a">Answer 答案: {q['answer']} · Level 難度 {q.get('level',d.get('level',''))}{' · Review 複習' if q.get('isReview') else ''}</p><pre>{E(q['explanation'])}</pre>
<p>Wrong options 錯誤選項:<br>{'<br>'.join(f"{k}: {E(v)}" for k,v in q.get('wrong',{}).items())}</p><p class="w">Common mistakes 常見錯誤: {E(q.get('mistakes',''))}</p></div>""" for q in d['questions'])
    fm = '<br>'.join(E(x) for x in d.get('formulas', []))
    open(f'{day}/parent.html', 'w', encoding='utf-8').write(f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Parent · {E(d['child'])} Math {d['date']}</title><style>body{{font-family:-apple-system,"PingFang TC",sans-serif;max-width:900px;margin:auto;padding:16px;line-height:1.7;font-size:18px;color:#333}}
.tip{{background:#fff3e0;border-left:4px solid #ff9f43;padding:10px 14px}}.q{{border:1px solid #eee;border-radius:12px;padding:12px 18px;margin:16px 0;background:#fafafa}}.a{{color:#27ae60;font-weight:700}}.w{{color:#c0392b}}pre{{background:#fff;border:1px solid #ddd;padding:8px;border-radius:8px;white-space:pre-wrap}}</style></head><body>
<h1>Parent version 家長版 · {E(d['child'])} · {d['date']}</h1><p>{E(d.get('topic',''))} · Level {d.get('level','')} · Shanghai G4 / Singapore P4</p><div class="tip">{fm}</div>{qs}
<p>Multiple choice. After submitting, the child taps 複製成績 and pastes into WeChat. Report header: 【Math 成績回報 → 數學家教】</p></body></html>""")
    packs.append((d['date'], d.get('topic', ''), d.get('label', '')))
items = ''.join(f'<a href="{dt}/">{dt}{" ("+E(lb)+")" if lb else ""}<small>{E(t)}</small></a>' for dt, t, lb in sorted(packs, reverse=True))
open('index.html', 'w', encoding='utf-8').write(f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kids Math Packs</title>
<style>body{{font-family:-apple-system,"PingFang TC",sans-serif;max-width:800px;margin:auto;padding:20px;font-size:22px;background:#fff8ec}}a{{display:block;background:#ff9f43;color:#fff;padding:16px;border-radius:14px;text-decoration:none;margin:12px 0}}small{{display:block;font-size:16px}}</style></head><body>
<h1>Seren's Daily Math Quiz ✏️</h1>{items}</body></html>""")
print('built', [p[0] for p in packs])
