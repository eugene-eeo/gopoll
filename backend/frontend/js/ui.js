$.ajaxSetup({
    contentType: "application/json; charset=utf-8",
    dataType: "json",
});


function visit(x) {
    window.location.hash = x;
}


function isLoggedIn() {
    return !!Cookies.get('login');
}


// inject navbar
$.hashroute('middleware', function() {
    var nav = $('nav');
    nav.html('')
       .append($('<a href="#/people">users</a>'));
    if (isLoggedIn()) {
        nav.append($('<a href="#/">dashboard</a>'))
           .append($('<a href="#/logout">logout</a>'));
    } else {
        nav.append($('<a href="#/login">login</a>'));
    }
    this.next();
});


$(document).hashroute('/user/:username', function(e) {
    $.ajax('/api/people/' + e.params.username, {
        success: function(data) {
            $('#content').html(Mustache.render($('#user-template').html(), data));
        },
        error: function(data) {
            $('#content').html('User not found.');
        }
    });
});


$(document).hashroute('/people', function() {
    $.ajax('/api/people', {
        success: function(data) {
            $('#content').html(Mustache.render($('#people-template').html(), {
                people: data
            }));
        },
    });
});


$(document).hashroute('/login', function() {
    if (isLoggedIn()) {
        visit('');
        return;
    }
    var $error = $('<div class="error"></div>');
    var $form = $(
        '<form>' +
        'Username: <input name="username" type="text"/><br/>' +
        'Password: <input name="password" type="password"/><br/>' +
        '<input type="submit" value="log in">' +
        '</form>'
    );
    $form.submit(function(evt) {
        evt.preventDefault();
        var username = $form.find('input[name=username]').val();
        var password = $form.find('input[name=password]').val();
        $.ajax('/api/auth/login', {
            method: 'POST',
            data: JSON.stringify({
                username: username,
                password: password,
            }),
            success: function(data) { visit(''); },
            error: function(data) { data['error'] && $error.text(data['error']); },
        });
    });
    $('#content').html('')
        .append($error)
        .append($form);
});


$(document).hashroute('/logout', function() {
    Cookies.remove('login');
    visit('');
});


$(document).hashroute('/', function() {
    $.ajax('/api/auth/me', {
        success: function(data) {
            var tmpl = $('#dashboard-template').html();
            $('#content').html(Mustache.render(tmpl, data));
        },
        error: function(data) { visit('login'); }
    });
});

$(document).hashroute('/poll/:id', function(e) {
    $.ajax('/api/poll/' + e.params.id, {
        success: function(data) {
            var tmpl = $('#poll-template').html();
            $('#content').html(Mustache.render(tmpl, data));
        },
        error: function(data) { $('#content').html('Poll not found.'); }
    });
});
