function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function queryToRegexp(q) {
    const parts = q.split(/\s+/);
    return new RegExp(parts.map(escapeRegExp).join('[\\w\\s]+'), 'i');
}


function get(obj, selector) {
    selector.split('.').forEach(a => {
        obj = obj[a];
    })
    return obj;
}


function search(haystack, attrs, query) {
    const q = queryToRegexp(query);
    const h = [];
    haystack.forEach(x => {
        let score = 0;
        attrs.forEach((attr) => {
            score += q.test(get(x, attr)) ? 1 : 0;
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
