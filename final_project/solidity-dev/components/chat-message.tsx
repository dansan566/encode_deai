import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean
  className?: string
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <div className={cn("flex items-start gap-3 mb-4", isUser && "flex-row-reverse")}>
      <Avatar className={cn("h-8 w-8", isUser ? "bg-primary" : "bg-muted")}>
        <AvatarFallback>{isUser ? <User size={16} /> : <Bot size={16} />}</AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "rounded-lg p-3 max-w-[85%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <div className="prose prose-sm dark:prose-invert break-words max-w-none">
          <ReactMarkdown
            components={{
              code: ({ inline, className, children, ...props }: CodeProps) => {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <code className={className} {...props}>
                    {children}
                  </code>
                ) : (
                  <code className="bg-background px-1 py-0.5 rounded" {...props}>
                    {children}
                  </code>
                )
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
