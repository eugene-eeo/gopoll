window.Templates = {"register": "<h2>Register</h2>\n<p>\n  Registration is free and only takes a few seconds.\n<p>\n<form class='ui form segment error' id=\"register\">\n  <div class='field'>\n    <label>Name</label>\n    <div class='two fields'>\n      <div class='field'>\n        <input type='text' name='forename' placeholder='First Name'/>\n      </div>\n      <div class='field'>\n        <input type='text' name='surname' placeholder='Last Name'/>\n      </div>\n    </div>\n  </div>\n  <div class='field'>\n    <label>Username</label>\n    <input type='text' name='username' placeholder='Username'/>\n  </div>\n  <div class='field'>\n    <label>Password</label>\n    <div class='two fields'>\n      <div class='field'>\n        <input type='password' name='password' placeholder='Password'/>\n      </div>\n      <div class='field'>\n        <input type='password' name='password-repeat' placeholder='Password'/>\n      </div>\n    </div>\n  </div>\n  <input class='ui button' type=\"submit\" value=\"Register\"/>\n</form>\n", "finalize_poll_modal": "<div class=\"ui small modal\" id=\"finalize-poll-modal\">\n  <div class=\"header\">Finalize Poll?</div>\n  <div class=\"content\">\n    <div class=\"description\">\n      Once you finalize a poll, other users cannot vote and the poll can't be edited.\n      However users can still leave comments and reply to existing ones.\n    </div>\n  </div>\n  <div class=\"actions\">\n    <div class=\"ui button deny\">Cancel</div>\n    <div class=\"ui button primary ok\">Confirm</div>\n  </div>\n</div>\n", "poll": "<div id='poll' class='ui stackable grid'>\n  <div class='two wide column'></div>\n  <div class='eight wide column'>\n    <div class='ui card' style='width:100%;'>\n      <div class='content'>\n        <div class='header'>{{ name }}</div>\n        <div class='meta'>{{ user.forename }} {{ user.surname }} (<a href='#/user/{{user.username}}'>@{{ user.username }}</a>)</div>\n        <div class='description'>\n          <p>{{ description }}</p>\n        </div>\n      </div>\n    </div>\n    {{#finalized}}\n    <div class=\"ui warning message\">\n      <div class=\"header\">\n        Poll finalized.\n      </div>\n      <p>The owner has finalized the poll. You may not vote, but are still able to leave comments.</p>\n    </div>\n    {{/finalized}}\n    <form class='ui segmented form' id='comment-box'>\n      <h4 class='ui dividing header'>Add comment</h4>\n      <div class='field'>\n        <textarea name='text' style='height: 2em;'/>\n      </div>\n      <button class='ui button primary comment-box-submit'>Reply</button>\n    </form>\n    <div class='ui comments'>\n      <h3 class='ui dividing header'>Comments</h3>\n      <div id='comments'>\n      </div>\n    </div>\n  </div>\n  <div class='four wide column'>\n    <h4 class='ui header'>Options</h4>\n      <div class='ui vertical menu' style='width: 100%;' id='votes'>\n      {{^finalized}}\n        {{#votes}}\n          {{^voted}}\n          <div class='vote item add-vote not-voted' data-id='{{ id }}'>\n            {{ name }}\n            <div class='ui label'>{{ num }}</div>\n          </div>\n          {{/voted}}\n          {{#voted}}\n          <div class='vote item add-unvote voted' data-id='{{ id }}'>\n            {{ name }}\n            <div class='ui teal label'>{{ num }}</div>\n          </div>\n          {{/voted}}\n        {{/votes}}\n      {{/finalized}}\n      {{#finalized}}\n        {{#votes}}\n        <div class='vote item{{^voted}} not-voted{{/voted}}{{#voted}} voted{{/voted}}'>\n          {{ name }}\n          <div class='ui {{#voted}}teal{{/voted}} label'>{{ num }}</div>\n        </div>\n        {{/votes}}\n      {{/finalized}}\n      {{^votes}}<span class='gray'>no vote options</span>{{/votes}}\n      </div>\n    </h4>\n    {{#editable}}\n      {{^finalized}}\n      <div class='ui fluid three item menu' style='width: 100%;'>\n        <a class='item' href='#/edit-poll/{{ id }}'><i class='ui icon edit'></i> Edit</a>\n        <a class='item' id='finalize-poll'><i class='ui icon save'></i> Finalize</a>\n        <a class='item' id='delete-poll'><i class='ui icon delete'></i> Delete</a>\n      </div>\n      {{/finalized}}\n      {{#finalized}}\n      <div class='ui fluid one item menu' style='width: 100%;'>\n        <a class='item' id='delete-poll'><i class='ui icon delete'></i> Delete</a>\n      </div>\n      {{/finalized}}\n    {{/editable}}\n  </div>\n  <div class='two wide column'></div>\n</div>\n", "people": "<div class='ui stackable grid'>\n  <div class='three wide column'></div>\n  <div class='ten wide column'>\n    <h2>Users</h2>\n    <div class='ui link cards'>\n      {{#people}}\n      <div class='ui card' style='width: 30%' onclick='visit(\"/user/{{ username }}\")'>\n        <div class='content'>\n          <span class='header'>{{ forename }} {{ surname }}</span>\n          <div class='meta'>\n            <span>@{{ username }}</span>\n          </div>\n        </div>\n      </div>\n      {{/people}}\n    </div>\n  </div>\n  <div class='three wide column'></div>\n</div>\n", "user": "<div class='ui stackable three column grid'>\n  <div class='column'></div>\n  <div class='column'>\n    <div class='ui card' style='width: 100%'>\n      <div class='content'>\n        <span class='header'>{{ forename }} {{ surname }}</span>\n        <div class='meta'>\n          <span class='date'>@{{ username }}</span>\n        </div>\n      </div>\n    </div>\n    <h3 class='ui dividing header'>Polls Created</h3>\n    {{#polls_created}}\n      <div class='ui card poll' style='width: 100%' onclick='visit(\"/poll/{{ id }}\")'>\n        <div class='content'>\n          <span class='header'>{{ name }}</span>\n          <span class='meta'>{{ description }}</span>\n        </div>\n      </div>\n    {{/polls_created}}\n  </div>\n  <div class='column'></div>\n</div>\n", "settings": "<div class='ui stackable three column grid'>\n  <div class='column'></div>\n  <div class='column'>\n    <form id=\"settings\" class='ui form segment error'>\n      <h2 class='ui dividing header'>Settings</h2>\n      {{#saved}}\n      <div class='ui message'><p>Your changes have been saved.</p></div>\n      {{/saved}}\n      <div class='field'>\n        <label>Name</label>\n        <div class='two fields'>\n          <div class='field'>\n            <input type='text' name='forename' placeholder='First Name' value='{{forename}}'/>\n          </div>\n          <div class='field'>\n            <input type='text' name='surname' placeholder='Last Name' value='{{surname}}'/>\n          </div>\n        </div>\n      </div>\n      <div class='field'>\n        <label>Username</label>\n        <input type='text' name='username' placeholder='Username' value='{{username}}'/>\n      </div>\n      <div class='field'>\n        <label>Password</label>\n        <div class='two fields'>\n          <div class='field'>\n            <input type='password' name='password' placeholder='Password'/>\n          </div>\n          <div class='field'>\n            <input type='password' name='password-repeat' placeholder='Password'/>\n          </div>\n        </div>\n      </div>\n      <input class='ui button' type=\"submit\" value=\"Save\"/>\n    </form>\n  </div>\n  <div class='column'></div>\n</div>\n", "delete_poll_modal": "<div class=\"ui small modal\" id=\"delete-poll-modal\">\n  <div class=\"header\">Delete Poll?</div>\n  <div class=\"content\">\n    <div class=\"description\">\n      This action can't be reversed.\n    </div>\n  </div>\n  <div class=\"actions\">\n    <div class=\"ui button deny\">Cancel</div>\n    <div class=\"ui button red ok\">Delete</div>\n  </div>\n</div>\n", "comment": "<div class='comment'>\n  <div class='content'>\n    <a class='author'><a href='#/user/{{ user.username }}'>{{ user.forename }} {{ user.surname }}</a></a>\n    <div class='text'>{{ text }}</div>\n    <div class='actions' data-comment-id='{{ id }}'>\n      {{#repliable}}<a class='reply comment-reply'>reply</a>{{/repliable}}\n      {{#deletable}}<a class='reply comment-delete'>delete</a>{{/deletable}}\n    </div>\n  </div>\n  <div class='comments'></div>\n</div>\n", "dashboard": "<div class='ui stackable grid'>\n  <div class='two wide column'></div>\n  <div class='three wide column'>\n    <div class='ui card' style='width: 100%'>\n      <div class='content'>\n        <span class='header'>{{ forename }} {{ surname }}</span>\n        <div class='meta'>\n          <span class='date'>@{{ username }}</span>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class='four wide column'>\n    <h3 class='ui dividing header'>My Polls</h3>\n    <div class='ui link cards'>\n      {{#polls_created}}\n      <div class='ui card poll' style='width: 100%' onclick='visit(\"/poll/{{ id }}\")'>\n        <div class='content'>\n          <span class='header'>{{ name }}</span>\n          <span class='meta'>{{ description }}</span>\n        </div>\n      </div>\n      {{/polls_created}}\n    </div>\n  </div>\n  <div class='four wide column'>\n    <h3 class='ui dividing header'>Participated Polls</h3>\n    <div class='ui link cards'>\n      {{#polls_participated}}\n      <div class='ui card poll' style='width: 100%' onclick='visit(\"/poll/{{ id }}\")'>\n        <div class='content'>\n          <span class='header'>{{ name }}</span>\n          <span class='meta'>{{ description }}</span>\n        </div>\n      </div>\n      {{/polls_participated}}\n    </div>\n  </div>\n  <div class='two wide column'></div>\n</div>\n", "search": "\n", "comment_reply_dialog": "<form class='ui form comment-reply-dialog'>\n  <div class='field'>\n    <textarea name='comment-reply-text' placeholder='Comment...'/>\n  </div>\n  <div class='ui button comment-reply-save'>Save</div>\n  <div class='ui button comment-reply-cancel'>Cancel</div>\n</form>\n", "poll_option": "<div data-id='{{ id }}' class='item'>\n  <input class='option-text-form' value='{{ name }}' />\n  <div class='ui red button remove-option'>-</a>\n</div>\n", "navbar": "<a class='ui item' href='#/'><b>GoPoll</b></a>\n<a class='ui item' href='#/people'>Users</a>\n<div class='ui item' >\n  <div id='search' class='ui category search'>\n    <div class='ui icon input'>\n      <input class='prompt' type='text' placeholder='Search...'>\n      <i class='search icon'></i>\n    </div>\n    <div class='results'></div>\n  </div>\n</div>\n<div class='right menu'>\n{{#logged_in}}\n  <a class='ui item' href='#/create-poll'>Create poll</a>\n  <a class='ui item' href='#/settings'>Settings</a>\n  <div class=\"ui item\">\n      <a class='ui button' href='#/logout'>Logout</a>\n  </div>\n{{/logged_in}}\n{{^logged_in}}\n  <a class='ui item' href='#/login'>Login</a>\n{{/logged_in}}\n</div>\n", "edit_poll": "<div>\n  <div class='ui stackable grid'>\n    <div class='two wide column'></div>\n    <div class='eight wide column'>\n      <div id='edit-poll' class='ui form segmented'>\n        <h3 class='ui dividing header'>Edit Poll</h3>\n        <div class='field'><label>Name</label><input name='name' value='{{ name }}'></div>\n        <div class='field'><label>Description:</label><textarea name='description'>{{ description }}</textarea></div>\n      </div>\n    </div>\n    <div class='four wide column'>\n      <h3>Options</h3>\n      <div id='edit-poll-options' class='ui vertical menu' style='width: 100%'></div>\n      <div class='ui vertical menu' style='width: 100%'>\n        <div id='add-poll-options' class='item'>\n          <input id='add-poll-option-text' class='option-text-form' name='add-poll-option' />\n          <div id='add-option' class='ui button green'>+</div>\n        </div>\n      </div>\n    </div>\n    <div class='two wide column'></div>\n  </div>\n  <div class='ui stackable grid'>\n    <div class='two wide column'></div>\n    <div class='eight wide column'>\n      <button class='ui button primary' id='save'>Save</button>\n      <a class='ui button' href='#/poll/{{ id }}'>Cancel</a>\n    </div>\n  </div>\n</div>\n", "create_poll": "<div class='ui stackable grid'>\n  <div class='three wide column'></div>\n  <div class='ten wide column' id='create-poll'>\n    <form id='create-poll-form' class='ui form segment error' style='width: 100%'>\n      <h2 class='ui dividing header'>Create Poll</h2>\n      <div class='field'>\n        <label>Name:</label>\n        <input type='text' name='name'/>\n      </div>\n      <div class='field'>\n        <label>Description:</label>\n        <textarea name='description'/>\n      </div>\n      <div class=\"ui segment\">\n        <div class=\"field\">\n          <div class=\"ui toggle checkbox\">\n            <input type=\"checkbox\" name=\"multi\">\n            <label>Allow users to select multiple options</label>\n          </div>\n        </div>\n      </div>\n      <input class='ui button' type='submit' value='Create'/>\n      <div class='ui error message'></div>\n    </form>\n  </div>\n  <div class='three wide column'></div>\n</div>\n", "login": "<div class='ui stackable three column grid'>\n  <div class='column'></div>\n  <div class='column'>\n    <form id=\"login\" class='ui segmented form'>\n      <h2 class='ui dividing header'>Log in</h2>\n      <div class='field'>\n        <label>Username:</label>\n        <input type='text' name='username'/>\n      </div>\n      <div class='field'>\n        <label>Password:</label>\n        <input type='password' name='password'/>\n      </div>\n      <input class='ui button primary' type=\"submit\" value=\"Log in\">\n      <a class='ui button' id='register' href='#/register'>Register</a>\n    </form>\n  </div>\n  <div class='column'></div>\n</div>\n"}
