(function () {
  var id = (function () {
    var m = /[?&]id=([^&]+)/.exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  })();

  if (!id) {
    document.getElementById('mainContainer').innerHTML = '<p class="empty-state">Startup not found.</p>';
    return;
  }

  app.checkAuth();

  function renderDetail(s) {
    var logo = s.logo ? (s.logo.startsWith('http') ? s.logo : window.location.origin + s.logo) : '';
    var logoHtml = logo ? '<img class="logo" src="' + logo + '" alt="' + app.escapeHtml(s.name) + '" onerror="this.onerror=null; this.src=\'https://ui-avatars.com/api/?name=' + encodeURIComponent(s.name) + '&background=6366f1&color=fff&size=128&bold=true\';">' : '<div class="logo" style="background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:#fff;font-weight:bold;">' + app.escapeHtml(s.name.charAt(0)) + '</div>';
    var tags = (s.categoryTags || []).map(function (t) { return '<span class="tag">' + app.escapeHtml(t) + '</span>'; }).join('');
    var up = app.upvoteCount(s);
    var down = app.downvoteCount(s);
    return (
      '<div class="startup-detail" data-id="' + s._id + '">' +
        logoHtml +
        '<h1>' + app.escapeHtml(s.name) + '</h1>' +
        '<p class="pitch">' + app.escapeHtml(s.oneLinePitch) + '</p>' +
        '<div class="meta">' +
          'Funds raised: $' + (s.fundsRaised || 0).toLocaleString() + ' &middot; ' +
          'Contact: <a href="mailto:' + app.escapeHtml(s.contactEmail) + '">' + app.escapeHtml(s.contactEmail) + '</a>' +
          (s.author && s.author.username ? ' &middot; By ' + app.escapeHtml(s.author.username) : '') +
        '</div>' +
        (tags ? '<div class="card-tags">' + tags + '</div>' : '') +
        '<div class="description">' + app.escapeHtml(s.detailedDescription) + '</div>' +
        '<div class="actions-bar">' +
          '<button type="button" class="vote-btn upvote" data-id="' + s._id + '">&#9650; Upvote <span class="count">' + up + '</span></button>' +
          '<button type="button" class="vote-btn downvote" data-id="' + s._id + '">&#9660; Downvote <span class="count">' + down + '</span></button>' +
          '<button type="button" class="follow-btn" data-id="' + s._id + '">Follow</button>' +
        '</div>' +
      '</div>' +
      '<div class="comments-section">' +
        '<h2>Comments</h2>' +
        (api.getToken() ? (
          '<div class="comment-form">' +
            '<textarea id="commentInput" placeholder="Add a comment..." rows="3"></textarea>' +
            '<button type="button" class="btn btn-primary" id="submitComment">Post comment</button>' +
          '</div>'
        ) : '<p class="empty-state">Log in to comment.</p>') +
        '<div id="commentsList"></div>' +
      '</div>'
    );
  }

  function renderComment(c, depth) {
    depth = depth || 0;
    var up = (c.upvotes && c.upvotes.length) || 0;
    var down = (c.downvotes && c.downvotes.length) || 0;
    var author = (c.author && c.author.username) || 'Anonymous';
    var replyForm = api.getToken() && depth < 3 ? (
      '<div class="reply-form" style="margin-top:0.5rem;">' +
        '<textarea class="reply-input" data-parent="' + c._id + '" placeholder="Reply..." rows="2"></textarea>' +
        '<button type="button" class="btn btn-ghost reply-submit">Reply</button>' +
      '</div>'
    ) : '';
    var repliesHtml = (c.replies || []).map(function (r) { return renderComment(r, depth + 1); }).join('');
    return (
      '<div class="comment' + (depth > 0 ? ' reply' : '') + '" data-id="' + c._id + '">' +
        '<div class="comment-header">' + app.escapeHtml(author) + ' &middot; ' + new Date(c.createdAt).toLocaleString() + '</div>' +
        '<div class="comment-content">' + app.escapeHtml(c.content) + '</div>' +
        '<div class="comment-actions">' +
          '<button type="button" class="vote-btn comment-upvote" data-id="' + c._id + '">&#9650; ' + up + '</button>' +
          '<button type="button" class="vote-btn comment-downvote" data-id="' + c._id + '">&#9660; ' + down + '</button>' +
        '</div>' +
        replyForm +
        (repliesHtml ? '<div style="margin-top:0.5rem;">' + repliesHtml + '</div>' : '') +
      '</div>'
    );
  }

  function loadStartup() {
    api.getStartupById(id).then(function (r) {
      var s = r.data;
      document.getElementById('mainContainer').innerHTML = renderDetail(s);
      attachDetailListeners();
      loadComments();
    }).catch(function () {
      document.getElementById('mainContainer').innerHTML = '<p class="empty-state">Startup not found.</p>';
    });
  }

  function loadComments() {
    api.getComments(id).then(function (r) {
      var el = document.getElementById('commentsList');
      if (!r.data || r.data.length === 0) {
        el.innerHTML = '<p class="empty-state">No comments yet.</p>';
        return;
      }
      el.innerHTML = r.data.map(function (c) { return renderComment(c); }).join('');
      attachCommentListeners(el);
    });
  }

  function attachDetailListeners() {
    var detail = document.querySelector('.startup-detail');
    if (!detail) return;
    detail.addEventListener('click', function (e) {
      var target = e.target.closest('.upvote');
      if (target && target.classList.contains('vote-btn')) {
        e.preventDefault();
        if (!api.getToken()) { alert('Please log in to vote.'); return; }
        api.upvoteStartup(id).then(function (r) {
          detail.querySelector('.upvote .count').textContent = r.upvotes;
          detail.querySelector('.downvote .count').textContent = r.downvotes;
        }).catch(function (err) { alert(err.message); });
        return;
      }
      target = e.target.closest('.downvote');
      if (target && target.classList.contains('vote-btn')) {
        e.preventDefault();
        if (!api.getToken()) { alert('Please log in to vote.'); return; }
        api.downvoteStartup(id).then(function (r) {
          detail.querySelector('.upvote .count').textContent = r.upvotes;
          detail.querySelector('.downvote .count').textContent = r.downvotes;
        }).catch(function (err) { alert(err.message); });
        return;
      }
      target = e.target.closest('.follow-btn');
      if (target) {
        e.preventDefault();
        if (!api.getToken()) { alert('Please log in to follow.'); return; }
        api.followStartup(id).then(function (r) {
          target.textContent = r.following ? 'Unfollow' : 'Follow';
        }).catch(function (err) { alert(err.message); });
      }
    });

    var submitBtn = document.getElementById('submitComment');
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        var textarea = document.getElementById('commentInput');
        var content = textarea && textarea.value.trim();
        if (!content) return;
        api.addComment(id, content).then(function () {
          textarea.value = '';
          loadComments();
        }).catch(function (err) { alert(err.message); });
      });
    }
  }

  function attachCommentListeners(container) {
    if (!container) return;
    container.addEventListener('click', function (e) {
      var target = e.target.closest('.comment-upvote');
      if (target) {
        e.preventDefault();
        var cid = target.getAttribute('data-id');
        if (!api.getToken()) { alert('Please log in to vote.'); return; }
        api.upvoteComment(cid).then(function (r) {
          target.textContent = '\u9650; ' + r.upvotes;
          var comment = target.closest('.comment');
          var downBtn = comment.querySelector('.comment-downvote');
          if (downBtn) downBtn.textContent = '\u9660; ' + r.downvotes;
        }).catch(function (err) { alert(err.message); });
        return;
      }
      target = e.target.closest('.comment-downvote');
      if (target) {
        e.preventDefault();
        var cid = target.getAttribute('data-id');
        if (!api.getToken()) { alert('Please log in to vote.'); return; }
        api.downvoteComment(cid).then(function (r) {
          target.textContent = '\u9660; ' + r.downvotes;
          var comment = target.closest('.comment');
          var upBtn = comment.querySelector('.comment-upvote');
          if (upBtn) upBtn.textContent = '\u9650; ' + r.upvotes;
        }).catch(function (err) { alert(err.message); });
        return;
      }
      target = e.target.closest('.reply-submit');
      if (target) {
        e.preventDefault();
        var form = target.closest('.reply-form');
        var textarea = form && form.querySelector('.reply-input');
        var parentId = textarea && textarea.getAttribute('data-parent');
        var content = textarea && textarea.value.trim();
        if (!content || !parentId) return;
        api.addComment(id, content, parentId).then(function () {
          textarea.value = '';
          loadComments();
        }).catch(function (err) { alert(err.message); });
      }
    });
  }

  loadStartup();
})();
