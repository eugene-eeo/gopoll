window.current_user = null;
window.done = false;

$.ajaxSetup({ contentType: "application/json; charset=utf-8", dataType: "json" });


function visit(x) {
    window.location.hash = x;
}


function trim_description(poll) {
    if (poll.description.length > 190) {
        poll.description = poll.description.substr(0, 187) + '...';
    }
}


$.hashroute('middleware', function() {
    if (window.done) return this.next();
    var that = this;

    $.ajax('/api/auth/me', {
      success: function(data) { window.current_user = data; },
      complete: function() {
          window.done = true;
          that.next();
      }
    });
});


// inject navbar
$.hashroute('middleware', function() {
    $('nav').html(Mustache.render(Templates.navbar, {logged_in: !!window.current_user}));
    this.next();
});


$(document).hashroute('/create-poll', function() {
    $('#content').html(Mustache.render(Templates.create_poll));
    $('#content').find('#create').click(function(e) {
        e.preventDefault();
        var name = $('[name=name]').val();
        var desc = $('[name=description]').val();
        var multi = $('[name=multi]').prop('checked');
        var ok = true;
        $('#errors').html('');
        if (name.length === 0) {
            ok = false;
            $('#errors').append($('<span>Name cannot be empty</span>'));
        }
        if (desc.length === 0) {
            ok = false;
            $('#errors').append($('<span>Description cannot be empty</span>'));
        }
        if (!ok) return;
        $.ajax('/api/poll', {
            method: 'POST',
            data: JSON.stringify({
                name: name,
                description: desc,
                multi: multi,
            }),
            success: function(poll) {
                visit('/poll/' + poll.id);
            },
            error: function() {
                $('#errors').append($('<span>Cannot create poll</span>'));
            }
        });
    });
});


$(document).hashroute('/user/:username', function(e) {
    $.ajax('/api/people/' + e.params.username, {
        success: function(data) {
            $('#content').html(Mustache.render(Templates.user, data));
        },
        error: function(data) {
            $('#content').html('User not found.');
        }
    });
});


$(document).hashroute('/people', function() {
    $.ajax('/api/people', {
        success: function(data) {
            $('#content').html(Mustache.render(Templates.people, {
                people: data
            }));
        },
    });
});


$(document).hashroute('/register', function() {
    if (window.current_user) {
        visit('');
        return;
    }
    $('#content').html(Mustache.render(Templates.register));
    $('#content').find('#register').submit(function(evt) {
        evt.preventDefault();
        var $form = $('#register');
        var $errors = $('#errors').html('');
        var errors = [];
        var forename        = $form.find('[name=forename]').val();
        var surname         = $form.find('[name=surname]').val();
        var username        = $form.find('[name=username]').val();
        var password        = $form.find('[name=password]').val();
        var password_repeat = $form.find('[name=password-repeat]').val();

        (forename.length === 0)        && errors.push('First name is empty');
        (surname.length === 0)         && errors.push('Last name is empty');
        (username.length === 0)        && errors.push('Username is empty');
        (password !== password_repeat) && errors.push('Passwords don\'t match');

        if (errors.length !== 0) {
            errors.forEach(function(err) {
                $errors.append($("<span class='error'>"+err+"</span>"));
            });
            return;
        }
        $.ajax('/api/people', {
            method: 'POST',
            data: JSON.stringify({
                forename: forename,
                surname: surname,
                username: username,
                password: password,
            }),
            success: function() { visit('login'); },
            error: function(e) {
                if (e.responseJSON) {
                    var err = e.responseJSON.error;
                    $errors.append($("<span class='error'>"+err+"</span>"));
                }
            },
        });
    });
});


$(document).hashroute('/login', function() {
    if (window.current_user) {
        visit('');
        return;
    }
    $('#content').html(Mustache.render(Templates.login));
    $('#content').find('#register').click(function(e) {
        e.preventDefault();
        visit('/register');
    });
    $('#content').find('#login').submit(function(evt) {
        evt.preventDefault();
        var $form = $('#login');
        var $errors = $('#errors').html('');
        var username = $form.find('input[name=username]').val();
        var password = $form.find('input[name=password]').val();
        $.ajax('/api/auth/login', {
            method: 'POST',
            data: JSON.stringify({
                username: username,
                password: password,
            }),
            success: function(user) {
                window.current_user = user;
                visit('');
            },
            error: function(e) {
                var json = e.responseJSON;
                json && json['error'] && $errors.html("<span class='error'>"+json['error']+"</span>");
            },
        });
    });
});


$(document).hashroute('/logout', function() {
    Cookies.remove('token');
    window.current_user = null;
    visit('');
});


$(document).hashroute('/', function() {
    $.ajax('/api/auth/me', {
        success: function(data) {
            window.current_user = data;
            data.polls_created.forEach(trim_description);
            data.polls_participated.forEach(trim_description);
            $('#content').html(Mustache.render(Templates.dashboard, data));
        },
        error: function(data) {
            visit('/login');
        }
    });
});

$(document).hashroute('/poll/:id', function reload(e) {
    function dump_in_errors(r) {
        if (r.responseJSON) {
            var err = r.responseJSON.error;
            $('#errors').html($("<span class='error'>"+err+"</span>"));
        }
    }

    function make_comment($parent, json, done) {
        $.ajax('/api/comment/', {
            method: 'POST',
            data: JSON.stringify(json),
            success: function(data) {
                render_comment($parent, data);
                done && done();
            },
            error: dump_in_errors,
        });
    }

    function render_comment($el, comment) {
        comment.repliable = window.current_user !== null;
        comment.deletable = window.current_user && comment.user.username === window.current_user.username;
        var $comment = $(Mustache.render(Templates.comment, comment));
        var $list = $comment.children('.comment-children');
        $el.append($comment);
        comment.comments.forEach(function(reply) {
            render_comment($list, reply);
        });
    }

    $.ajax('/api/poll/' + e.params.id, {
        success: function(poll) {
            poll.editable = window.current_user && poll.user.username === window.current_user.username;
            $('#content').html(Mustache.render(Templates.poll, poll));
            poll.comments.forEach(function(comment) { render_comment($('#comments'), comment); });
            // reply to main poll thread
            $('#content').find('.comment-box-submit').click(function(e) {
                e.preventDefault();
                var $textbox = $('#comment-box > textarea[name=text]');
                var text = $textbox.val();
                if (text.length > 0) {
                    make_comment(
                        $('#comments'),
                        {text: text, poll_id: poll.id},
                        function() { $textbox.val(''); },
                    );
                }
            });

            $('#content').find('.add-vote').click(function() {
                var $this = $(this);
                var id = $this.data('id');
                $.ajax('/api/poll/' + poll.id + '/vote/' + id, {
                    method: 'POST',
                    success: function() { reload(e); },
                    error: dump_in_errors,
                });
            });

            $('#content').find('.add-unvote').click(function() {
                var $this = $(this);
                var id = $this.data('id');
                $.ajax('/api/poll/' + poll.id + '/vote/' + id, {
                    method: 'DELETE',
                    success: function() { reload(e); },
                    error: dump_in_errors,
                });
            });

            $('#comments').on('click', '.comment-delete', function(e) {
                var $this = $(this);
                var $panel = $this.parent();
                var id = $panel.data('comment-id');
                $.ajax('/api/comment/' + id, {
                    method: 'DELETE',
                    success: function() { $panel.parent().remove(); },
                    error: dump_in_errors,
                });
            });

            $('#comments').on('click', '.comment-reply', function(e) {
                var $this = $(this);
                var $panel = $this.parent();
                var $comment = $panel.parent();
                var id = $panel.data('comment-id');

                var $div = $('<div class="comment-reply-dialog">');
                $div.append($('<textarea class="comment-reply-text"/>'))
                    .append($('<button class="save">save</button>'))
                    .append($('<button class="cancel">cancel</button>'));
                $div.find('.save').click(function() {
                    var text = $div.children('.comment-reply-text').val();
                    if (text.length > 0) {
                        make_comment($comment.children('.comment-children'), {text: text, reply_to: id});
                        $div.remove();
                    }
                });
                $div.find('.cancel').click(function() {
                    $div.remove();
                });
                $panel.append($div);
            });
        },
        error: function() { $('#content').html('Poll not found.'); }
    });
});


$(document).hashroute('/delete-poll/:id', function(e) {
    $.ajax('/api/poll/' + e.params.id, {
        method: 'DELETE',
        success: function() { visit('') },
        error: function() { visit('') },
    });
});


$(document).hashroute('/edit-poll/:id', function(e) {
    function render_option($parent, option) {
        var $div = $(Mustache.render(Templates.poll_option, option));
        $div.find('button.remove-option').click(function() { $div.remove(); });
        $parent.append($div);
    }

    $.ajax('/api/poll/' + e.params.id, {
        success: function(poll) {
            if (!window.current_user) return visit('/login');
            if (poll.user.username !== window.current_user.username) return visit('');
            $('#content').html(Mustache.render(Templates.edit_poll, poll));

            var $opts = $('#content').find('#edit-poll-options');
            var id = 1;

            poll.votes.forEach(function(vote) {
                render_option($opts, vote);
                id = Math.max(id, vote.id);
            });

            function add_option() {
                var $name = $('#add-poll-option-text');
                var name = $name.val();
                if (name.length > 0) {
                    id++;
                    render_option($opts, {id: id, name: name});
                    $name.val('');
                }
            }

            $('#content').find('#add-option').click(add_option);
            $('#add-poll-option-text').keypress(function(e) {
                if (e.which === 13) {
                    add_option();
                }
            });

            $('#content').find('#save').click(function() {
                var json = {
                    name:        $('[name=name]').val(),
                    description: $('[name=description]').val(),
                    options:     [],
                };
                if (json.name.length === 0 || json.description.length === 0) return;
                json.options = $('#edit-poll-options').children().map(function() {
                    var $this = $(this);
                    return {
                        id: $this.data('id'),
                        name: $this.find('input').val(),
                    };
                }).get();
                $.ajax('/api/poll/' + poll.id, {
                    method: 'PUT',
                    data: JSON.stringify(json),
                    success: function() { visit('/poll/' + poll.id); },
                    error:   function(e) { console.log(e); }
                });
            });
        },
    });
});


$(document).hashroute('/search', function() {
    $('#content').html(Mustache.render(Templates.search, {}));
    $('#content').find('#search-form').submit(function(e) {
        e.preventDefault();
        let q = $('input[name=q]').val();
        let include_users = $('input[name=include_users]').prop('checked');
        let include_polls = $('input[name=include_polls]').prop('checked');
        if (q.length === 0 || (!include_users && !include_polls)) {
            return;
        }
        $.ajax('/api/search', {
            method: 'POST',
            data: JSON.stringify({q: q, include_users: include_users, include_polls: include_polls}),
            success: function(data) {
                data.polls.forEach(trim_description);
                $('#results').html(Mustache.render(Templates.search_results, {
                    has_results: (data.polls.length > 0) || (data.users.length > 0),
                    users: data.users,
                    polls: data.polls,
                }));
            },
        })
    });
});
