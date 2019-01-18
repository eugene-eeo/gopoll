function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function queryToRegexp(q) {
    const parts = q.split(/\s+/);
    return new RegExp(parts.map(escapeRegExp).join('[\\w\\s]+'), 'i');
}


function get(obj, selector) {
    return selector.split('.').reduce((obj, a) => obj[a], obj);
}


function search(haystack, attrs, query) {
    const q = queryToRegexp(query);
    const getScore = (x) => attrs.reduce((acc, attr) => acc + q.test(get(x, attr)), 0);
    const desc = (a, b) => (
          a[0] > b[0] ? -1
        : a[0] < b[0] ? 1
        : 0);
    return haystack
      .map(x => [getScore(x), x])
      .filter(([score, _]) => score > 0)
      .sort(desc)
      .splice(0, 10)
      .map(([_, x]) => x);
}


module.exports = search;
