(function() {
    var form = document.getElementById('loginForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var alertEl = document.getElementById('alert');
        alertEl.innerHTML = '';
        api.login({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        }).then(function(r) {
            api.setToken(r.token);
            window.location.href = '/';
        }).catch(function(err) {
            alertEl.innerHTML = '<div class="alert alert-error">' + (err.message || 'Login failed') + '</div>';
        });
    });
})();