window.current_user = null;
window.done = false;

$.ajaxSetup({ contentType: "application/json; charset=utf-8", dataType: "json" });


function visit(x) {
    window.location.hash = x;
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
    var nav = $('nav');
    nav.html('')
       .append($('<a href="#/people">users</a>'));
    if (window.current_user) {
        nav.append($('<a href="#/">dashboard</a>'))
           .append($('<a href="#/create-poll">create poll</a>'))
           .append($('<a href="#/logout">logout</a>'));
    } else {
        nav.append($('<a href="#/login">login</a>'));
    }
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


$(document).hashroute('/login', function() {
    if (window.current_user) {
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
            success: function(user) {
                window.current_user = user;
                visit('');
            },
            error: function(data) { data['error'] && $error.text(data['error']); },
        });
    });
    $('#content').html('')
        .append($error)
        .append($form);
});


$(document).hashroute('/logout', function() {
    Cookies.remove('token');
    window.current_user = null;
    visit('');
});


$(document).hashroute('/', function() {
    $.ajax('/api/auth/me', {
        success: function(data) {
            function trim(poll) {
                if (poll.description.length > 190) {
                    poll.description = poll.description.substr(0, 187) + '...';
                }
            }
            window.current_user = data;
            data.polls_created.forEach(trim);
            data.polls_participated.forEach(trim);
            $('#content').html(Mustache.render(Templates.dashboard, data));
        },
        error: function(data) {
            visit('/login');
        }
    });
});

$(document).hashroute('/poll/:id', function(e) {
    function make_comment(json) {
        $.ajax('/api/comment/', {
            method: 'POST',
            data: JSON.stringify(json),
            success: function() { reload(); },
            error: function(data) { reload(); },
        });
    }

    function render_comment($el, comment) {
        comment.repliable = window.current_user !== null;
        comment.deletable = window.current_user && comment.user.username === window.current_user.username;
        var $comment = $(Mustache.render(Templates.comment, comment));
        $el.append($comment);
        comment.comments.forEach(function(reply) {
            render_comment($comment, reply);
        });
    }

    function reload() {
        $.ajax('/api/poll/' + e.params.id, {
            success: function(poll) {
                poll.editable = window.current_user && poll.user.username === window.current_user.username;
                $('#content').html(Mustache.render(Templates.poll, poll));
                poll.comments.forEach(function(comment) { render_comment($('#content'), comment); });
                // reply to main poll thread
                $('#content').find('.comment-box-submit').click(function(e) {
                    e.preventDefault();
                    var $el = $('#content').find('#comment-box');
                    var text = $el.find('[name=text]').val();
                    if (text.length > 0) {
                        make_comment({
                            text: text,
                            poll_id: poll.id,
                        });
                    }
                });

                $('#content').find('.add-vote').click(function(e) {
                    var id = $(this).data('id');
                    $.ajax('/api/poll/' + poll.id + '/option/' + id, {
                        method: 'POST',
                        success: function() { reload(); },
                        error: function(data) { reload(); },
                    });
                });

                $('#content').find('.add-unvote').click(function(e) {
                    var id = $(this).data('id');
                    $.ajax('/api/poll/' + poll.id + '/option/' + id, {
                        method: 'DELETE',
                        success: function() { reload(); },
                        error: function(data) { reload(); },
                    });
                });

                $('.comment-delete').click(function(e) {
                    var $this = $(this);
                    var $panel = $this.parent();
                    var id = $panel.data('comment-id');
                    $.ajax('/api/comment/' + id, {
                        method: 'DELETE',
                        success: reload,
                        error: reload,
                    });
                });

                $('.comment-reply').click(function(e) {
                    var $this = $(this);
                    var $panel = $this.parent();
                    var id = $panel.data('comment-id');

                    var $div = $('<div class="comment-reply-dialog">');
                    $div.append($('<textarea class="comment-reply-text"/>'))
                        .append($('<button class="save">save</button>'))
                        .append($('<button class="cancel">cancel</button>'));
                    $div.find('.save').click(function() {
                        var text = $div.find('.comment-reply-text').val();
                        if (text.length > 0) {
                            make_comment({text: text, reply_to: id});
                            $div.remove();
                        }
                    });
                    $div.find('.cancel').click(function() {
                        $div.remove();
                    });

                    $panel.append($div);
                });
            },
            error: function(data) { $('#content').html('Poll not found.'); }
        });
    }

    reload();
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
        $div.find('button').click(function() { $div.remove(); });
        $parent.append($div);
    }

    $.ajax('/api/poll/' + e.params.id, {
        success: function(poll) {
            if (!window.current_user) return visit('#/login');
            if (poll.user.username !== window.current_user.username) return visit('');
            $('#content').html(Mustache.render(Templates.edit_poll, poll));

            var $opts = $('#content').find('#edit-poll-options');
            var id = 1;

            poll.votes.forEach(function(vote) {
                render_option($opts, vote);
                id = Math.max(id, vote.id);
            });

            $('#content').find('#add-option').click(function() {
                var $name = $('[name=add-poll-option]');
                var name = $name.val();
                if (name.length > 0) {
                    id++;
                    render_option($opts, {id: id, name: name});
                    $name.val('');
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
