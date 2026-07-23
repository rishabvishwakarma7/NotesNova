'use client';

import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Code, Quote, Highlighter, Image as ImageIcon,
  Table as TableIcon, Undo, Redo, Minus,
} from 'lucide-react';

export default function Toolbar({ editor }) {
  if (!editor) return null;

  const ToolBtn = ({ onClick, active, icon: Icon, title }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 34, height: 34, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(139,92,246,0.15)' : 'transparent',
        border: 'none', cursor: 'pointer',
        color: active ? '#A78BFA' : 'var(--text-muted)',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-glass-hover)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon size={16} />
    </button>
  );

  const Divider = () => (
    <div style={{ width: 1, height: 24, background: 'var(--border-color)', margin: '0 4px' }} />
  );

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2,
      padding: '8px 12px', flexWrap: 'wrap',
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
    }}>
      <ToolBtn onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Undo" />
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Redo" />
      <Divider />
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} icon={Heading1} title="Heading 1" />
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} icon={Heading2} title="Heading 2" />
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} icon={Heading3} title="Heading 3" />
      <Divider />
      <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={Bold} title="Bold" />
      <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic} title="Italic" />
      <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={UnderlineIcon} title="Underline" />
      <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />
      <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} icon={Highlighter} title="Highlight" />
      <Divider />
      <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={List} title="Bullet List" />
      <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered List" />
      <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} icon={Code} title="Code Block" />
      <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={Quote} title="Quote" />
      <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={Minus} title="Divider" />
      <Divider />
      <ToolBtn onClick={addImage} icon={ImageIcon} title="Insert Image" />
      <ToolBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} icon={TableIcon} title="Insert Table" />
    </div>
  );
}
