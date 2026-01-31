(function() {
    // Bootstrap: check auth and load initial startups with graceful fallback
    if (window.app && window.api) {
        app.checkAuth();
        api.getStartups({ sort: 'newest' }).then(function(r) {
            var el = document.getElementById('discoverGrid');
            if (!r.success || !r.data || r.data.length === 0) {
                el.innerHTML = '<p class="empty-state">No startups yet. Be the first to add one!</p>';
                return;
            }
            el.innerHTML = r.data.slice(0, 6).map(function(s) { return app.renderStartupCard(s); }).join('');
            app.attachCardListeners(el);
        }).catch(function(err) {
            console.error('Error loading startups:', err);
            document.getElementById('discoverGrid').innerHTML = '<p class="empty-state">Could not load startups. Check console for errors.</p>';
        });
    }
})();