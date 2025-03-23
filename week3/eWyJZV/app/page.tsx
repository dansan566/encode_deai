'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Send } from 'lucide-react';
import Link from 'next/link';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center py-4 mb-4">
        <h1 className="text-2xl font-bold">🤡 AI Clown</h1>
        <Link 
          href="/joke" 
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Generate Joke
        </Link>
      </div>

      <div className="flex-1 space-y-4 mb-32">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                m.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 shadow-sm'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {m.role === 'user' ? 'You' : 'AI Assistant'}
              </div>
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m?.experimental_attachments
                ?.filter(attachment =>
                  attachment?.contentType?.startsWith('image/'),
                )
                .map((attachment, index) => (
                  <div key={`${m.id}-${index}`} className="mt-2">
                    <Image
                      src={attachment.url}
                      width={300}
                      height={300}
                      alt={attachment.name ?? `attachment-${index}`}
                      className="rounded-lg"
                    />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <form
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4"
        onSubmit={event => {
          handleSubmit(event, {
            experimental_attachments: files,
          });
          setFiles(undefined);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      >
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          {files && files.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from(files).map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm"
                >
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newFiles = Array.from(files).filter((_, i) => i !== index);
                      setFiles(newFiles as unknown as FileList);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <label className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
              <input
                type="file"
                className="hidden"
                onChange={event => {
                  if (event.target.files) {
                    setFiles(event.target.files);
                  }
                }}
                multiple
                ref={fileInputRef}
              />
              <Upload className="w-5 h-5 text-gray-600" />
            </label>
            <input
              className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              placeholder="Type your message..."
              onChange={handleInputChange}
            />
            <button
              type="submit"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}