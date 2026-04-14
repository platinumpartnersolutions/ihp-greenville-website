import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import type { BlogPost } from '@shared/schema';
import path from 'path';
import fs from 'fs';

const router = Router();

// ─── Static assets ───────────────────────────────────────────────
const adminPublicDir = path.resolve(process.cwd(), 'public', 'admin');
router.use('/static', (req, res, next) => {
  const file = path.join(adminPublicDir, req.path);
  if (fs.existsSync(file)) return res.sendFile(file);
  next();
});

// ─── Auth middleware ──────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  res.redirect('/admin/login');
}

// ─── CSS ──────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap');

  :root {
    --primary: #2F814A;
    --primary-dark: #24633a;
    --primary-light: rgba(47,129,74,0.08);
    --secondary: #68CCD1;
    --bg: #ffffff;
    --card: #f7f8f9;
    --fg: #111827;
    --muted: #6b7280;
    --border: #e5e7eb;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-heading: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
    --font-body: 'Source Sans 3', 'Segoe UI', system-ui, sans-serif;
    --radius: 10px;
    --shadow: 0 1px 4px rgba(0,0,0,.07);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--font-body); background: var(--card); color: var(--fg); min-height: 100vh; -webkit-font-smoothing: antialiased; }

  /* ── Login ── */
  .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(150deg, #0d2b18 0%, #1a4d2b 50%, #2F814A 100%); }
  .login-card { background: var(--bg); border-radius: 16px; padding: 52px 44px; width: 100%; max-width: 420px; box-shadow: 0 24px 64px rgba(0,0,0,0.35); }
  .login-brand { text-align: center; margin-bottom: 36px; }
  .login-brand .logo { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: var(--primary); border-radius: 12px; color: #fff; font-family: var(--font-heading); font-size: 17px; font-weight: 700; letter-spacing: 1px; margin-bottom: 20px; }
  .login-brand h1 { font-family: var(--font-display); font-size: 26px; font-weight: 500; color: var(--fg); margin-bottom: 6px; }
  .login-brand p { font-family: var(--font-body); font-size: 14px; color: var(--muted); }
  .login-error { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; padding: 10px 14px; border-radius: 8px; font-size: 14px; margin-bottom: 20px; }
  .form-group { margin-bottom: 18px; }
  .form-group label { display: block; font-family: var(--font-heading); font-size: 12px; font-weight: 600; letter-spacing: 0.04em; color: var(--fg); margin-bottom: 7px; text-transform: uppercase; }
  .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 8px; font-family: var(--font-body); font-size: 15px; color: var(--fg); background: var(--bg); transition: border-color .15s, box-shadow .15s; outline: none; }
  .form-group input:focus, .form-group textarea:focus, .form-group select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(47,129,74,.12); }
  .form-group textarea { resize: vertical; min-height: 84px; line-height: 1.6; }
  .btn-primary { width: 100%; padding: 13px; background: var(--primary); color: #fff; border: none; border-radius: 2rem; font-family: var(--font-heading); font-size: 14px; font-weight: 600; letter-spacing: 0.02em; cursor: pointer; transition: background .15s, transform .1s, box-shadow .15s; box-shadow: 0 4px 16px rgba(47,129,74,.28); margin-top: 4px; }
  .btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(47,129,74,.38); }

  /* ── Layout ── */
  .admin-layout { display: flex; min-height: 100vh; }
  .sidebar { width: 232px; background: var(--fg); flex-shrink: 0; display: flex; flex-direction: column; }
  .sidebar-brand { padding: 26px 20px 22px; border-bottom: 1px solid rgba(255,255,255,.08); }
  .sidebar-brand .logo { display: inline-flex; align-items: center; gap: 10px; color: #fff; text-decoration: none; }
  .sidebar-brand .logo-icon { width: 32px; height: 32px; background: var(--primary); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-family: var(--font-heading); font-size: 12px; font-weight: 700; color: #fff; letter-spacing: .5px; flex-shrink: 0; }
  .sidebar-brand .logo-text { font-family: var(--font-display); font-size: 17px; font-weight: 500; color: #fff; }
  .sidebar-brand .logo-sub { font-family: var(--font-heading); font-size: 10px; font-weight: 500; color: rgba(255,255,255,.45); letter-spacing: .08em; text-transform: uppercase; margin-top: 1px; }
  .sidebar-nav { padding: 18px 12px; flex: 1; }
  .sidebar-nav a { display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 8px; color: rgba(255,255,255,.55); text-decoration: none; font-family: var(--font-heading); font-size: 13px; font-weight: 500; transition: all .15s; margin-bottom: 2px; }
  .sidebar-nav a:hover, .sidebar-nav a.active { background: rgba(47,129,74,.25); color: #fff; }
  .sidebar-nav a.active { color: #7dd3a8; }
  .sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,.08); }
  .sidebar-footer a { display: block; padding: 8px 12px; color: rgba(255,255,255,.45); text-decoration: none; font-family: var(--font-heading); font-size: 12px; font-weight: 500; border-radius: 6px; transition: color .15s; }
  .sidebar-footer a:hover { color: rgba(255,255,255,.8); }
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .main-header { background: var(--bg); border-bottom: 1px solid var(--border); padding: 18px 32px; display: flex; align-items: center; justify-content: space-between; }
  .main-header h1 { font-family: var(--font-display); font-size: 22px; font-weight: 500; color: var(--fg); }
  .main-content { padding: 32px; flex: 1; overflow-y: auto; }

  /* ── Buttons ── */
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 2rem; font-family: var(--font-heading); font-size: 13px; font-weight: 600; cursor: pointer; border: none; text-decoration: none; transition: all .15s; letter-spacing: .02em; }
  .btn-green { background: var(--primary); color: #fff; box-shadow: 0 4px 14px rgba(47,129,74,.25); }
  .btn-green:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(47,129,74,.35); }
  .btn-outline { background: transparent; color: var(--fg); border: 1.5px solid var(--border); }
  .btn-outline:hover { background: var(--card); border-color: #9ca3af; }
  .btn-danger { background: #dc2626; color: #fff; }
  .btn-danger:hover { background: #b91c1c; }
  .btn-sm { padding: 6px 14px; font-size: 12px; }
  .btn-publish { background: #1d4ed8; color: #fff; box-shadow: 0 4px 14px rgba(29,78,216,.22); }
  .btn-publish:hover { background: #1e40af; }

  /* ── Posts table ── */
  .posts-table { width: 100%; border-collapse: collapse; background: var(--bg); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); border: 1px solid var(--border); }
  .posts-table th { text-align: left; padding: 14px 20px; font-family: var(--font-heading); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); background: var(--card); border-bottom: 1px solid var(--border); }
  .posts-table td { padding: 14px 20px; font-family: var(--font-body); font-size: 14px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
  .posts-table tr:last-child td { border-bottom: none; }
  .posts-table tr:hover td { background: var(--primary-light); }
  .post-title-link { color: var(--fg); text-decoration: none; font-weight: 500; }
  .post-title-link:hover { color: var(--primary); }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 2rem; font-family: var(--font-heading); font-size: 11px; font-weight: 600; letter-spacing: .04em; }
  .badge-green { background: rgba(47,129,74,.1); color: var(--primary); }
  .badge-gray { background: #f3f4f6; color: var(--muted); }

  /* ── Editor ── */
  .editor-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
  .editor-card { background: var(--bg); border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--border); overflow: hidden; }
  .editor-card-header { padding: 14px 20px; border-bottom: 1px solid var(--border); font-family: var(--font-heading); font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; background: var(--card); }
  .editor-card-body { padding: 20px; }
  .toolbar { display: flex; flex-wrap: wrap; gap: 2px; padding: 10px 12px; border-bottom: 1px solid var(--border); background: var(--card); }
  .toolbar-btn { padding: 5px 9px; border: 1px solid transparent; border-radius: 6px; background: transparent; cursor: pointer; font-family: var(--font-heading); font-size: 12px; font-weight: 600; color: var(--muted); transition: all .1s; }
  .toolbar-btn:hover { background: var(--border); color: var(--fg); }
  .toolbar-btn.is-active { background: var(--primary); color: #fff; border-color: var(--primary); }
  .toolbar-sep { width: 1px; background: var(--border); margin: 4px 4px; }
  .tiptap-editor { min-height: 400px; padding: 24px; outline: none; font-family: var(--font-body); font-size: 16px; line-height: 1.75; color: var(--fg); }
  .tiptap-editor h2 { font-family: var(--font-display); font-size: 24px; font-weight: 500; margin: 24px 0 10px; color: var(--fg); }
  .tiptap-editor h3 { font-family: var(--font-heading); font-size: 17px; font-weight: 700; margin: 20px 0 8px; color: var(--fg); }
  .tiptap-editor p { margin-bottom: 16px; }
  .tiptap-editor ul, .tiptap-editor ol { margin: 10px 0 16px 26px; }
  .tiptap-editor li { margin-bottom: 5px; }
  .tiptap-editor blockquote { border-left: 3px solid var(--primary); margin: 20px 0; padding: 10px 20px; color: var(--muted); font-style: italic; font-family: var(--font-display); font-size: 17px; background: var(--primary-light); border-radius: 0 6px 6px 0; }
  .tiptap-editor a { color: var(--primary); text-decoration: underline; }
  .tiptap-editor hr { border: none; border-top: 2px solid var(--border); margin: 24px 0; }
  .tiptap-editor p.is-empty::before { content: attr(data-placeholder); color: #d1d5db; pointer-events: none; font-style: italic; }
  .editor-word-count { padding: 8px 20px; font-family: var(--font-heading); font-size: 11px; color: #d1d5db; border-top: 1px solid #f3f4f6; text-align: right; letter-spacing: .03em; }
  .action-bar { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; }
  .notice { background: rgba(47,129,74,.08); border: 1px solid rgba(47,129,74,.25); color: var(--primary-dark); padding: 10px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 20px; }
  .breadcrumb { font-family: var(--font-heading); font-size: 11px; font-weight: 500; color: var(--muted); margin-bottom: 4px; letter-spacing: .03em; text-transform: uppercase; }
  .breadcrumb a { color: var(--primary); text-decoration: none; }
  .rebuild-section { margin-top: 32px; background: var(--bg); border-radius: var(--radius); padding: 20px 24px; box-shadow: var(--shadow); border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .rebuild-info h3 { font-family: var(--font-heading); font-size: 14px; font-weight: 600; margin-bottom: 4px; }
  .rebuild-info p { font-family: var(--font-body); font-size: 13px; color: var(--muted); }
`;

// ─── HTML Shell ───────────────────────────────────────────────────
function page(title: string, body: string, scripts = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} — IHP Admin</title>
  <style>${css}</style>
</head>
<body>
  ${body}
  ${scripts}
</body>
</html>`;
}

function adminLayout(heading: string, breadcrumb: string, content: string, scripts = ''): string {
  return page(heading, `
  <div class="admin-layout">
    <nav class="sidebar">
      <div class="sidebar-brand">
        <a href="/admin/posts" class="logo"><span>IHP</span> Admin</a>
      </div>
      <div class="sidebar-nav">
        <a href="/admin/posts" class="active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
          Blog Posts
        </a>
        <a href="/admin/posts/new">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Post
        </a>
      </div>
      <div class="sidebar-footer">
        <a href="/blog" target="_blank">↗ View Live Blog</a>
        <a href="/admin/logout">Sign Out</a>
      </div>
    </nav>
    <div class="main">
      <div class="main-header">
        <div>
          ${breadcrumb ? `<div class="breadcrumb">${breadcrumb}</div>` : ''}
          <h1>${heading}</h1>
        </div>
      </div>
      <div class="main-content">
        ${content}
      </div>
    </div>
  </div>`, scripts);
}

// ─── Login ────────────────────────────────────────────────────────
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/admin/posts');
  const error = req.query.error === '1' ? 'Invalid username or password.' : '';
  res.send(page('Sign In', `
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="logo">IHP</div>
        <h1>Welcome Dr. Hendry</h1>
        <p>Sign in to manage your blog</p>
      </div>
      ${error ? `<div class="login-error">${error}</div>` : ''}
      <form method="POST" action="/admin/login">
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" name="username" autocomplete="username" required autofocus>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" autocomplete="current-password" required>
        </div>
        <button type="submit" class="btn-primary">Sign In</button>
      </form>
    </div>
  </div>`));
});

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/admin/login?error=1' }),
  (_req, res) => res.redirect('/admin/posts')
);

router.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/admin/login'));
});

// ─── Posts List ───────────────────────────────────────────────────
router.get('/', requireAuth, (_req, res) => res.redirect('/admin/posts'));

router.get('/posts', requireAuth, async (_req, res) => {
  const posts = await storage.getAllBlogPosts();
  const rows = posts.map(p => {
    const date = new Date(p.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    return `
    <tr>
      <td><a href="/admin/posts/${encodeURIComponent(p.slug)}/edit" class="post-title-link">${escHtml(p.title)}</a></td>
      <td>${date}</td>
      <td><span class="badge badge-green">Published</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <a href="/admin/posts/${encodeURIComponent(p.slug)}/edit" class="btn btn-outline btn-sm">Edit</a>
          <a href="/blog/${encodeURIComponent(p.slug)}/" target="_blank" class="btn btn-outline btn-sm">View ↗</a>
        </div>
      </td>
    </tr>`;
  }).join('');

  res.send(adminLayout('Blog Posts', '', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <span style="color:#6b7280;font-size:14px">${posts.length} posts</span>
      <a href="/admin/posts/new" class="btn btn-green">+ New Post</a>
    </div>
    <table class="posts-table">
      <thead><tr>
        <th>Title</th><th>Date</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:#9ca3af;padding:40px">No posts yet.</td></tr>'}</tbody>
    </table>
    <div class="rebuild-section">
      <div class="rebuild-info">
        <h3>Publish to Live Site</h3>
        <p>After saving posts, click here to rebuild and push changes live.</p>
      </div>
      <form method="POST" action="/admin/rebuild">
        <button type="submit" class="btn btn-publish">🚀 Rebuild Site</button>
      </form>
    </div>`));
});

// ─── New Post ─────────────────────────────────────────────────────
router.get('/posts/new', requireAuth, (_req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.send(adminLayout('New Post', '<a href="/admin/posts">Blog Posts</a> / New Post', editorHtml({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    pubDate: today,
    categories: '',
    isNew: true,
    saved: false,
  }), editorScript()));
});

router.post('/posts/new', requireAuth, async (req, res) => {
  const { title, slug, excerpt, content, pubDate, categories } = req.body;
  const cats = (categories || '').split(',').map((c: string) => c.trim()).filter(Boolean);
  await storage.upsertBlogPost({
    title: title.trim(),
    slug: slug.trim(),
    link: `https://www.ihpgreenville.com/blog/${slug.trim()}/`,
    pubDate: new Date(pubDate),
    creator: 'Dr. William Hendry, DAOM',
    excerpt: excerpt.trim(),
    content: content.trim(),
    categories: cats,
  });
  res.redirect(`/admin/posts/${encodeURIComponent(slug.trim())}/edit?saved=1`);
});

// ─── Edit Post ────────────────────────────────────────────────────
router.get('/posts/:slug/edit', requireAuth, async (req, res) => {
  const post = await storage.getBlogPostBySlug(req.params.slug);
  if (!post) return res.redirect('/admin/posts');
  const saved = req.query.saved === '1';
  res.send(adminLayout(
    post.title || 'Edit Post',
    `<a href="/admin/posts">Blog Posts</a> / ${escHtml(post.title)}`,
    editorHtml({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      pubDate: new Date(post.pubDate).toISOString().split('T')[0],
      categories: (post.categories || []).join(', '),
      isNew: false,
      saved,
    }),
    editorScript()
  ));
});

router.post('/posts/:slug/edit', requireAuth, async (req, res) => {
  const { title, excerpt, content, pubDate, categories } = req.body;
  const cats = (categories || '').split(',').map((c: string) => c.trim()).filter(Boolean);
  await storage.upsertBlogPost({
    title: title.trim(),
    slug: req.params.slug,
    link: `https://www.ihpgreenville.com/blog/${req.params.slug}/`,
    pubDate: new Date(pubDate),
    creator: 'Dr. William Hendry, DAOM',
    excerpt: excerpt.trim(),
    content: content.trim(),
    categories: cats,
  });
  res.redirect(`/admin/posts/${encodeURIComponent(req.params.slug)}/edit?saved=1`);
});

// ─── Rebuild ──────────────────────────────────────────────────────
router.post('/rebuild', requireAuth, async (_req, res) => {
  const hookUrl = process.env.NETLIFY_DEPLOY_HOOK;
  if (!hookUrl) return res.redirect('/admin/posts?rebuild=no-hook');
  try {
    await fetch(hookUrl, { method: 'POST' });
  } catch (e) {
    console.error('Rebuild webhook failed:', e);
  }
  res.redirect('/admin/posts?rebuild=triggered');
});

// ─── Setup (first-time admin user creation) ───────────────────────
router.get('/setup', async (_req, res) => {
  const existing = await storage.getUserByUsername('admin');
  if (existing) return res.redirect('/admin/login');
  res.send(page('Setup', `
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="logo">IHP</div>
        <h1>Setup Admin Account</h1>
        <p>Create your login credentials</p>
      </div>
      <form method="POST" action="/admin/setup">
        <div class="form-group">
          <label>Username</label>
          <input type="text" name="username" value="dr-hendry" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" name="password" required minlength="8">
        </div>
        <button type="submit" class="btn-primary">Create Account</button>
      </form>
    </div>
  </div>`));
});

router.post('/setup', async (req, res) => {
  const existing = await storage.getUserByUsername(req.body.username);
  if (existing) return res.redirect('/admin/login');
  const hashed = await bcrypt.hash(req.body.password, 12);
  await storage.createUser({ username: req.body.username, password: hashed });
  res.redirect('/admin/login');
});

// ─── Editor HTML helper ───────────────────────────────────────────
interface EditorOptions {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  pubDate: string;
  categories: string;
  isNew: boolean;
  saved: boolean;
}

function editorHtml(o: EditorOptions): string {
  const action = o.isNew ? '/admin/posts/new' : `/admin/posts/${encodeURIComponent(o.slug)}/edit`;
  return `
  ${o.saved ? '<div class="notice">✓ Changes saved successfully.</div>' : ''}
  <form method="POST" action="${action}" id="post-form">
    <div class="editor-layout">
      <div>
        <div class="editor-card" style="margin-bottom:24px">
          <div class="editor-card-header">Content</div>
          <div class="toolbar">
            <button class="toolbar-btn" id="btn-h2" type="button" title="Heading 2">H2</button>
            <button class="toolbar-btn" id="btn-h3" type="button" title="Heading 3">H3</button>
            <div class="toolbar-sep"></div>
            <button class="toolbar-btn" id="btn-bold" type="button" title="Bold"><b>B</b></button>
            <button class="toolbar-btn" id="btn-italic" type="button" title="Italic"><i>I</i></button>
            <div class="toolbar-sep"></div>
            <button class="toolbar-btn" id="btn-bullet" type="button" title="Bullet list">• List</button>
            <button class="toolbar-btn" id="btn-ordered" type="button" title="Numbered list">1. List</button>
            <div class="toolbar-sep"></div>
            <button class="toolbar-btn" id="btn-quote" type="button" title="Blockquote">" Quote</button>
            <button class="toolbar-btn" id="btn-hr" type="button" title="Divider">— Rule</button>
            <button class="toolbar-btn" id="btn-link" type="button" title="Link">🔗 Link</button>
            <div class="toolbar-sep"></div>
            <button class="toolbar-btn" id="btn-undo" type="button" title="Undo">↩ Undo</button>
            <button class="toolbar-btn" id="btn-redo" type="button" title="Redo">↪ Redo</button>
          </div>
          <div id="editor-content"></div>
          <div class="editor-word-count" id="word-count"></div>
          <input type="hidden" name="content" id="content-input" value="${escAttr(o.content)}">
        </div>
        <div class="action-bar">
          <a href="/admin/posts" class="btn btn-outline">Cancel</a>
          <button type="submit" class="btn btn-green">Save Post</button>
        </div>
      </div>
      <div>
        <div class="editor-card" style="margin-bottom:16px">
          <div class="editor-card-header">Details</div>
          <div class="editor-card-body">
            <div class="form-group">
              <label for="title">Title</label>
              <input type="text" id="title" name="title" value="${escAttr(o.title)}" required placeholder="Post title...">
            </div>
            <div class="form-group">
              <label for="slug">URL Slug</label>
              <input type="text" id="slug" name="slug" value="${escAttr(o.slug)}" required
                ${o.isNew ? 'data-new="true"' : 'readonly style="background:#f9fafb;color:#6b7280"'}
                placeholder="my-post-slug">
              ${!o.isNew ? '<p style="font-size:12px;color:#9ca3af;margin-top:4px">Slug cannot be changed after creation</p>' : ''}
            </div>
            <div class="form-group">
              <label for="pubDate">Publish Date</label>
              <input type="date" id="pubDate" name="pubDate" value="${escAttr(o.pubDate)}" required>
            </div>
          </div>
        </div>
        <div class="editor-card" style="margin-bottom:16px">
          <div class="editor-card-header">Excerpt</div>
          <div class="editor-card-body">
            <div class="form-group" style="margin:0">
              <textarea id="excerpt" name="excerpt" rows="4" placeholder="Brief summary shown in blog listings and meta description...">${escHtml(o.excerpt)}</textarea>
            </div>
          </div>
        </div>
        <div class="editor-card">
          <div class="editor-card-header">Categories</div>
          <div class="editor-card-body">
            <div class="form-group" style="margin:0">
              <input type="text" id="categories" name="categories" value="${escAttr(o.categories)}" placeholder="acupuncture, pain relief, wellness">
              <p style="font-size:12px;color:#9ca3af;margin-top:4px">Comma-separated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>`;
}

function editorScript(): string {
  return `<script src="/admin/static/editor.js"></script>
<script>
  // Word count
  const wc = document.getElementById('word-count');
  const ci = document.getElementById('content-input');
  function updateWordCount() {
    const text = ci.value.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim();
    const words = text ? text.split(' ').length : 0;
    if (wc) wc.textContent = words + ' words';
  }
  const obs = new MutationObserver(updateWordCount);
  const editorEl = document.getElementById('editor-content');
  if (editorEl) obs.observe(editorEl, { childList: true, subtree: true, characterData: true });
  updateWordCount();
</script>`;
}

// ─── Escape helpers ───────────────────────────────────────────────
function escHtml(s: string): string {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escAttr(s: string): string {
  return (s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
}

export { router as adminRouter };
