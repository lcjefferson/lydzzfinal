import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';

interface MessageBubbleProps {
    type: 'contact' | 'ai' | 'user';
    content: string;
    timestamp: string;
    senderName?: string;
    confidence?: number;
    messageType?: 'text' | 'image' | 'file' | 'audio';
    attachments?: Record<string, unknown>;
}

export function MessageBubble({ type, content, timestamp, senderName, confidence, messageType, attachments }: MessageBubbleProps) {
    const bubbleStyles = {
        contact: 'chat-bubble-contact',
        ai: 'chat-bubble-ai',
        user: 'chat-bubble-user',
    };

    return (
        <div className={cn('flex flex-col', type !== 'contact' && 'items-end')}>
            {senderName && (
                <span className="text-xs text-text-tertiary mb-1 px-1">{senderName}</span>
            )}
            <div className={cn('chat-bubble', bubbleStyles[type])}>
                {messageType === 'image' && attachments && (attachments as { url?: string }).url ? (
                    <img src={(attachments as { url?: string }).url || ''} alt="imagem" className="max-w-xs rounded-md" />
                ) : messageType === 'audio' && attachments && (attachments as { url?: string }).url ? (
                    <audio controls src={(attachments as { url?: string }).url || ''} className="w-64" />
                ) : messageType === 'file' && attachments && (attachments as { url?: string }).url ? (
                    <a href={(attachments as { url?: string }).url || ''} target="_blank" rel="noreferrer" className="text-primary-600 underline">Abrir arquivo</a>
                ) : (
                    <p className="whitespace-pre-wrap">{content}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs opacity-70">{formatRelativeTime(timestamp)}</span>
                    {type === 'ai' && confidence && (
                        <span className="text-xs opacity-70">• {Math.round(confidence * 100)}%</span>
                    )}
                </div>
            </div>
        </div>
    );
}
