var app = (function () {
  function getToken() {
    return window.api ? api.getToken() : localStorage.getItem('token');
  }

  function setToken(token) {
    if (window.api) api.setToken(token);
    else if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }

  function checkAuth() {
    var token = getToken();
    var loginEl = document.getElementById('navLogin');
    var registerEl = document.getElementById('navRegister');
    var dashboardEl = document.getElementById('navDashboard');
    var logoutEl = document.getElementById('navLogout');
    if (loginEl) loginEl.style.display = token ? 'none' : '';
    if (registerEl) registerEl.style.display = token ? 'none' : '';
    if (dashboardEl) dashboardEl.style.display = token ? '' : 'none';
    if (logoutEl) logoutEl.style.display = token ? '' : 'none';
  }

  function logout() {
    setToken(null);
    checkAuth();
    window.location.href = '/';
  }

  function upvoteCount(s) {
    return (s.upvotes && s.upvotes.length) || (s.upvoteCount !== undefined ? s.upvoteCount : 0);
  }
  function downvoteCount(s) {
    return (s.downvotes && s.downvotes.length) || (s.downvoteCount !== undefined ? s.downvoteCount : 0);
  }

  function renderStartupCard(s) {
    var logo = s.logo ? (s.logo.startsWith('http') ? s.logo : window.location.origin + s.logo) : '';
    var logoImg = logo ? '<img class="card-logo" src="' + logo + '" alt="' + escapeHtml(s.name) + '" onerror="this.onerror=null; this.src=\'https://ui-avatars.com/api/?name=' + encodeURIComponent(s.name) + '&background=6366f1&color=fff&size=128&bold=true\';">' : '<div class="card-logo" style="background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:#fff;font-weight:bold;">' + escapeHtml(s.name.charAt(0)) + '</div>';
    var tags = (s.categoryTags || []).slice(0, 3).map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('');
    var up = upvoteCount(s);
    var down = downvoteCount(s);
    return (
      '<div class="card" data-id="' + s._id + '">' +
        '<a href="/startup.html?id=' + s._id + '" class="card-link">' +
          logoImg +
          '<div class="card-title">' + escapeHtml(s.name) + '</div>' +
          '<div class="card-pitch">' + escapeHtml(s.oneLinePitch) + '</div>' +
          '<div class="card-meta">' +
            'Funds: $' + (s.fundsRaised || 0).toLocaleString() + ' &middot; ' +
            (s.commentCount || 0) + ' comments' +
          '</div>' +
          (tags ? '<div class="card-tags">' + tags + '</div>' : '') +
        '</a>' +
        '<div class="card-actions">' +
          '<button type="button" class="vote-btn upvote" data-id="' + s._id + '" title="Upvote">&#9650; <span class="count">' + up + '</span></button>' +
          '<button type="button" class="vote-btn downvote" data-id="' + s._id + '" title="Downvote">&#9660; <span class="count">' + down + '</span></button>' +
          '<button type="button" class="follow-btn" data-id="' + s._id + '">Follow</button>' +
        '</div>' +
      '</div>'
    );
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function attachCardListeners(container) {
    if (!container) return;
    container.addEventListener('click', function (e) {
      var target = e.target.closest('.upvote');
      if (target) {
        e.preventDefault();
        var id = target.getAttribute('data-id');
        if (!api.getToken()) { alert('Please log in to vote.'); return; }
        api.upvoteStartup(id).then(function (r) {
          var card = target.closest('.card');
          card.querySelector('.upvote .count').textContent = r.upvotes;
          card.querySelector('.downvote .count').textContent = r.downvotes;
        }).catch(function (err) { alert(err.message); });
        return;
      }
      target = e.target.closest('.downvote');
      if (target) {
        e.preventDefault();
        var id = target.getAttribute('data-id');
        if (!api.getToken()) { alert('Please log in to vote.'); return; }
        api.downvoteStartup(id).then(function (r) {
          var card = target.closest('.card');
          card.querySelector('.upvote .count').textContent = r.upvotes;
          card.querySelector('.downvote .count').textContent = r.downvotes;
        }).catch(function (err) { alert(err.message); });
        return;
      }
      target = e.target.closest('.follow-btn');
      if (target) {
        e.preventDefault();
        var id = target.getAttribute('data-id');
        if (!api.getToken()) { alert('Please log in to follow.'); return; }
        api.followStartup(id).then(function (r) {
          target.textContent = r.following ? 'Unfollow' : 'Follow';
        }).catch(function (err) { alert(err.message); });
      }
    });
  }

  return {
    checkAuth: checkAuth,
    logout: logout,
    renderStartupCard: renderStartupCard,
    attachCardListeners: attachCardListeners,
    escapeHtml: escapeHtml,
    getToken: getToken,
    setToken: setToken,
    upvoteCount: upvoteCount,
    downvoteCount: downvoteCount
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  var logoutBtn = document.getElementById('navLogout');
  if (logoutBtn) logoutBtn.addEventListener('click', app.logout);
});
