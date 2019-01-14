const { watch } = require('fs');
const { spawnSync } = require('child_process');

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

watch('./frontend/js', {recursive: true}, debounce((eventType, filename) => {
    if (filename !== "dist.js") {
        spawnSync('make', ['concat'], {
            stdio: ['inherit', 'inherit', 'inherit'],
        });
    }
}, 100, false));
