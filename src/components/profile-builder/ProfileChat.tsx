'use client';

import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ChevronDown, ChevronUp, Copy, PanelRight, Plus, RefreshCcw, Sparkles } from 'lucide-react';
import { FormEvent, Fragment, useEffect, useRef, useState } from 'react';
import { Conversation, ConversationContent, ConversationEmptyState } from '../ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '../ai-elements/message';
import { PromptInput, PromptInputFooter, PromptInputMessage, PromptInputSubmit, PromptInputTextarea } from '../ai-elements/prompt-input';
import { usePanel } from '@/lib/panel-context';
import { ProfileTask } from '@/hooks/useProfileCompletion';
import { v4 } from 'uuid';

interface ProfileChatProps {
    profileName?: string;
    incompleteTasks?: ProfileTask[];
}

export default function ProfileChat({ profileName = 'there', incompleteTasks = [] }: ProfileChatProps) {
    const [input, setInput] = useState('');
    const hasLoadedWelcomeRef = useRef(false);
    const { toggleRightPanel } = usePanel()
    const [chatId, setChatId] = useState<string>(v4());

    const { messages, status, sendMessage, regenerate, } = useChat<ChatMessage>({
        id: chatId,
        transport: new DefaultChatTransport({
            api: '/api/chat/profile',
        }),
    });
    const isLoading = status === 'streaming';

    const handleNewChat = () => {
        setChatId(v4());
        hasLoadedWelcomeRef.current = false;
    };

    // Trigger initial welcome message when chat is empty
    useEffect(() => {
        if (messages.length === 0 && !hasLoadedWelcomeRef.current && !isLoading) {
            hasLoadedWelcomeRef.current = true;
            sendMessage({
                text: 'hello there',
                metadata: {
                    isWelcomeMessage: true
                },
            });
        }
    }, [messages.length, isLoading, sendMessage]);


    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages]);

    const onSkip = () => {
        sendMessage({
            text: 'Skip this question for now.',
        });
    };

    const handleFormSubmit = async (message: PromptInputMessage, event: FormEvent<HTMLFormElement>) => {
        if (!message?.text.trim() || isLoading) return;

        const currentInput = message.text;
        setInput('');

        await sendMessage({
            text: currentInput,
        });
    };

    return (
        <div className="flex flex-col h-full w-full overflow-hidden font-inter">
            <div className='w-full flex items-center justify-between absolute top-0 inset-x-0 p-3'>
                <Button
                    size={'smallIcon'}
                    variant={'ghost'}
                    onClick={toggleRightPanel}
                    className="rounded-md "
                >
                    <PanelRight className='size-4' />
                </Button>
                <Button
                    size={'smallIcon'}
                    variant={'ghost'}
                    onClick={handleNewChat}
                    className="rounded-md "
                >
                    <Plus className='size-4' />
                </Button>
            </div>
            <Conversation className="w-full h-full">
                <ConversationContent className="w-full ">
                    <div className="w-full px-2">
                        {messages.length === 0 && (
                            <ConversationEmptyState
                                title="Start a conversation"
                                description="Type a message below to begin"
                            />
                        )}
                        {messages.length > 0 && messages.map((message) => {
                            if (message.metadata?.isWelcomeMessage) {
                                return null
                            }
                            return (
                                <Message className="mb-4" from={message.role} key={message.id}>
                                    <MessageContent
                                        className={cn(
                                            "rounded-xl font-inter",
                                            message.role === "user"
                                                ? "bg-neutral-100 dark:bg-neutral-600 tracking-tight max-w-[85%] w-fit font-medium text-neutral-700 p-3"
                                                : "border-none bg-transparent w-full max-w-full rounded-none"
                                        )}
                                    >
                                        {message.role === "assistant" && (
                                            <div className='inline-flex mb-2 items-center justify-start gap-2'>
                                                <div className='size-3 bg-main-yellow rounded-full' />
                                                <span className="text-sm text-neutral-600 dark:text-neutral-200 font-medium leading-tight ">
                                                    rize.ai
                                                </span>
                                            </div>
                                        )}
                                        {message.parts.map((part, i) => {
                                            switch (part.type) {
                                                case "text":
                                                    return (
                                                        <Fragment key={`${message.id}-${i}`}>
                                                            <MessageResponse>{part.text}</MessageResponse>
                                                        </Fragment>
                                                    );
                                                case "reasoning":
                                                    return (
                                                        <details key={`${message?.id}-reasoning-${i}`} className="group">
                                                            <summary className="cursor-pointer text-xs text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                                <ChevronDown className="size-3 group-open:hidden" />
                                                                <ChevronUp className="size-3 hidden group-open:block" />
                                                                View AI Reasoning
                                                            </summary>
                                                            <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs italic text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                                                {part.text}
                                                            </div>
                                                        </details>
                                                    );


                                                case "tool-addEducation":
                                                case "tool-addExperience":
                                                case "tool-addStoryElement":
                                                case "tool-addProject":
                                                case "tool-updateBasicInfo":
                                                    return (
                                                        <div
                                                            key={`${message?.id}-tool-${i}`}
                                                            className="flex items-center gap-2 p-2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-xs text-indigo-700 dark:text-indigo-300 font-medium"
                                                        >
                                                            <Sparkles className="size-3" />
                                                            {part?.state === 'output-available'
                                                                ? `Successfully executed ${part.type}`
                                                                : `Executing ${part.type}...`}
                                                        </div>
                                                    );

                                                default:
                                                    return null;
                                            }
                                        })}

                                        {message.role === "assistant" && (
                                            <div className="flex mt-2 items-center justify-start gap-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    onClick={async () =>
                                                        navigator.clipboard.writeText(
                                                            message.parts
                                                                .map((part) => (part.type === "text" ? part.text : ""))
                                                                .join("\n")
                                                        )
                                                    }
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-7"
                                                >
                                                    <Copy className="size-3.5" />
                                                </Button>
                                                <Button
                                                    onClick={async () => regenerate({ messageId: message.id })}
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-7"
                                                >
                                                    <RefreshCcw className="size-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </MessageContent>
                                </Message>
                            )
                        })}
                        <div ref={scrollRef} />
                    </div>
                </ConversationContent>
            </Conversation>
            <div className='px-2 flex items-center justify-center pb-2'>

                <PromptInput onSubmit={handleFormSubmit} className="w-full border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden">
                    <PromptInputTextarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Send a message..."
                        disabled={isLoading}
                        rows={1}
                        className="flex-1 min-h-[44px] focus-visible:ring-0"
                    />
                    <PromptInputFooter className="flex items-center justify-end h-[44px]">
                        <PromptInputSubmit
                            className="rounded-full h-8 w-8 p-0 disabled:bg-neutral-400"
                            disabled={isLoading || !input.trim()}
                        />
                    </PromptInputFooter>

                </PromptInput>
            </div>

        </div>
    );
}

{/* <div className="flex gap-2 mb-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onSkip}
                        disabled={isLoading}
                        className="rounded-full text-xs gap-1.5 h-8 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                    >
                        <SkipForward className="size-3" />
                        Skip Question
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => sendMessage({ text: 'Help me improve my latest experience description using power verbs.' })}
                        className="rounded-full text-xs gap-1.5 h-8 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-all font-medium"
                    >
                        <Sparkles className="size-3" />
                        Auto-Improve
                    </Button>
                </div> */}
{/* <form onSubmit={handleFormSubmit} className="relative">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your answer here..."
                        disabled={isLoading}
                        className="pr-12 py-6 rounded-2xl bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:scale-95"
                    >
                        <Send className="size-4" />
                    </Button>
                </form> */}
{/* Messages */ }
{/* <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-6 pb-4">
                    <AnimatePresence initial={false}>
                        {messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={cn(
                                    "flex gap-3 max-w-[90%]",
                                    m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <CreativeAvatar
                                    name={m.role === 'user' ? 'You' : 'AI Profile Builder'}
                                    src={undefined}
                                    className={cn(
                                        "size-8 border flex-shrink-0",
                                        m.role === 'user' ? "bg-neutral-100 dark:bg-neutral-800" : "bg-indigo-50 dark:bg-indigo-900/30"
                                    )} />
                                <div className="flex flex-col gap-2 flex-1 min-w-0">
                                    {m.parts.map((part, i) => {
                                        if (part.type === 'text') {
                                            return (
                                                <div
                                                    key={`${m.id}-text-${i}`}
                                                    className={cn(
                                                        "p-3 rounded-2xl text-sm leading-relaxed break-words",
                                                        m.role === 'user'
                                                            ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-200 dark:shadow-none"
                                                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-tl-none border border-neutral-200 dark:border-neutral-700"
                                                    )}
                                                >
                                                    {part.text}
                                                </div>
                                            );
                                        }

                                        if (part.type === 'reasoning') {
                                            return (
                                                <details key={`${m.id}-reasoning-${i}`} className="group">
                                                    <summary className="cursor-pointer text-xs text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                        <ChevronDown className="size-3 group-open:hidden" />
                                                        <ChevronUp className="size-3 hidden group-open:block" />
                                                        View AI Reasoning
                                                    </summary>
                                                    <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs italic text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                                        {part.text}
                                                    </div>
                                                </details>
                                            );
                                        }

                                        if (part?.type === "tool-addEducation" || part?.type === "tool-addExperience" || part?.type === "tool-addStoryElement" || part?.type === "tool-addProject" || part?.type === "tool-updateBasicInfo") {

                                            return (
                                                <div
                                                    key={`${m.id}-tool-${i}`}
                                                    className="flex items-center gap-2 p-2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-xs text-indigo-700 dark:text-indigo-300 font-medium"
                                                >
                                                    <Sparkles className="size-3" />
                                                    {part?.state === 'output-available'
                                                        ? `Successfully executed ${part.type}`
                                                        : `Executing ${part.type}...`}
                                                </div>
                                            );
                                        }

                                        return null;
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </ScrollArea> */}