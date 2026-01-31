const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PUBLIC = path.join(__dirname, '..', 'public');
const DIST = path.join(PUBLIC, 'dist');
const JS_IN = path.join(PUBLIC, 'js');
const CSS_IN = path.join(PUBLIC, 'css', 'style.css');

function hash(content) {
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function buildJS(entryPath, outName) {
    const result = await esbuild.build({
        entryPoints: [entryPath],
        bundle: true,
        minify: true,
        sourcemap: false,
        write: false,
        format: 'iife',
        target: ['es2017']
    });
    const file = result.outputFiles[0];
    const h = hash(file.contents);
    const fileName = `${outName}.${h}.js`;
    fs.writeFileSync(path.join(DIST, 'js', fileName), file.contents);
    return { name: outName, fileName };
}

async function buildCSS(inPath) {
    const css = fs.readFileSync(inPath, 'utf8');
    const result = await esbuild.transform(css, { loader: 'css', minify: true });
    const h = hash(result.code);
    const fileName = `style.min.${h}.css`;
    fs.writeFileSync(path.join(DIST, 'css', fileName), result.code);
    return { name: 'style.min.css', fileName };
}

async function run() {
    ensureDir(DIST);
    ensureDir(path.join(DIST, 'js'));
    ensureDir(path.join(DIST, 'css'));

    // discover all entry JS files in public/js
    const entries = fs.readdirSync(JS_IN).filter(f => f.endsWith('.js'));
    const jsResults = [];
    for (const file of entries) {
        const entryPath = path.join(JS_IN, file);
        const base = path.basename(file, '.js');
        const outName = base; // use original base as logical name
        console.log('Bundling', file);
        try {
            const res = await buildJS(entryPath, outName);
            jsResults.push(res);
        } catch (err) {
            console.error('Failed to bundle', file, err.message);
        }
    }

    // build CSS
    const cssRes = await buildCSS(CSS_IN);

    // create assets manifest
    const manifest = {
        js: jsResults.reduce((acc, r) => (acc[r.name] = '/dist/js/' + r.fileName, acc), {}),
        css: { 'style.min.css': '/dist/css/' + cssRes.fileName }
    };
    fs.writeFileSync(path.join(DIST, 'assets-manifest.json'), JSON.stringify(manifest, null, 2));

    // Update HTML files to point to hashed filenames
    const htmlFiles = fs.readdirSync(PUBLIC).filter(f => f.endsWith('.html'));
    for (const html of htmlFiles) {
        const filePath = path.join(PUBLIC, html);
        let content = fs.readFileSync(filePath, 'utf8');

        // replace CSS reference
        content = content.replace(/\/dist\/css\/style\.min\.css/g, manifest.css['style.min.css']);

        // replace JS references: look for /dist/js/<base>.js and replace with hashed
        for (const r of jsResults) {
            const re = new RegExp(`/dist/js/${r.name}\\.js`, 'g');
            content = content.replace(re, '/dist/js/' + r.fileName);
        }

        fs.writeFileSync(filePath, content);
        console.log('Updated', html);
    }

    // Update service worker ASSETS list
    const swPath = path.join(PUBLIC, 'service-worker.js');
    if (fs.existsSync(swPath)) {
        let sw = fs.readFileSync(swPath, 'utf8');
        const assets = [
            '/',
            '/index.html',
            '/discover.html',
            '/leaderboard.html',
            '/login.html',
            '/register.html',
            '/startup.html',
            '/dashboard.html',
            manifest.css['style.min.css']
        ];
        for (const r of jsResults) assets.push('/dist/js/' + r.fileName);
        // replace between markers
        const start = 'const ASSETS = [';
        const startIdx = sw.indexOf(start);
        if (startIdx !== -1) {
            const endIdx = sw.indexOf('];', startIdx);
            if (endIdx !== -1) {
                const newArray = 'const ASSETS = [\n' + assets.map(a => `  '${a}'`).join(',\n') + '\n];';
                sw = sw.slice(0, startIdx) + newArray + sw.slice(endIdx + 2);
                fs.writeFileSync(swPath, sw);
                console.log('Service worker assets updated');
            }
        }

        // write manifest to dist for reference
        fs.writeFileSync(path.join(DIST, 'assets-manifest.json'), JSON.stringify({ js: jsResults.reduce((acc, r) => (acc[r.name] = '/dist/js/' + r.fileName, acc), {}), css: manifest.css }, null, 2));
    }

    console.log('Build complete. Manifest written to public/dist/assets-manifest.json');
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});