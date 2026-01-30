(function () {
  app.checkAuth();

  var token = api.getToken();
  if (!token) {
    document.getElementById('dashboardContent').innerHTML = '<p class="empty-state">Please <a href="/login.html">log in</a> to view dashboard.</p>';
    return;
  }

  var user = null;
  var isFounder = false;

  api.getMe().then(function (r) {
    user = r.user;
    isFounder = user && user.role === 'founder';
    render();
  }).catch(function () {
    document.getElementById('dashboardContent').innerHTML = '<p class="empty-state">Please <a href="/login.html">log in</a> again.</p>';
  });

  function render() {
    var html = '';
    if (isFounder) {
      html += (
        '<div class="add-startup-form">' +
          '<h2>Add new startup</h2>' +
          '<div id="formAlert"></div>' +
          '<form id="addStartupForm">' +
            '<div class="form-group">' +
              '<label for="name">Startup name *</label>' +
              '<input type="text" id="name" name="name" required>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="logo">Logo (image)</label>' +
              '<input type="file" id="logo" name="logo" accept="image/*">' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="oneLinePitch">One-line pitch *</label>' +
              '<input type="text" id="oneLinePitch" name="oneLinePitch" required maxlength="200" placeholder="Short compelling pitch">' +
              '<button type="button" class="btn btn-ghost" id="improvePitchBtn">Improve with AI</button>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="detailedDescription">Detailed description *</label>' +
              '<textarea id="detailedDescription" name="detailedDescription" required rows="5"></textarea>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="fundsRaised">Funds raised ($)</label>' +
              '<input type="number" id="fundsRaised" name="fundsRaised" min="0" value="0">' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="contactEmail">Contact email for funding *</label>' +
              '<input type="email" id="contactEmail" name="contactEmail" required>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="categoryTags">Category tags (comma-separated)</label>' +
              '<input type="text" id="categoryTags" name="categoryTags" placeholder="e.g. SaaS, AI, Fintech">' +
            '</div>' +
            '<button type="submit" class="btn btn-primary">Create startup</button>' +
          '</form>' +
        '</div>'
      );
    }
    html += '<h2 class="section-title">My startups</h2>';
    html += '<div class="cards-grid" id="myStartupsGrid">Loading...</div>';
    document.getElementById('dashboardContent').innerHTML = html;

    if (isFounder) {
      document.getElementById('addStartupForm').addEventListener('submit', onSubmit);
      document.getElementById('improvePitchBtn').addEventListener('click', onImprovePitch);
    }
    loadMyStartups();
  }

  function loadMyStartups() {
    api.getStartups({ author: 'me' }).then(function (r) {
      var el = document.getElementById('myStartupsGrid');
      if (!r.data || r.data.length === 0) {
        el.innerHTML = '<p class="empty-state">You have not posted any startups yet.</p>';
        return;
      }
      el.innerHTML = r.data.map(function (s) { return app.renderStartupCard(s); }).join('');
      app.attachCardListeners(el);
    }).catch(function () {
      document.getElementById('myStartupsGrid').innerHTML = '<p class="empty-state">Could not load your startups. (Founders can post startups.)</p>';
    });
  }

  function onSubmit(e) {
    e.preventDefault();
    var alertEl = document.getElementById('formAlert');
    alertEl.innerHTML = '';
    var form = document.getElementById('addStartupForm');
    var formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('oneLinePitch', document.getElementById('oneLinePitch').value);
    formData.append('detailedDescription', document.getElementById('detailedDescription').value);
    formData.append('fundsRaised', document.getElementById('fundsRaised').value || '0');
    formData.append('contactEmail', document.getElementById('contactEmail').value);
    formData.append('categoryTags', document.getElementById('categoryTags').value || '');
    var logo = document.getElementById('logo');
    if (logo && logo.files && logo.files[0]) formData.append('logo', logo.files[0]);
    api.createStartup(formData).then(function () {
      alertEl.innerHTML = '<div class="alert alert-success">Startup created successfully.</div>';
      form.reset();
      document.getElementById('fundsRaised').value = '0';
      loadMyStartups();
    }).catch(function (err) {
      alertEl.innerHTML = '<div class="alert alert-error">' + (err.message || 'Failed to create startup') + '</div>';
    });
  }

  function onImprovePitch() {
    var pitch = document.getElementById('oneLinePitch').value.trim();
    if (!pitch) {
      alert('Enter a pitch first.');
      return;
    }
    var btn = document.getElementById('improvePitchBtn');
    btn.disabled = true;
    btn.textContent = 'Improving...';
    api.improvePitch(pitch, document.getElementById('detailedDescription').value.slice(0, 200)).then(function (r) {
      document.getElementById('oneLinePitch').value = r.improvedPitch || pitch;
      btn.textContent = 'Improve with AI';
    }).catch(function (err) {
      alert(err.message || 'AI improve failed. Add OPENAI_API_KEY to server .env for this feature.');
      btn.textContent = 'Improve with AI';
    }).then(function () {
      btn.disabled = false;
    });
  }
})();
