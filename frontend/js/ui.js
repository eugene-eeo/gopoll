window.current_user = null;
window.done = false;

$.ajaxSetup({
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    error: (r) => {
        console.log(r);
        $('#errors').html('');
        if (!r.responseJSON) return;
        if (r.responseJSON.code === 'NEEDS_AUTH') {
            window.current_user = null;
            visit('/login');
            return;
        }
        $('#errors').append($('<span class="error">' + r.responseJSON.error + '</span>'))
    }
});


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
    $.ajax('/auth/me', {
        // here we explicitly ignore error, since we don't want to force login.
        error:   () => {},
        success: (data) => { window.current_user = data; },
        complete: () => {
            window.done = true;
            this.next();
        }
    });
});


// inject navbar
$.hashroute('middleware', function() {
    var context = {
        user: window.current_user,
        logged_in: !!window.current_user,
    };
    $('.ui.vertical.menu').hide();
    $('#mobile-navbar').html(Mustache.render(Templates.mobile_navbar, context));
    $('#navbar').html(Mustache.render(Templates.navbar, context));
    // clear errors
    $('#errors').html('');
    // setup search
    $('.navbar-search').search({
        type: 'category',
        minCharacters: 3,
        apiSettings: {
            url: '/search?q={query}',
            onResponse: res => {
                var r = {results: {}};
                if (res.users.length > 0) r.results.users = {name: 'Users', results: []};
                if (res.polls.length > 0) r.results.polls = {name: 'Polls', results: []};
                if (res.comments.length > 0) r.results.comments = {name: 'Comments', results: []};
                res.users.forEach(user => {
                    r.results.users.results.push({
                        title:       user.username,
                        description: user.forename + ' ' + user.surname,
                        url:         '#/user/' + user.username,
                    });
                });
                res.polls.forEach(poll => {
                    r.results.polls.results.push({
                        title:       poll.name,
                        description: poll.description,
                        url:         '#/poll/' + poll.id,
                    });
                });
                res.comments.forEach(comment => {
                    r.results.comments.results.push({
                        title:       comment.poll.name,
                        description: comment.text,
                        url:         '#/poll/' + comment.poll.id,
                    });
                });
                return r;
            },
        },
    });
    this.next();
});


$(document).hashroute('/create-poll', () => {
    $('#content').html(Mustache.render(Templates.create_poll));
    $('#create-poll-form').form({
        fields: {
            name: ['empty'],
        },
    });
    $('#create-poll-form').submit(function(evt) {
        evt.preventDefault();
        var $this = $(this);
        if (!$this.form('is valid')) return;
        var data = $this.form('get values');
        data.multi = data.multi === 'on';
        $.ajax('/poll', {
            method: 'POST',
            data: JSON.stringify(data),
            success: (poll) => visit('/poll/' + poll.id),
        });
    });
});


$(document).hashroute('/user/:username', (e) => {
    $.ajax('/people/' + e.params.username, {
        success: (data) => $('#content').html(Mustache.render(Templates.user, data))
    });
});


$(document).hashroute('/people', () => {
    $.ajax('/people', {
        success: (people) => {
            $('#content').html(Mustache.render(Templates.people, {
                people: people,
            }));
        },
    });
});


$(document).hashroute('/register', () => {
    if (window.current_user) {
        visit('');
        return;
    }
    $('#content').html(Mustache.render(Templates.register));
    $('#content').find('#register').submit((evt) => {
        evt.preventDefault();
        var $form = $('#register');
        var $errors = $('#errors').html('');
        var errors = [];
        var forename        = $form.find('[name=forename]').val();
        var surname         = $form.find('[name=surname]').val();
        var username        = $form.find('[name=username]').val();
        var password        = $form.find('[name=password]').val();
        var password_repeat = $form.find('[name=password-repeat]').val();

        if (forename.length === 0)        errors.push('First name is empty');
        if (surname.length === 0)         errors.push('Last name is empty');
        if (username.length === 0)        errors.push('Username is empty');
        if (password !== password_repeat) errors.push('Passwords don\'t match');

        if (errors.length > 0) {
            errors.forEach((err) => {
                $errors.append($("<span class='error'>" + err + "</span>"));
            });
            return;
        }
        $.ajax('/people', {
            method: 'POST',
            data: JSON.stringify({
                forename: forename,
                surname: surname,
                username: username,
                password: password,
            }),
            success: () => visit('login'),
        });
    });
});


$(document).hashroute('/login', () => {
    if (window.current_user) {
        visit('');
        return;
    }
    $('#content').html(Mustache.render(Templates.login));
    $('#register').click((evt) => {
        evt.preventDefault();
        visit('/register');
    });
    $('#login').submit((evt) => {
        evt.preventDefault();
        var $form = $('#login');
        var $errors = $('#errors').html('');
        var username = $form.find('input[name=username]').val();
        var password = $form.find('input[name=password]').val();
        $.ajax('/auth/login', {
            method: 'POST',
            data: JSON.stringify({
                username: username,
                password: password,
            }),
            success: (user) => {
                window.current_user = user;
                visit('');
            },
        });
    });
});


$(document).hashroute('/logout', () => {
    $.ajax('/auth/logout', {
        method: 'POST',
        success: () => {
            window.current_user = null;
            visit('');
        },
    });
});


$(document).hashroute('/', () => {
    $.ajax('/auth/me', {
        success: (data) => {
            window.current_user = data;
            var created = data.polls_created.map(x => x.id);
            data.polls_created.forEach(trim_description);
            data.polls_participated = data.polls_participated.filter(x => created.indexOf(x.id) === -1);
            data.polls_participated.forEach(trim_description);
            $('#content').html(Mustache.render(Templates.dashboard, data));
        },
    });
});


$(document).hashroute('/poll/:id', (e) => {
    function make_comment($parent, json, done) {
        $.ajax('/comment/', {
            method: 'POST',
            data: JSON.stringify(json),
            success: (data) => {
                render_comment($parent, data);
                done && done();
            },
        });
    }

    function render_comment($el, comment) {
        comment.repliable = window.current_user !== null;
        comment.deletable = window.current_user && comment.user.username === window.current_user.username;
        var $comment = $(Mustache.render(Templates.comment, comment));
        var $list = $comment.children('.comments');
        $el.append($comment);
        comment.comments.forEach((reply) => {
            render_comment($list, reply);
        });
    }

    function render_poll(poll) {
        poll.editable = window.current_user && poll.user.username === window.current_user.username;
        $('#content').html(Mustache.render(Templates.poll, poll));
        poll.comments.forEach((comment) => render_comment($('#comments'), comment));
        // reply to main poll thread
        $('.comment-box-submit').click((e) => {
            e.preventDefault();
            var $textbox = $('#comment-box textarea[name=text]');
            var text = $textbox.val();
            if (text.length > 0) {
                make_comment(
                    $('#comments'),
                    {text: text, poll_id: poll.id},
                    () => $textbox.val(''),
                );
            }
        });

        $('#content').find('.add-vote').click(function() {
            var $this = $(this);
            var id = $this.data('id');
            $.ajax('/poll/' + poll.id + '/vote/' + id, {
                method: 'POST',
                success: (poll) => render_poll(poll),
            });
        });

        $('#content').find('.add-unvote').click(function() {
            var $this = $(this);
            var id = $this.data('id');
            $.ajax('/poll/' + poll.id + '/vote/' + id, {
                method: 'DELETE',
                success: (poll) => render_poll(poll),
            });
        });

        $('#comments').on('click', '.comment-delete', function() {
            var $this = $(this);
            var $panel = $this.parent();
            var id = $panel.data('comment-id');
            $.ajax('/comment/' + id, {
                method: 'DELETE',
                success: () => $panel.parent().parent().remove(),
            });
        });

        $('#comments').on('click', '.comment-reply', function(e) {
            var $this = $(this);
            var $panel = $this.parent();
            var $comment = $panel.parent().parent();
            var id = $panel.data('comment-id');

            var $form = $(Mustache.render(Templates.comment_reply_dialog, {}));
            $form.find('.comment-reply-save').click(() => {
                var text = $form.find('[name=comment-reply-text]').val();
                if (text.length > 0) {
                    make_comment($comment.children('.comments'), {text: text, reply_to: id});
                    $form.remove();
                }
            });
            $form.find('.comment-reply-cancel').click(() => $div.remove());
            $panel.append($form);
        });

        $('#delete-poll').click((evt) => {
            var modal = $(Templates.delete_poll_modal);
            $('#content').append(modal);
            modal.modal('show');
            modal.find('.deny').click(() => { modal.modal('hide'); modal.remove(); });
            modal.find('.ok').click(() => {
                $.ajax('/poll/' + poll.id, {
                    method: 'DELETE',
                    success: () => visit(''),
                });
            });
        });

        $('#finalize-poll').click((evt) => {
            var modal = $(Templates.finalize_poll_modal);
            $('#content').append(modal);
            modal.modal('show');
            modal.find('.deny').click(() => { modal.modal('hide'); modal.remove(); });
            modal.find('.ok').click(() => {
                $.ajax('/poll/' + poll.id + '/finalize', {
                    method: 'POST',
                    success: (poll) => render_poll(poll),
                });
            });
        });
    }

    $.ajax('/poll/' + e.params.id, {success: poll => render_poll(poll)});
});


$(document).hashroute('/edit-poll/:id', (e) => {
    if (!window.current_user) return visit('/login');

    function render_deletable_option($parent, option) {
        var $div = $(Mustache.render(Templates.deletable_poll_option, option));
        $div.find('.remove-option').click(() => $div.remove());
        $parent.append($div);
    }

    function render_option($parent, option) {
        $parent.append($(Mustache.render(Templates.poll_option, option)));
    }

    $.ajax('/poll/' + e.params.id, {
        success: (poll) => {
            if (poll.user.username !== window.current_user.username) return visit('');
            $('#content').html(Mustache.render(Templates.edit_poll, poll));
            var $opts = $('#content').find('#edit-poll-options');

            poll.votes.forEach((vote) => {
                render_option($opts, vote);
            });

            function add_option() {
                var $name = $('#add-poll-option-text');
                var name = $name.val();
                if (name.length > 0) {
                    render_deletable_option($opts, {name: name});
                    $name.val('');
                }
            }

            $('#add-option').click(add_option);
            $('#add-poll-option-text').keypress((e) => {
                if (e.which === 13) {
                    e.preventDefault();
                    add_option();
                }
            });

            $('#save').click(() => {
                var json = {
                    name:        $('[name=name]').val(),
                    description: $('[name=description]').val(),
                    options:     $('.added-poll-option').map(function() { return {name: $(this).find('input').val()}; }).get(),
                };
                if (json.name.length === 0) return;
                $.ajax('/poll/' + poll.id, {
                    method: 'PUT',
                    data: JSON.stringify(json),
                    success: () => visit('/poll/' + poll.id),
                });
            });
        },
    });
});


$(document).hashroute('/settings', () => {
    var reload = (user) => {
        $('#content').html(Mustache.render(Templates.settings, user));
        $('#settings').submit((evt) => {
            evt.preventDefault();
            var data = {
                username: $('[name=username]').val(),
                forename: $('[name=forename]').val(),
                surname: $('[name=surname]').val(),
            };
            var password        = $('[name=password]').val();
            var password_repeat = $('[name=password-repeat]').val();
            if (password) {
                if (password !== password_repeat) {
                    $('#errors').append($('<span class="error">Passwords do not match.</span>'));
                    return;
                }
                data.password = password;
            }
            $.ajax('/auth/settings', {
                method: 'POST',
                data: JSON.stringify(data),
                success: (data) => {
                    data.saved = true;
                    reload(data);
                },
            });
        })
    };
    $.ajax('/auth/me', {success: reload});
});
