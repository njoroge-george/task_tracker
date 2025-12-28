'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Code,
  Eye,
  Upload,
  Smile,
} from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
  onAttachmentUpload?: (file: File) => Promise<{ url: string; name: string }>;
  autosaveKey?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write your comment...',
  onImageUpload,
  onAttachmentUpload,
  autosaveKey,
  minHeight = '200px',
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [attachments, setAttachments] = useState<{ url: string; name: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable the built-in link extension from StarterKit
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      // Auto-save to localStorage
      if (autosaveKey) {
        localStorage.setItem(autosaveKey, html);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  // Load draft from localStorage
  useEffect(() => {
    if (autosaveKey) {
      const draft = localStorage.getItem(autosaveKey);
      if (draft && !content) {
        editor?.commands.setContent(draft);
      }
    }
  }, [autosaveKey, editor, content]);

  // Clear draft after successful post
  const clearDraft = useCallback(() => {
    if (autosaveKey) {
      localStorage.removeItem(autosaveKey);
    }
  }, [autosaveKey]);

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = useCallback(
    async (file: File) => {
      if (!onImageUpload || !editor) return;

      setIsUploading(true);
      try {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    },
    [editor, onImageUpload]
  );

  const handleImageSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        addImage(file);
      }
    };
    input.click();
  };

  const handleAttachmentSelect = async () => {
    if (!onAttachmentUpload) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt,.zip';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsUploading(true);
        try {
          const attachment = await onAttachmentUpload(file);
          setAttachments((prev) => [...prev, attachment]);
        } catch (error) {
          console.error('Error uploading attachment:', error);
          alert('Failed to upload attachment');
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    editor?.chain().focus().insertContent(emojiData.emoji).run();
    setShowEmojiPicker(false);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
        <div className="border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0">
            <TabsTrigger value="edit" className="rounded-none">
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="rounded-none">
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit" className="m-0">
          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 border-b border-gray-300 dark:border-gray-700 flex-wrap">
            {/* Text formatting */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-700' : ''}
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

            {/* Lists */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

            {/* Code block */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-700' : ''}
              title="Code Block"
            >
              <Code className="w-4 h-4" />
              Block
            </Button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

            {/* Link */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addLink}
              className={editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-700' : ''}
              title="Add Link"
            >
              <Link2 className="w-4 h-4" />
            </Button>

            {/* Image */}
            {onImageUpload && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleImageSelect}
                disabled={isUploading}
                title="Add Image"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            )}

            {/* Attachment */}
            {onAttachmentUpload && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAttachmentSelect}
                disabled={isUploading}
                title="Add Attachment"
              >
                <Upload className="w-4 h-4" />
              </Button>
            )}

            {/* Emoji */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  title="Add Emoji"
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Editor */}
          <EditorContent 
            editor={editor} 
            style={{ minHeight }}
            className="prose-headings:font-bold prose-a:text-blue-600"
          />

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="p-4 border-t border-gray-300 dark:border-gray-700">
              <p className="text-sm font-medium mb-2">Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded px-3 py-1 text-sm"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{attachment.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="m-0 p-4" style={{ minHeight }}>
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
          />
          {attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
              <p className="text-sm font-medium mb-2">Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded px-3 py-1 text-sm"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{attachment.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
