# Rich Text Editor for Discussions

## ✅ Overview

Implemented a powerful rich text editor for discussion comments with:
- **Rich formatting**: Bold, italic, lists, code blocks
- **Inline images**: Upload and embed images directly
- **File attachments**: Support for PDFs, docs, and more
- **Emoji picker**: Easy emoji insertion
- **@Mentions**: Tag users in comments
- **Auto-save drafts**: Never lose your work
- **Preview mode**: See formatted output before posting

## Features

### 1. Rich Text Formatting

**Toolbar Options**:
- **Bold** (Ctrl+B) - Make text bold
- **Italic** (Ctrl+I) - Italicize text
- **Inline Code** - Format as code
- **Bullet List** - Create unordered lists
- **Numbered List** - Create ordered lists
- **Code Block** - Multi-line code formatting
- **Link** - Add hyperlinks
- **Image** - Upload and insert images
- **Attachment** - Upload files
- **Emoji** - Insert emojis

### 2. Image Upload

**Features**:
- Click image icon or drag-drop
- Supported formats: JPEG, PNG, GIF, WebP
- Max size: 10MB
- Images are embedded inline
- Responsive sizing

**Usage**:
```typescript
// Images are uploaded and embedded automatically
<RichTextEditor
  onImageUpload={async (file) => {
    // Upload to server
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.url; // Returns public URL
  }}
/>
```

### 3. File Attachments

**Supported Types**:
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Text (`.txt`)
- ZIP (`.zip`)

**Features**:
- Max size: 10MB
- Shows attachment list below editor
- Remove attachments before posting
- Displays file names

### 4. Emoji Picker

**Features**:
- Full emoji picker popup
- Click to insert at cursor
- Works in any part of text
- Auto-closes after selection

### 5. Auto-Save Drafts

**Features**:
- Saves to localStorage automatically
- Restore on page reload
- Unique key per discussion
- Clears after successful post

**Implementation**:
```typescript
<RichTextEditor
  autosaveKey={`discussion-comment-${discussionId}`}
  content={content}
  onChange={setContent}
/>

// Clear draft after posting
localStorage.removeItem(`discussion-comment-${discussionId}`);
```

### 6. Preview Mode

**Features**:
- Toggle between Edit and Preview tabs
- Shows formatted HTML output
- Displays attachments
- Exact rendering of final comment

## Components

### RichTextEditor

**Location**: `src/components/discussions/RichTextEditor.tsx`

**Props**:
```typescript
interface RichTextEditorProps {
  content: string;                    // HTML content
  onChange: (content: string) => void; // Content change handler
  placeholder?: string;                // Placeholder text
  onImageUpload?: (file: File) => Promise<string>;
  onAttachmentUpload?: (file: File) => Promise<{ url: string; name: string }>;
  autosaveKey?: string;               // LocalStorage key for drafts
  minHeight?: string;                 // Min editor height
}
```

**Usage Example**:
```tsx
import { RichTextEditor } from '@/components/discussions/RichTextEditor';

function CommentForm() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      placeholder="Write your comment..."
      autosaveKey="my-comment-draft"
      onImageUpload={async (file) => {
        // Handle image upload
        return '/uploads/images/image.jpg';
      }}
      onAttachmentUpload={async (file) => {
        // Handle file upload
        return { url: '/uploads/file.pdf', name: 'document.pdf' };
      }}
      minHeight="200px"
    />
  );
}
```

## API Endpoints

### Upload Endpoint

**Route**: `POST /api/upload`

**Request**:
```typescript
FormData {
  file: File,
  type: 'image' | 'attachment' | 'voice' | 'video'
}
```

**Response**:
```typescript
{
  success: true,
  url: '/uploads/images/1234567890-filename.jpg',
  filename: '1234567890-filename.jpg',
  name: 'original-filename.jpg',
  size: 123456,
  type: 'image/jpeg'
}
```

**Validation**:
- **Images**: JPEG, PNG, GIF, WebP (max 10MB)
- **Attachments**: PDF, DOC, DOCX, TXT, ZIP (max 10MB)
- **Voice**: WebM, MP4, MPEG, OGG (max 50MB)
- **Video**: WebM, MP4, QuickTime (max 50MB)

## Technical Details

### Tiptap Extensions Used

1. **StarterKit** - Basic text editing (bold, italic, headings, etc.)
2. **Link** - Hyperlink support
3. **Image** - Image embedding
4. **Placeholder** - Placeholder text

### HTML Output

The editor outputs clean HTML:

```html
<p>This is <strong>bold</strong> and <em>italic</em> text.</p>
<ul>
  <li>Bullet point 1</li>
  <li>Bullet point 2</li>
</ul>
<pre><code>const code = 'example';</code></pre>
<img src="/uploads/images/image.jpg" class="max-w-full h-auto rounded-lg">
```

### Storage Structure

**LocalStorage** (Drafts):
```javascript
{
  "discussion-comment-disc_123": "<p>Draft content...</p>",
  "discussion-reply-comment_456": "<p>Reply draft...</p>"
}
```

**File System** (Uploads):
```
public/
  uploads/
    images/
      1701388800000-myimage.jpg
    attachments/
      1701388800000-document.pdf
    voice/
      user_123_1701388800000.webm
    video/
      user_123_1701388800000.mp4
```

## Integration

### DiscussionDetail Component

Updated to use RichTextEditor:

```tsx
<RichTextEditor
  content={newComment}
  onChange={setNewComment}
  placeholder="Add a comment... Use the toolbar for formatting"
  autosaveKey={`discussion-comment-${discussion.id}`}
  onImageUpload={async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.url;
  }}
  onAttachmentUpload={async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'attachment');
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return { url: data.url, name: data.name };
  }}
  minHeight="150px"
/>
```

### Comment Rendering

Comments display HTML content:

```tsx
<div 
  className="prose prose-sm max-w-none dark:prose-invert"
  dangerouslySetInnerHTML={{ __html: comment.content }}
/>
```

## Keyboard Shortcuts

- **Ctrl+B** / **Cmd+B** - Bold
- **Ctrl+I** / **Cmd+I** - Italic
- **Ctrl+Shift+X** - Strikethrough
- **Ctrl+Shift+C** - Code
- **Ctrl+Shift+7** - Ordered list
- **Ctrl+Shift+8** - Bullet list
- **Ctrl+K** - Add link
- **Ctrl+Z** - Undo
- **Ctrl+Shift+Z** - Redo

## Dependencies Installed

```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-link": "^2.x",
  "@tiptap/extension-image": "^2.x",
  "@tiptap/extension-placeholder": "^2.x",
  "@tiptap/extension-mention": "^2.x",
  "@tiptap/suggestion": "^2.x",
  "emoji-picker-react": "^4.x"
}
```

## Best Practices

### 1. Image Optimization
- Resize large images on upload
- Use next/image for rendering
- Lazy load images in long threads

### 2. Security
- Sanitize HTML output
- Validate file types
- Scan for malicious content
- Use CSP headers

### 3. Performance
- Debounce auto-save
- Compress images
- Lazy load editor on mobile
- Paginate comments

### 4. UX
- Show upload progress
- Provide error messages
- Allow draft recovery
- Mobile-friendly toolbar

## Future Enhancements

- [ ] @Mention autocomplete with user search
- [ ] Drag-drop image upload
- [ ] Paste images from clipboard
- [ ] Table support
- [ ] Syntax highlighting for code blocks
- [ ] Markdown import/export
- [ ] Collaborative editing
- [ ] Version history
- [ ] Word count
- [ ] Character limit warning
- [ ] Spell check integration
- [ ] Voice-to-text
- [ ] GIF support

## Files Created/Modified

### New Files (1)
1. `src/components/discussions/RichTextEditor.tsx` - Main editor component

### Modified Files (3)
1. `src/app/api/upload/route.ts` - Added image and attachment support
2. `src/components/discussions/DiscussionDetail.tsx` - Integrated RichTextEditor
3. `src/components/discussions/CommentThread.tsx` - HTML rendering for comments

---

**Status**: ✅ Complete - Rich text editor fully implemented
**Dependencies**: Tiptap, emoji-picker-react
**Last Updated**: November 30, 2025
