(function () {
  var API_BASE = window.location.origin + '/api';

  function getToken() {
    return localStorage.getItem('token');
  }

  function setToken(token) {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }

  function getAuthHeaders() {
    var token = getToken();
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
  }

  function api(endpoint, options) {
    options = options || {};
    var url = API_BASE + endpoint;
    var config = {
      method: options.method || 'GET',
      headers: Object.assign({}, getAuthHeaders(), options.headers || {})
    };
    if (options.body && typeof options.body === 'string') config.body = options.body;
    else if (options.body) config.body = options.body;
    return fetch(url, config).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.message || 'Request failed');
        return data;
      });
    });
  }

  window.api = {
    getToken: getToken,
    setToken: setToken,
    register: function (body) {
      return api('/auth/register', { method: 'POST', body: JSON.stringify(body) });
    },
    login: function (body) {
      return api('/auth/login', { method: 'POST', body: JSON.stringify(body) });
    },
    getMe: function () {
      return api('/auth/me');
    },
    getStartups: function (params) {
      params = params || {};
      var q = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
      return api('/startups' + (q ? '?' + q : ''));
    },
    getStartupById: function (id) {
      return api('/startups/' + id);
    },
    createStartup: function (formData) {
      var token = getToken();
      var headers = {};
      if (token) headers['Authorization'] = 'Bearer ' + token;
      return fetch(API_BASE + '/startups', { method: 'POST', headers: headers, body: formData })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (!res.ok) throw new Error(data.message || 'Failed');
          return data;
        });
    },
    updateStartup: function (id, formData) {
      var token = getToken();
      var headers = {};
      if (token) headers['Authorization'] = 'Bearer ' + token;
      return fetch(API_BASE + '/startups/' + id, { method: 'PUT', headers: headers, body: formData })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (!res.ok) throw new Error(data.message || 'Failed');
          return data;
        });
    },
    deleteStartup: function (id) {
      return api('/startups/' + id, { method: 'DELETE' });
    },
    upvoteStartup: function (id) {
      return api('/startups/' + id + '/upvote', { method: 'POST' });
    },
    downvoteStartup: function (id) {
      return api('/startups/' + id + '/downvote', { method: 'POST' });
    },
    followStartup: function (id) {
      return api('/startups/' + id + '/follow', { method: 'POST' });
    },
    getComments: function (startupId) {
      return api('/startups/' + startupId + '/comments');
    },
    addComment: function (startupId, content, parentId) {
      return api('/startups/' + startupId + '/comments', {
        method: 'POST',
        body: JSON.stringify({ content: content, parentId: parentId || undefined })
      });
    },
    upvoteComment: function (id) {
      return api('/comments/' + id + '/upvote', { method: 'POST' });
    },
    downvoteComment: function (id) {
      return api('/comments/' + id + '/downvote', { method: 'POST' });
    },
    getLeaderboard: function (sort) {
      return api('/leaderboard?sort=' + (sort || 'funds'));
    },
    improvePitch: function (currentPitch, context) {
      return api('/ai/improve-pitch', {
        method: 'POST',
        body: JSON.stringify({ currentPitch: currentPitch, context: context || '' })
      });
    }
  };
})();
