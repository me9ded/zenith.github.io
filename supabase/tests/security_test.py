"""Security tests for the shared sketchbook.

Runs against the LOCAL Supabase stack only (`supabase start`), never the real
project: it creates throwaway accounts and resets the members table.

    supabase start
    python3 supabase/tests/security_test.py

Exercises the real API (auth, database, storage) as an anonymous visitor,
the two members, and a signed-in stranger. Nothing here trusts the page.
"""
import json, os, subprocess, time, uuid, urllib.request, urllib.error, struct, zlib

ENV = json.loads(subprocess.check_output(['supabase', 'status', '-o', 'json'], cwd=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), stderr=subprocess.DEVNULL))
API = ENV['API_URL']
assert API.startswith('http://127.0.0.1') or API.startswith('http://localhost'), 'local stack only'
ANON = ENV['ANON_KEY']
SERVICE = ENV['SERVICE_ROLE_KEY']
MAILPIT = ENV['MAILPIT_URL']

results = []
def check(name, cond, info=''):
    results.append(('PASS' if cond else 'FAIL', name, '' if cond else str(info)[:300]))

def req(method, path, token=None, body=None, headers=None, raw=None, key=ANON):
    h = {'apikey': key}
    if token: h['Authorization'] = 'Bearer ' + token
    data = None
    if raw is not None:
        data = raw
    elif body is not None:
        data = json.dumps(body).encode(); h['Content-Type'] = 'application/json'
    h.update(headers or {})
    r = urllib.request.Request(API + path, data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(r) as resp:
            txt = resp.read()
            return resp.status, (json.loads(txt) if txt and resp.headers.get('Content-Type', '').startswith('application/json') else txt)
    except urllib.error.HTTPError as e:
        txt = e.read()
        try: return e.code, json.loads(txt)
        except Exception: return e.code, txt

def png(w=8, h=8, pad=0):
    raw = b''.join(b'\x00' + b'\xff\x80\x80' * w for _ in range(h))
    def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    body = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw))
    if pad: body += chunk(b'tEXt', b'x\x00' + os.urandom(pad))
    return body + chunk(b'IEND', b'')

def admin_user(email, password):
    s, b = req('POST', '/auth/v1/admin/users', token=SERVICE, key=SERVICE, body={'email': email, 'password': password, 'email_confirm': True})
    assert s in (200, 201), (s, b)
    return b['id']

def password_login(email, password):
    s, b = req('POST', '/auth/v1/token?grant_type=password', body={'email': email, 'password': password})
    assert s == 200, (s, b)
    return b['access_token']

def upload(token, path, data, ctype='image/png', upsert='false'):
    return req('POST', '/storage/v1/object/sketchbook/' + path, token=token, raw=data, headers={'Content-Type': ctype, 'x-upsert': upsert})

run = uuid.uuid4().hex[:6]
A_EMAIL, B_EMAIL, C_EMAIL = f'zenith-{run}@example.test', f'amine-{run}@example.test', f'stranger-{run}@example.test'
PW = 'test-only-' + uuid.uuid4().hex

# clean slate for members (local test db only)
req('DELETE', '/rest/v1/sketchbook_members?user_id=not.is.null', token=SERVICE, key=SERVICE)

A = admin_user(A_EMAIL, PW); B = admin_user(B_EMAIL, PW); C = admin_user(C_EMAIL, PW)
s, b = req('POST', '/rest/v1/sketchbook_members', token=SERVICE, key=SERVICE, body=[{'user_id': A, 'display_name': 'zenith'}, {'user_id': B, 'display_name': 'amine'}])
check('admin can add the two members', s == 201, (s, b))
tA, tB, tC = password_login(A_EMAIL, PW), password_login(B_EMAIL, PW), password_login(C_EMAIL, PW)

# --- membership is fixed ---
s, b = req('POST', '/rest/v1/sketchbook_members', token=SERVICE, key=SERVICE, body={'user_id': C, 'display_name': 'third'})
check('a third member is refused, even by the admin', s >= 400 and 'two members' in json.dumps(b), (s, b))
s, b = req('POST', '/rest/v1/sketchbook_members', token=tC, body={'user_id': C, 'display_name': 'me'})
check('a stranger cannot add themselves', s in (401, 403), (s, b))
s, b = req('POST', '/rest/v1/sketchbook_members', token=tA, body={'user_id': C, 'display_name': 'friend'})
check('a member cannot add someone either', s in (401, 403), (s, b))
s, b = req('POST', '/rest/v1/rpc/is_sketchbook_member', token=tA, body={})
check('is_sketchbook_member: true for a member', s == 200 and b is True, (s, b))
s, b = req('POST', '/rest/v1/rpc/is_sketchbook_member', token=tC, body={})
check('is_sketchbook_member: false for a stranger', s == 200 and b is False, (s, b))
s, b = req('POST', '/rest/v1/rpc/is_sketchbook_member', body={})
check('is_sketchbook_member: not callable anonymously', s in (401, 403, 404), (s, b))

# --- uploads ---
pA = f'{A}/{uuid.uuid4()}.png'
s, b = upload(tA, pA, png())
check('member uploads a PNG into her own folder', s == 200, (s, b))
s, b = upload(tA, pA, png(), upsert='true')
check('an upload can never overwrite an existing image', s >= 400, (s, b))
s, b = upload(tA, f'{B}/{uuid.uuid4()}.png', png())
check("member cannot upload into the other member's folder", s >= 400, (s, b))
s, b = upload(tA, f'{A}/{uuid.uuid4()}.png', b'<html>not an image</html>', ctype='text/html')
check('non-PNG content types are refused', s >= 400, (s, b))
s, b = upload(tA, f'{A}/{uuid.uuid4()}.png', png(pad=3_300_000))
check('files over 3 MB are refused', s >= 400, (s, b))
s, b = upload(tA, f'{A}/notes.png', png())
check('object names must be <uid>/<uuid>.png', s >= 400, (s, b))
s, b = upload(tC, f'{C}/{uuid.uuid4()}.png', png())
check('a stranger cannot upload at all', s >= 400, (s, b))
s, b = upload(None, f'{A}/{uuid.uuid4()}.png', png())
check('an anonymous visitor cannot upload', s >= 400, (s, b))

# --- shared rows ---
s, b = req('POST', '/rest/v1/shared_drawings', token=tA, body={'object_path': pA, 'title': 'a flower', 'width': 8, 'height': 8, 'created_at': '2001-01-01T00:00:00Z'}, headers={'Prefer': 'return=representation'})
check('member shares her uploaded drawing', s == 201, (s, b))
row = b[0] if s == 201 else {}
check('share date is set by the server, not the page', row.get('created_at', '').startswith(time.strftime('%Y')), row.get('created_at'))
check('owner defaults to the signed-in member', row.get('owner_id') == A, row)
s, b = req('POST', '/rest/v1/shared_drawings', token=tA, body={'object_path': f'{A}/{uuid.uuid4()}.png', 'width': 8, 'height': 8})
check('a row is refused when no image was uploaded', s >= 400, (s, b))
pB = f'{B}/{uuid.uuid4()}.png'; upload(tB, pB, png())
s, b = req('POST', '/rest/v1/shared_drawings', token=tA, body={'object_path': pB, 'owner_id': B, 'width': 8, 'height': 8})
check("member cannot share in the other member's name", s >= 400, (s, b))
s, b = req('POST', '/rest/v1/shared_drawings', token=tC, body={'object_path': pA, 'width': 8, 'height': 8})
check('a stranger cannot create rows', s >= 400, (s, b))
s, b = req('PATCH', f'/rest/v1/shared_drawings?id=eq.{row.get("id")}', token=tA, body={'title': 'changed'}, headers={'Prefer': 'return=representation'})
check('shared drawings cannot be edited', s >= 400 or b == [], (s, b))

# --- who can see what ---
s, b = req('GET', '/rest/v1/shared_drawings?select=*', token=tB)
check('the other member sees the shared drawing', s == 200 and any(r['id'] == row.get('id') for r in b), (s, b))
s, b = req('GET', '/rest/v1/shared_drawings?select=*', token=tC)
check('a stranger sees no drawings', s == 200 and b == [], (s, b))
s, b = req('GET', '/rest/v1/shared_drawings?select=*')
check('an anonymous visitor sees no drawings', s in (401, 403) or b == [], (s, b))
s, b = req('GET', '/rest/v1/sketchbook_members?select=*', token=tC)
check('a stranger cannot list the members', s == 200 and b == [], (s, b))
s, b = req('GET', '/rest/v1/sketchbook_members?select=*')
check('an anonymous visitor cannot list the members', s in (401, 403) or b == [], (s, b))

s, b = req('POST', f'/storage/v1/object/sign/sketchbook/{pA}', token=tB, body={'expiresIn': 300})
check('the other member can get a signed link', s == 200 and 'signedURL' in b, (s, b))
if s == 200:
    s2, img = req('GET', '/storage/v1' + b['signedURL'])
    check('...and the image loads through it', s2 == 200 and isinstance(img, bytes) and img[:4] == b'\x89PNG', s2)
s, b = req('POST', f'/storage/v1/object/sign/sketchbook/{pA}', token=tC, body={'expiresIn': 300})
check('a stranger cannot get a signed link', s >= 400, (s, b))
s, b = req('POST', f'/storage/v1/object/sign/sketchbook/{pA}', body={'expiresIn': 300})
check('an anonymous visitor cannot get a signed link', s >= 400, (s, b))
s, b = req('GET', f'/storage/v1/object/sketchbook/{pA}', token=tC)
check('a stranger cannot download the image', s >= 400, (s, b))
s, b = req('GET', f'/storage/v1/object/public/sketchbook/{pA}')
check('the bucket has no public URLs', s >= 400, (s, b))
s, b = req('GET', f'/storage/v1/object/authenticated/sketchbook/{pA}')
check('an anonymous visitor cannot download the image', s >= 400, (s, b))
s, b = req('POST', '/storage/v1/object/list/sketchbook', token=tC, body={'prefix': A})
check('a stranger cannot list files', s >= 400 or b == [], (s, b))

s, b = req('POST', f'/storage/v1/object/sign/sketchbook/{pA}', token=tA, body={'expiresIn': 2})
time.sleep(3)
s2, _ = req('GET', '/storage/v1' + b['signedURL'])
check('signed links really expire', s2 >= 400, s2)

# --- deleting ---
s, b = req('DELETE', f'/rest/v1/shared_drawings?id=eq.{row.get("id")}', token=tB, headers={'Prefer': 'return=representation'})
check("the other member cannot unshare someone else's drawing", s == 200 and b == [], (s, b))
s, b = req('DELETE', '/storage/v1/object/sketchbook', token=tB, body={'prefixes': [pA]})
check("the other member cannot delete someone else's image", s == 200 and b == [], (s, b))
s, b = req('DELETE', f'/rest/v1/shared_drawings?id=eq.{row.get("id")}', token=tC, headers={'Prefer': 'return=representation'})
check('a stranger cannot delete rows', s >= 400 or b == [], (s, b))
s, b = req('DELETE', '/storage/v1/object/sketchbook', token=tC, body={'prefixes': [pA]})
check('a stranger cannot delete images', s >= 400 or b == [], (s, b))
s, b = req('DELETE', '/storage/v1/object/sketchbook', token=tA, body={'prefixes': [pA]})
check('the owner deletes her image', s == 200 and len(b) == 1, (s, b))
s, b = req('DELETE', f'/rest/v1/shared_drawings?id=eq.{row.get("id")}', token=tA, headers={'Prefer': 'return=representation'})
check('...and unshares the drawing', s == 200 and len(b) == 1, (s, b))
s, b = req('GET', '/rest/v1/shared_drawings?select=id', token=tB)
check('it is gone for the other member too', s == 200 and all(r['id'] != row.get('id') for r in b), (s, b))

# --- email sign-in: real OTP through the local inbox, no new accounts ---
urllib.request.urlopen(urllib.request.Request(MAILPIT + '/api/v1/messages', method='DELETE'))
s, b = req('POST', '/auth/v1/otp', body={'email': A_EMAIL, 'create_user': False})
check('a member can request a sign-in code', s == 200, (s, b))
time.sleep(1.5)
msgs = json.loads(urllib.request.urlopen(MAILPIT + '/api/v1/messages').read())['messages']
code = None
if msgs:
    m = json.loads(urllib.request.urlopen(MAILPIT + '/api/v1/message/' + msgs[0]['ID']).read())
    import re
    found = re.findall(r'\b(\d{6})\b', m.get('Text', '') + m.get('HTML', ''))
    code = found[0] if found else None
check('the email contains a 6-digit code', bool(code), msgs[:1])
if code:
    s, b = req('POST', '/auth/v1/verify', body={'email': A_EMAIL, 'token': code, 'type': 'email'})
    check('the code signs her in', s == 200 and b.get('access_token'), (s, b))
    s, b = req('POST', '/auth/v1/verify', body={'email': A_EMAIL, 'token': code, 'type': 'email'})
    check('a code works only once', s >= 400, (s, b))
s, b = req('POST', '/auth/v1/otp', body={'email': f'nobody-{run}@example.test', 'create_user': False})
check('unknown emails cannot create an account', s >= 400, (s, b))
s, b = req('POST', '/auth/v1/signup', body={'email': f'nobody2-{run}@example.test', 'password': PW})
check('public sign-up is disabled', s >= 400, (s, b))

for st, name, info in results:
    print(st, name, ('  [' + info + ']') if info else '')
print(sum(r[0] == 'PASS' for r in results), 'pass /', sum(r[0] == 'FAIL' for r in results), 'fail')
