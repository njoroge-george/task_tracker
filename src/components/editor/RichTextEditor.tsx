"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Box, IconButton, Paper, Divider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';

type Props = {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export default function RichTextEditor({ content, onChange, placeholder = "Start typing...", minHeight = 200 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const MenuButton = ({ 
    onClick, 
    isActive, 
    icon: Icon, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any; 
    title: string;
  }) => (
    <IconButton
      size="small"
      onClick={onClick}
      sx={{
        color: isActive ? 'primary.main' : 'text.secondary',
        backgroundColor: isActive ? 'action.selected' : 'transparent',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
      title={title}
    >
      <Icon size={18} />
    </IconButton>
  );

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      {/* Toolbar */}
      <Box
        sx={{
          p: 1,
          backgroundColor: 'action.hover',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(40px, max-content))',
          gap: 0.5,
          alignItems: 'center',
        }}
      >
        {/* Text Formatting */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
          title="Bold (Ctrl+B)"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
          title="Italic (Ctrl+I)"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={Strikethrough}
          title="Strikethrough"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          icon={Code}
          title="Inline Code"
        />

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Headings */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={Heading1}
          title="Heading 1"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={Heading2}
          title="Heading 2"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          icon={Heading3}
          title="Heading 3"
        />

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Lists */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          title="Bullet List"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          title="Numbered List"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={Quote}
          title="Quote"
        />

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* History */}
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo}
          title="Undo (Ctrl+Z)"
        />
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo}
          title="Redo (Ctrl+Shift+Z)"
        />
      </Box>

      {/* Editor */}
      <Box
        sx={{
          p: 2,
          minHeight,
          '& .ProseMirror': {
            minHeight: minHeight - 32,
            outline: 'none',
            '& p.is-editor-empty:first-of-type::before': {
              color: 'text.disabled',
              content: 'attr(data-placeholder)',
              float: 'left',
              height: 0,
              pointerEvents: 'none',
            },
            '& h1': {
              fontSize: '2rem',
              fontWeight: 700,
              marginTop: '1rem',
              marginBottom: '0.5rem',
            },
            '& h2': {
              fontSize: '1.5rem',
              fontWeight: 600,
              marginTop: '0.75rem',
              marginBottom: '0.5rem',
            },
            '& h3': {
              fontSize: '1.25rem',
              fontWeight: 600,
              marginTop: '0.75rem',
              marginBottom: '0.5rem',
            },
            '& ul, & ol': {
              paddingLeft: '1.5rem',
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            '& blockquote': {
              borderLeft: '3px solid',
              borderColor: 'divider',
              paddingLeft: '1rem',
              marginLeft: 0,
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
              color: 'text.secondary',
            },
            '& code': {
              backgroundColor: 'action.hover',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
            },
            '& pre': {
              backgroundColor: 'action.hover',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflowX: 'auto',
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  );
}
