from requests import Session
u = 'http://localhost:3000'
s = Session()

# POST /people
r = s.post(u + '/people', json={'username': 'eeo', 'password': 'abc', 'forename': 'jun', 'surname': 'eeo'})
assert r.status_code == 200
assert r.json()

r = s.post(u + '/people', json={'username': 'eeo', 'password': 'abc', 'forename': 'jun', 'surname': 'eeo'})
assert r.status_code == 400

# GET /people
r = s.get(u + '/people')
assert r.status_code == 200
assert len(r.json()) == 2
assert {u['username'] for u in r.json()} == {'eeo', 'doctorwhocomposer'}

# GET /people/:username
r = s.get(u + '/people/eeo')
assert r.status_code == 200
assert r.json()['username'] == 'eeo'
assert 'password' not in r.json()

# POST /auth/login
r = s.post(u + '/auth/login', json={'username': 'eeo', 'password': 'bad'})
assert r.status_code != 200
assert not s.cookies

r = s.post(u + '/auth/login', json={'username': 'eeo', 'password': 'abc'})
assert r.status_code == 200
assert r.json()
assert s.cookies['login']

# repeat login
r = s.post(u + '/auth/login', json={'username': 'eeo', 'password': 'bad'})
assert r.status_code == 400
assert r.json()
assert s.cookies['login']

# POST /poll/ multi=False
r = s.post(u + '/poll/', json={
    'name': 'exclusive',
    'description': 'exclusive poll',
    'multi': False,
})
assert r.status_code == 200
assert r.json()['id'] == 1

# POST /poll/ multi=True
r = s.post(u + '/poll/', json={
    'name': 'non-exclusive',
    'description': 'non-exclusive poll',
    'multi': True,
})
assert r.status_code == 200
assert r.json()['id'] == 2

# PUT /poll/
r = s.put(u + '/poll/1', json={
    'name': 'exclusive',
    'description': 'exclusive poll',
    'options': [
        {'id': 1, 'name': 'one'},
        {'id': 2, 'name': 'two'},
    ],
})
assert r.status_code == 200
assert {opt['id'] for opt in s.get(u + '/poll/1').json()['votes']} == {1, 2}

assert s.post(u + '/poll/1/option/1').status_code == 200 # first vote ok
assert s.post(u + '/poll/1/option/1').status_code == 401 # 2nd vote not ok
assert s.post(u + '/poll/1/option/2').status_code == 401 # cannot vote 2nd option
assert s.delete(u + '/poll/1/option/2').status_code == 404
assert s.delete(u + '/poll/1/option/1').status_code == 200
assert s.post(u + '/poll/1/option/1').status_code == 200

# check that vote counting is ok
r = s.get(u + '/poll/1')
assert r.status_code == 200
assert r.json()['votes'][0]['num'] == 1
assert r.json()['votes'][1]['num'] == 0

# modify poll options
r = s.put(u + '/poll/1', json={
    'name': 'exclusive',
    'description': 'exclusive poll',
    'options': [
        {'id': 2, 'name': 'two'},
        {'id': 1, 'name': 'uno'},
        {'id': 3, 'name': 'three'},
    ],
})

# check that its ok
r = s.get(u + '/poll/1')
assert r.status_code == 200
assert r.json()['votes'][0]['num'] == 0
assert r.json()['votes'][1]['num'] == 1
assert r.json()['votes'][0]['name'] == 'two'
assert r.json()['votes'][1]['name'] == 'uno'
assert r.json()['votes'][2]['name'] == 'three'

# POST /auth/logout
r = s.post(u + '/auth/logout')
assert r.status_code == 200
assert 'login' not in s.cookies
