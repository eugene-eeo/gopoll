function ngrams(s) {
    s = '$' + s.toLowerCase() + '$';
    const rv = [];
    for (let i = 1; i < s.length; i++) {
        rv.push(s[i-1] + '' + s[i]);
    }
    return rv;
}


function jaccard(a, b) {
    const m = {};
    a.forEach(x => { m[x] = 0; });
    b.forEach(x => {
        if (x in m) {
            m[x]++;
        }
    });
    const s = Object.values(m).reduce((a, b) => a + b);
    return s / (a.length + b.length - s);
}


function search(haystack, attrs, query) {
    const a = ngrams(query);
    const h = [];
    haystack.forEach(x => {
        let score = 0;
        attrs.forEach((attr) => {
            score += jaccard(a, ngrams(x[attr]))
        });
        if (score > 0) {
            h.push([score, x]);
        }
    });
    h.sort((a, b) =>
        a[0] > b[0] ? -1
        : a[0] < b[0] ? 1
        : 0
    );
    return h.splice(0, 10).map(([_, x]) => x);
}


module.exports = search;
