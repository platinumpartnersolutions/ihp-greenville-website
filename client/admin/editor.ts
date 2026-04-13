import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function setupSlugSync() {
  const titleInput = document.getElementById('title') as HTMLInputElement;
  const slugInput = document.getElementById('slug') as HTMLInputElement;
  const isNew = slugInput?.dataset.new === 'true';
  if (!titleInput || !slugInput || !isNew) return;
  titleInput.addEventListener('input', () => {
    slugInput.value = slugify(titleInput.value);
  });
}

function setupToolbar(editor: Editor) {
  const actions: Record<string, () => void> = {
    'btn-h2':       () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    'btn-h3':       () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    'btn-bold':     () => editor.chain().focus().toggleBold().run(),
    'btn-italic':   () => editor.chain().focus().toggleItalic().run(),
    'btn-bullet':   () => editor.chain().focus().toggleBulletList().run(),
    'btn-ordered':  () => editor.chain().focus().toggleOrderedList().run(),
    'btn-quote':    () => editor.chain().focus().toggleBlockquote().run(),
    'btn-hr':       () => editor.chain().focus().setHorizontalRule().run(),
    'btn-link': () => {
      const prev = editor.isActive('link') ? editor.getAttributes('link').href : '';
      const url = window.prompt('Enter URL:', prev);
      if (url === null) return;
      if (url === '') { editor.chain().focus().unsetLink().run(); return; }
      editor.chain().focus().setLink({ href: url }).run();
    },
    'btn-undo': () => editor.chain().focus().undo().run(),
    'btn-redo': () => editor.chain().focus().redo().run(),
  };

  for (const [id, fn] of Object.entries(actions)) {
    document.getElementById(id)?.addEventListener('click', e => { e.preventDefault(); fn(); });
  }

  const updateActive = () => {
    const map: Record<string, boolean> = {
      'btn-h2':      editor.isActive('heading', { level: 2 }),
      'btn-h3':      editor.isActive('heading', { level: 3 }),
      'btn-bold':    editor.isActive('bold'),
      'btn-italic':  editor.isActive('italic'),
      'btn-bullet':  editor.isActive('bulletList'),
      'btn-ordered': editor.isActive('orderedList'),
      'btn-quote':   editor.isActive('blockquote'),
      'btn-link':    editor.isActive('link'),
    };
    for (const [id, active] of Object.entries(map)) {
      document.getElementById(id)?.classList.toggle('is-active', active);
    }
  };

  editor.on('selectionUpdate', updateActive);
  editor.on('transaction', updateActive);
}

function initEditor() {
  const editorEl = document.getElementById('editor-content');
  const contentInput = document.getElementById('content-input') as HTMLInputElement;
  if (!editorEl || !contentInput) return;

  const editor = new Editor({
    element: editorEl,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image,
    ],
    content: contentInput.value || '',
    editorProps: {
      attributes: { class: 'tiptap-editor' },
    },
    onUpdate: ({ editor }) => {
      contentInput.value = editor.getHTML();
    },
  });

  setupToolbar(editor);
}

document.addEventListener('DOMContentLoaded', () => {
  initEditor();
  setupSlugSync();
});
