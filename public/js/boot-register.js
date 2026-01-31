(function() {
    var form = document.getElementById('registerForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var alertEl = document.getElementById('alert');
        alertEl.innerHTML = '';
        api.register({
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            role: document.getElementById('role').value
        }).then(function(r) {
            api.setToken(r.token);
            window.location.href = '/';
        }).catch(function(err) {
            alertEl.innerHTML = '<div class="alert alert-error">' + (err.message || 'Registration failed') + '</div>';
        });
    });
})();