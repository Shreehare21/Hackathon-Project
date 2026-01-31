(function() {
    app.checkAuth();
    var currentSort = 'funds';

    function load() {
        api.getLeaderboard(currentSort).then(function(r) {
            var el = document.getElementById('leaderboardGrid');
            if (!r.data || r.data.length === 0) {
                el.innerHTML = '<p class="empty-state">No startups yet.</p>';
                return;
            }
            el.innerHTML = r.data.map(function(s) { return app.renderStartupCard(s); }).join('');
            app.attachCardListeners(el);
        }).catch(function() {
            document.getElementById('leaderboardGrid').innerHTML = '<p class="empty-state">Could not load leaderboard.</p>';
        });
    }

    document.querySelectorAll('.tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
            tab.classList.add('active');
            currentSort = tab.getAttribute('data-sort');
            load();
        });
    });

    load();
})();