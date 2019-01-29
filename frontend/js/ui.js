"use strict";

window.current_user = null;
window.done = false;
$.ajaxSetup({
  contentType: "application/json; charset=utf-8",
  dataType: "json",
  error: function error(r) {
    console.log(r);
    $('#errors').html('');
    if (!r.responseJSON) return;

    if (r.responseJSON.code === 'NEEDS_AUTH') {
      window.current_user = null;
      visit('/login');
      return;
    }

    var $error = $(Mustache.render(Templates.error_dialog, {
      message: r.responseJSON.error
    }));
    $error.find('.close').click(function () {
      return $error.remove();
    });
    $('#errors').append($error);
  }
});

function visit(x) {
  window.location.hash = x;
}

function trim_description(poll) {
  if (poll.description.length > 190) poll.description = poll.description.substr(0, 187) + '...';
}

$.hashroute('middleware', function () {
  var _this = this;

  if (window.done) return this.next();
  $.ajax('/auth/me', {
    // here we explicitly ignore error, since we don't want to force login.
    error: function error() {},
    success: function success(data) {
      window.current_user = data;
    },
    complete: function complete() {
      window.done = true;

      _this.next();
    }
  });
}); // inject navbar

$.hashroute('middleware', function () {
  var context = {
    user: window.current_user,
    logged_in: !!window.current_user
  };
  $('.ui.vertical.menu').hide();
  $('#mobile-navbar').html(Mustache.render(Templates.mobile_navbar, context));
  $('#navbar').html(Mustache.render(Templates.navbar, context)); // clear errors

  $('#errors').html(''); // setup search

  $('.navbar-search').search({
    type: 'category',
    minCharacters: 3,
    apiSettings: {
      url: '/search?q={query}',
      onResponse: function onResponse(res) {
        var r = {
          results: {
            users: {
              name: 'Users'
            },
            polls: {
              name: 'Polls'
            },
            comments: {
              name: 'Comments'
            }
          }
        };
        r.results.users.results = res.users.map(function (user) {
          return {
            title: user.username,
            description: user.forename + ' ' + user.surname,
            url: '#/user/' + user.username
          };
        });
        r.results.polls.results = res.polls.map(function (poll) {
          return {
            title: poll.name,
            description: poll.description,
            url: '#/poll/' + poll.id
          };
        });
        r.results.comments.results = res.comments.map(function (comment) {
          return {
            title: comment.poll.name,
            description: comment.text,
            url: '#/poll/' + comment.poll.id
          };
        });
        return r;
      }
    }
  });
  this.next();
});
$(document).hashroute('/create-poll', function () {
  $('#content').html(Mustache.render(Templates.create_poll));
  $('#create-poll-form').form({
    fields: {
      name: ['empty']
    }
  });
  $('#create-poll-form').submit(function (evt) {
    evt.preventDefault();
    var $this = $(this);
    if (!$this.form('is valid')) return;
    var data = $this.form('get values');
    data.multi = data.multi === 'on';
    $.ajax('/poll', {
      method: 'POST',
      data: JSON.stringify(data),
      success: function success(poll) {
        return visit('/poll/' + poll.id);
      }
    });
  });
});
$(document).hashroute('/user/:username', function (e) {
  $.ajax('/people/' + e.params.username, {
    success: function success(data) {
      return $('#content').html(Mustache.render(Templates.user, data));
    }
  });
});
$(document).hashroute('/people', function () {
  $.ajax('/people', {
    success: function success(people) {
      return $('#content').html(Mustache.render(Templates.people, {
        people: people
      }));
    }
  });
});
$(document).hashroute('/register', function () {
  if (window.current_user) {
    visit('');
    return;
  }

  $('#content').html(Mustache.render(Templates.register));
  $('#register').form({
    fields: {
      username: ['empty'],
      forename: ['empty'],
      surname: ['empty'],
      password: ['empty', 'match[password-repeat]']
    }
  });
  $('#register').submit(function (evt) {
    evt.preventDefault();
    var $this = $(this);
    if (!$this.form('is valid')) return;
    var data = $this.form('get values');
    delete data['password-repeat'];
    data.access_token = 'concertina';
    $.ajax('/people', {
      method: 'POST',
      data: JSON.stringify(data),
      success: function success() {
        return visit('login');
      }
    });
  });
});
$(document).hashroute('/login', function () {
  if (window.current_user) {
    visit('');
    return;
  }

  $('#content').html(Mustache.render(Templates.login));
  $('#login').submit(function () {
    var $form = $(this);
    $.ajax('/auth/login', {
      method: 'POST',
      data: JSON.stringify({
        username: $form.find('input[name=username]').val(),
        password: $form.find('input[name=password]').val()
      }),
      success: function success(user) {
        window.current_user = user;
        visit('');
      }
    });
    return false;
  });
});
$(document).hashroute('/logout', function () {
  $.ajax('/auth/logout', {
    method: 'POST',
    success: function success() {
      window.current_user = null;
      visit('');
    }
  });
});
$(document).hashroute('/', function () {
  if (!window.current_user) {
    visit('/login');
    return;
  }

  $.ajax('/auth/me', {
    success: function success(data) {
      window.current_user = data;
      var created = data.polls_created.map(function (x) {
        return x.id;
      });
      data.polls_created.forEach(trim_description);
      data.polls_participated = data.polls_participated.filter(function (x) {
        return created.indexOf(x.id) === -1;
      });
      data.polls_participated.forEach(trim_description);
      $('#content').html(Mustache.render(Templates.dashboard, data));
    }
  });
});
$(document).hashroute('/poll/:id', function (e) {
  function make_comment($parent, json, done) {
    $.ajax('/comment/', {
      method: 'POST',
      data: JSON.stringify(json),
      success: function success(data) {
        render_comment($parent, data);
        done();
      }
    });
  }

  function render_comment($el, comment) {
    comment.repliable = window.current_user !== null;
    comment.deletable = window.current_user && comment.user.username === window.current_user.username;
    var $comment = $(Mustache.render(Templates.comment, comment));
    var $list = $comment.children('.comments');
    $el.append($comment);
    comment.comments.forEach(function (reply) {
      render_comment($list, reply);
    });
  }

  function render_poll(poll) {
    poll.editable = window.current_user && poll.user.username === window.current_user.username;
    $('#content').html(Mustache.render(Templates.poll, poll));
    poll.comments.forEach(function (comment) {
      return render_comment($('#comments'), comment);
    }); // reply to main poll thread

    $('.comment-box-submit').click(function (e) {
      e.preventDefault();
      var $textbox = $('#comment-box textarea[name=text]');
      var text = $textbox.val();
      if (text.length > 0) make_comment($('#comments'), {
        text: text,
        poll_id: poll.id
      }, function () {
        return $textbox.val('');
      });
    });
    $('#content').find('.add-vote').click(function () {
      var id = $(this).data('id');
      $.ajax('/poll/' + poll.id + '/vote/' + id, {
        method: 'POST',
        success: function success(poll) {
          return render_poll(poll);
        }
      });
    });
    $('#content').find('.add-unvote').click(function () {
      var id = $(this).data('id');
      $.ajax('/poll/' + poll.id + '/vote/' + id, {
        method: 'DELETE',
        success: function success(poll) {
          return render_poll(poll);
        }
      });
    });
    $('#comments').on('click', '.comment-delete', function () {
      var $panel = $(this).parent();
      var id = $panel.data('comment-id');
      $.ajax('/comment/' + id, {
        method: 'DELETE',
        success: function success() {
          return $panel.parent().parent().remove();
        }
      });
    });
    $('#comments').on('click', '.comment-reply', function (e) {
      var $panel = $(this).parent();
      var $comment = $panel.parent().parent();
      var id = $panel.data('comment-id');
      var $form = $(Mustache.render(Templates.comment_reply_dialog, {}));
      $form.find('.comment-reply-save').click(function () {
        var text = $form.find('[name=comment-reply-text]').val();
        if (text.length > 0) make_comment($comment.children('.comments'), {
          text: text,
          reply_to: id
        }, function () {
          return $form.remove();
        });
      });
      $form.find('.comment-reply-cancel').click(function () {
        return $form.remove();
      });
      $panel.append($form);
    });
    $('#delete-poll').click(function (evt) {
      var modal = $(Templates.delete_poll_modal);
      $('#content').append(modal);
      modal.modal('show');
      modal.find('.deny').click(function () {
        modal.modal('hide');
        modal.remove();
      });
      modal.find('.ok').click(function () {
        $.ajax('/poll/' + poll.id, {
          method: 'DELETE',
          success: function success() {
            return visit('');
          }
        });
      });
    });
    $('#finalize-poll').click(function (evt) {
      var modal = $(Templates.finalize_poll_modal);
      $('#content').append(modal);
      modal.modal('show');
      modal.find('.deny').click(function () {
        modal.modal('hide');
        modal.remove();
      });
      modal.find('.ok').click(function () {
        $.ajax('/poll/' + poll.id + '/finalize', {
          method: 'POST',
          success: function success(poll) {
            return render_poll(poll);
          }
        });
      });
    });
  }

  $.ajax('/poll/' + e.params.id, {
    success: function success(poll) {
      return render_poll(poll);
    }
  });
});
$(document).hashroute('/edit-poll/:id', function (e) {
  if (!window.current_user) return visit('/login');
  $.ajax('/poll/' + e.params.id, {
    success: function success(poll) {
      $('#content').html(Mustache.render(Templates.edit_poll, poll));
      var $opts = $('#content').find('#edit-poll-options');

      function add_option() {
        var $name = $('#add-poll-option-text');
        var name = $name.val();

        if (name.length > 0) {
          var $opt = $(Mustache.render(Templates.deletable_poll_option, {
            name: name
          }));
          $opt.find('.remove-option').click(function () {
            return $opt.remove();
          });
          $opts.append($opt);
          $name.val('');
        }
      }

      $('#add-option').click(add_option);
      $('#add-poll-option-text').keypress(function (e) {
        if (e.which === 13) {
          e.preventDefault();
          add_option();
        }
      });
      $('#save').click(function () {
        var data = {
          name: $('[name=name]').val(),
          description: $('[name=description]').val(),
          options: $('.added-poll-option').map(function () {
            return {
              name: $(this).find('input').val()
            };
          }).get()
        };
        if (data.name.length === 0) return;
        $.ajax('/poll/' + poll.id, {
          method: 'PUT',
          data: JSON.stringify(data),
          success: function success() {
            return visit('/poll/' + poll.id);
          }
        });
      });
    }
  });
});
$(document).hashroute('/settings', function () {
  function reload(user) {
    $('#errors').html('');
    $('#content').html(Mustache.render(Templates.settings, user));
    $('#settings').form({
      fields: {
        username: ['empty'],
        forename: ['empty'],
        surname: ['empty'],
        password: ['match[password-repeat]']
      }
    });
    $('#settings').submit(function (evt) {
      evt.preventDefault();
      var $this = $(this);
      if (!$this.form('is valid')) return;
      var data = $this.form('get values');
      if (data.password.length === 0) delete data['password'];
      delete data['password-repeat'];
      $.ajax('/auth/settings', {
        method: 'POST',
        data: JSON.stringify(data),
        success: function success(data) {
          window.current_user = data;
          data.saved = true;
          reload(data);
        }
      });
    });
  }

  $.ajax('/auth/me', {
    success: reload
  });
});