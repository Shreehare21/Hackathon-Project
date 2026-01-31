(function() {
    app.checkAuth();
    var currentSort = 'newest';
    var currentSearch = '';

    function load() {
        var params = { sort: currentSort };
        if (currentSearch) params.search = currentSearch;
        api.getStartups(params).then(function(r) {
            var el = document.getElementById('discoverGrid');
            if (!r.success || !r.data || r.data.length === 0) {
                el.innerHTML = '<p class="empty-state">No startups match.</p>';
                return;
            }
            el.innerHTML = r.data.map(function(s) { return app.renderStartupCard(s); }).join('');
            app.attachCardListeners(el);
        }).catch(function(err) {
            console.error('Error loading startups:', err);
            document.getElementById('discoverGrid').innerHTML = '<p class="empty-state">Could not load startups. Check console for errors.</p>';
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
    var searchEl = document.getElementById('search');
    if (searchEl) searchEl.addEventListener('input', function() {
        currentSearch = this.value.trim();
        load();
    });

    load();
})();