"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function Editor({ content, onChange, placeholder = "Escribe aquí..." }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, icon: Icon, title, isActive = false }: { 
    onClick: () => void; 
    icon: any; 
    title: string;
    isActive?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 transition-colors ${
        isActive ? 'bg-navy-100 text-navy-700' : 'text-gray-700'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="border rounded-lg overflow-hidden border-gray-300 focus-within:border-navy-500 focus-within:ring-2 focus-within:ring-navy-100">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          icon={Bold} 
          title="Negrita (Ctrl+B)"
          isActive={editor.isActive('bold')}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          icon={Italic} 
          title="Cursiva (Ctrl+I)"
          isActive={editor.isActive('italic')}
        />
        <div className="w-px bg-gray-300 mx-1"></div>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          icon={Heading1} 
          title="Título 1"
          isActive={editor.isActive('heading', { level: 1 })}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          icon={Heading2} 
          title="Título 2"
          isActive={editor.isActive('heading', { level: 2 })}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().setParagraph().run()} 
          icon={Type} 
          title="Párrafo"
          isActive={editor.isActive('paragraph')}
        />
        <div className="w-px bg-gray-300 mx-1"></div>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          icon={List} 
          title="Lista con viñetas"
          isActive={editor.isActive('bulletList')}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          icon={ListOrdered} 
          title="Lista numerada"
          isActive={editor.isActive('orderedList')}
        />
        <div className="w-px bg-gray-300 mx-1"></div>
        <ToolbarButton 
          onClick={() => editor.chain().focus().setTextAlign('left').run()} 
          icon={AlignLeft} 
          title="Alinear izquierda"
          isActive={editor.isActive({ textAlign: 'left' })}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().setTextAlign('center').run()} 
          icon={AlignCenter} 
          title="Centrar"
          isActive={editor.isActive({ textAlign: 'center' })}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().setTextAlign('right').run()} 
          icon={AlignRight} 
          title="Alinear derecha"
          isActive={editor.isActive({ textAlign: 'right' })}
        />
      </div>
      
      {/* Editor */}
      <EditorContent 
        editor={editor} 
        className="min-h-[200px] p-4 prose prose-sm max-w-none"
      />
    </div>
  );
}