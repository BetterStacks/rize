'use client';

import {
    Attachment,
    AttachmentPreview,
    AttachmentRemove,
    Attachments,
} from '@/components/ai-elements/attachment';
import { Button } from '@/components/ui/button';
import { ProfileTask } from '@/hooks/useProfileCompletion';
import { useActiveSidebarTab } from '@/lib/context';
import { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithApprovalResponses, type ToolUIPart } from 'ai';
import { CheckCircle2, CheckIcon, ChevronDown, ChevronLeft, ChevronUp, Copy, Paperclip, RefreshCcw, SquarePen, Trash2, XIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, Fragment, ReactNode, useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';
import { Confirmation, ConfirmationAccepted, ConfirmationAction, ConfirmationActions, ConfirmationRejected, ConfirmationRequest } from '../ai-elements/confirmation';
import { Conversation, ConversationContent } from '../ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '../ai-elements/message';
import { PromptInput, PromptInputActionAddAttachments, PromptInputActionMenu, PromptInputActionMenuContent, PromptInputActionMenuTrigger, PromptInputFooter, PromptInputHeader, PromptInputMessage, PromptInputSubmit, PromptInputTextarea, usePromptInputAttachments } from '../ai-elements/prompt-input';


interface ProfileChatProps {
    profileName?: string;
    incompleteTasks?: ProfileTask[];
}

// Each one starts a real task, written the way the person would say it.
const SUGGESTIONS = [
    "What's missing from my profile?",
    'Update my bio',
    'Add my current job',
    "Add a project I'm working on",
];

const PROD_ERROR_MESSAGE = "Couldn't reach the assistant. Try again.";

export default function ProfileChat(_props: ProfileChatProps) {
    const [input, setInput] = useState('');
    const { username } = useParams<{ username: string }>()
    const [chatId, setChatId] = useState<string>(v4());
    const router = useRouter();
    const queryClient = useQueryClient();
    const setActiveSidebarTab = useActiveSidebarTab()[1]

    const { messages, status, error, sendMessage, regenerate, stop, addToolApprovalResponse } = useChat<ChatMessage>({
        id: chatId,
        transport: new DefaultChatTransport({
            api: '/api/chat/profile',
        }),
        // Every profile change needs approval. Once each proposed change in the
        // latest step has an Approve or Reject, send them back so the server can
        // run the approved ones and tell the model about the rejected ones.
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    });

    const isBusy = status === 'submitted' || status === 'streaming';

    // A proposed change that hasn't been approved or rejected yet. Sending a new
    // message before answering it would leave the tool call without a result,
    // which the AI SDK rejects, so the input waits until the card is answered.
    const lastMessage = messages.at(-1);
    const hasPendingApproval =
        lastMessage?.role === 'assistant' &&
        lastMessage.parts.some((part) => 'state' in part && part.state === 'approval-requested');

    // Older chats sent a hidden "hello" to get a greeting. Never show those.
    const visibleMessages = messages.filter((message) => !message.metadata?.isWelcomeMessage);
    const isEmpty = visibleMessages.length === 0 && !isBusy && !error;

    // "Thinking" until the reply has words in it.
    const replyHasText =
        lastMessage?.role === 'assistant' &&
        lastMessage.parts.some((part) => part.type === 'text' && part.text.trim().length > 0);
    const isThinking = status === 'submitted' || (status === 'streaming' && !replyHasText);

    const errorText = process.env.NODE_ENV !== 'production' && error?.message ? error.message : PROD_ERROR_MESSAGE;

    const processedToolCalls = useRef<Set<string>>(new Set());

    const handleNewChat = () => {
        if (isBusy) stop();
        processedToolCalls.current = new Set();
        setInput('');
        setChatId(v4());
    };

    const send = (text: string, files?: PromptInputMessage['files']) => {
        if (!text.trim() || isBusy || hasPendingApproval) return;
        void sendMessage({ text, files });
    };

    const handleFormSubmit = async (message: PromptInputMessage, _event: FormEvent<HTMLFormElement>) => {
        if (!message?.text.trim() || isBusy || hasPendingApproval) return;
        setInput('');
        send(message.text, message.files);
    };

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }
    }, [messages, status, error]);

    useEffect(() => {
        if (messages?.length === 0) return;
        const latestMessage = messages[messages.length - 1];

        if (latestMessage.role !== 'assistant' || !latestMessage.parts) return;

        const completedTools = latestMessage.parts.filter(
            (part) =>
                part.type.startsWith("tool-") &&
                (part as any).state === "output-available" &&
                (part as any).toolCallId &&
                !processedToolCalls.current.has((part as any).toolCallId)
        );

        if (completedTools.length > 0) {
            let needsRefresh = false;

            completedTools.forEach((part) => {
                const toolCallId = (part as any).toolCallId;
                processedToolCalls.current.add(toolCallId);

                const lowerToolName = part.type.replace("tool-", "").toLowerCase();
                if (lowerToolName.includes("experience")) {
                    queryClient.invalidateQueries({ queryKey: ["get-all-experience", username] });
                    needsRefresh = true;
                } else if (lowerToolName.includes("education")) {
                    queryClient.invalidateQueries({ queryKey: ["get-education", username] });
                    needsRefresh = true;
                } else if (lowerToolName.includes("project")) {
                    queryClient.invalidateQueries({ queryKey: ["get-projects", username] });
                    needsRefresh = true;
                } else if (lowerToolName.includes("basicinfo")) {
                    queryClient.invalidateQueries({ queryKey: ["get-profile", username] });
                    queryClient.invalidateQueries({ queryKey: ["get-profile-by-username", username] });
                    needsRefresh = true;
                } else if (lowerToolName.includes("storyelement")) {
                    queryClient.invalidateQueries({ queryKey: ["my-story-elements"] });
                    queryClient.invalidateQueries({ queryKey: ["get-story-elements", username] });
                    needsRefresh = true;
                } else if (lowerToolName.includes("galleryitem")) {
                    queryClient.invalidateQueries({ queryKey: ["get-gallery-items", username] });
                    needsRefresh = true;
                }
            });

            if (needsRefresh) {
                router.refresh();
            }
        }
    }, [messages, username, queryClient, router]);

    return (
        <div className="flex flex-col h-full w-full overflow-hidden font-inter">
            {/* Sits in the space RightSidebar leaves at the top. On phones the
                sheet draws its own close button top-right, so leave room for it. */}
            <header className="absolute top-0 inset-x-0 h-16 flex items-center justify-between gap-2 border-b border-hairline pl-2 pr-14 lg:pr-3">
                <div className="flex items-center gap-1 min-w-0">
                    <Button
                        size="smallIcon"
                        variant="ghost"
                        onClick={() => setActiveSidebarTab({ id: null, tab: 'gallery' })}
                        aria-label="Back to profile editor"
                        title="Back to profile editor"
                        className="touch-target shrink-0 rounded-lg text-ink-secondary hover:text-ink"
                    >
                        <ChevronLeft className="size-4" aria-hidden />
                    </Button>
                    <h2 className="truncate text-sm font-medium text-ink">Profile assistant</h2>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleNewChat}
                    disabled={messages.length === 0 && !error}
                    className="touch-target shrink-0 gap-1.5 rounded-lg text-ink-secondary hover:text-ink"
                >
                    <SquarePen className="size-4" aria-hidden />
                    New chat
                </Button>
            </header>

            {isEmpty ? (
                <ChatEmptyState onPick={send} disabled={isBusy || hasPendingApproval} />
            ) : (
                <Conversation className="w-full h-full">
                    <ConversationContent className="w-full">
                        <div className="w-full px-2">
                            {visibleMessages.map((message) => (
                                <Message className="mb-4" from={message.role} key={message.id}>
                                    <MessageContent
                                        className={cn(
                                            "rounded-xl font-inter",
                                            message.role === "user"
                                                ? "bg-subtle text-ink tracking-tight max-w-[85%] w-fit font-medium p-3"
                                                : "border-none bg-transparent w-full max-w-full rounded-none text-ink"
                                        )}
                                    >
                                        {message.parts.map((part, i) => {
                                            switch (part.type) {
                                                case "text":
                                                    if (!part.text) return null;
                                                    return (
                                                        <Fragment key={`${message.id}-${i}`}>
                                                            <MessageResponse>{part.text}</MessageResponse>
                                                        </Fragment>
                                                    );
                                                case "reasoning":
                                                    return (
                                                        <details key={`${message?.id}-reasoning-${i}`} className="group">
                                                            <summary className="cursor-pointer text-xs text-ink-secondary font-medium flex items-center gap-1 hover:text-ink transition-colors">
                                                                <ChevronDown className="size-3 group-open:hidden" />
                                                                <ChevronUp className="size-3 hidden group-open:block" />
                                                                How it got there
                                                            </summary>
                                                            <div className="mt-2 p-3 bg-subtle rounded-xl text-xs text-ink-secondary leading-relaxed">
                                                                {part.text}
                                                            </div>
                                                        </details>
                                                    );

                                                case "tool-deleteEducation":
                                                case "tool-deleteExperience":
                                                case "tool-deleteProject":
                                                case "tool-deleteGalleryItem":
                                                    if (needsApprovalCard(part)) {
                                                        return (
                                                            <ToolApprovalCard
                                                                key={`${message.id}-${i}`}
                                                                part={part}
                                                                onRespond={(approved) =>
                                                                    addToolApprovalResponse({ id: part.approval.id, approved })
                                                                }
                                                            />
                                                        );
                                                    }
                                                    return (
                                                        <ToolStatusRow key={`${message?.id}-tool-${i}`} icon={<Trash2 className="size-3.5" aria-hidden />}>
                                                            {describeToolStatus(part)}
                                                        </ToolStatusRow>
                                                    );

                                                case "tool-addEducation":
                                                case "tool-addExperience":
                                                case "tool-addStoryElement":
                                                case "tool-addProject":
                                                case "tool-updateBasicInfo":
                                                case "tool-updateEducation":
                                                case "tool-updateExperience":
                                                case "tool-updateProject":
                                                case "tool-addGalleryItem":
                                                    if (needsApprovalCard(part)) {
                                                        return (
                                                            <ToolApprovalCard
                                                                key={`${message.id}-${i}`}
                                                                part={part}
                                                                onRespond={(approved) =>
                                                                    addToolApprovalResponse({ id: part.approval.id, approved })
                                                                }
                                                            />
                                                        );
                                                    }
                                                    return (
                                                        <ToolStatusRow key={`${message?.id}-tool-${i}`} icon={<CheckCircle2 className="size-3.5" aria-hidden />}>
                                                            {describeToolStatus(part)}
                                                        </ToolStatusRow>
                                                    );
                                                default:
                                                    return null;
                                            }
                                        })}

                                        {message.role === "assistant" && !(isBusy && message.id === lastMessage?.id) && (
                                            <div className="flex mt-1 items-center justify-start gap-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-fast">
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
                                                    aria-label="Copy reply"
                                                    className="size-7 text-ink-secondary"
                                                >
                                                    <Copy className="size-3.5" aria-hidden />
                                                </Button>
                                                <Button
                                                    onClick={async () => regenerate({ messageId: message.id })}
                                                    size="icon"
                                                    variant="ghost"
                                                    aria-label="Write this reply again"
                                                    disabled={isBusy}
                                                    className="size-7 text-ink-secondary"
                                                >
                                                    <RefreshCcw className="size-3.5" aria-hidden />
                                                </Button>
                                            </div>
                                        )}
                                    </MessageContent>
                                </Message>
                            ))}

                            {isThinking && <ThinkingRow />}

                            {error && !isBusy && (
                                <div role="alert" className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-hairline pt-3 text-sm">
                                    <p className="min-w-0 break-words text-ink-secondary">{errorText}</p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => void regenerate()}
                                        className="touch-target shrink-0 gap-1.5"
                                    >
                                        <RefreshCcw className="size-3.5" aria-hidden />
                                        Try again
                                    </Button>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ConversationContent>
                </Conversation>
            )}

            <div className='px-2 flex items-center justify-center pb-2'>
                <PromptInput multiple globalDrop onSubmit={handleFormSubmit} className="w-full shadow-none">
                    <PromptInputHeader>
                        <PromptInputAttachmentsDisplay />
                    </PromptInputHeader>
                    <PromptInputTextarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={hasPendingApproval ? 'Approve or reject the change above first' : 'Tell it about your work...'}
                        aria-label="Message the profile assistant"
                        disabled={isBusy || hasPendingApproval}
                        rows={1}
                        className="flex-1 min-h-[60px] rounded-2xl focus-visible:ring-0"
                    />
                    <PromptInputFooter className="flex items-center justify-between h-[44px]">
                        <PromptInputActionMenu>
                            <PromptInputActionMenuTrigger className='rounded-full' aria-label="Attach photos or files" title="Attach photos or files">
                                <Paperclip className="size-4" aria-hidden />
                            </PromptInputActionMenuTrigger>
                            <PromptInputActionMenuContent>
                                <PromptInputActionAddAttachments />
                            </PromptInputActionMenuContent>
                        </PromptInputActionMenu>
                        <PromptInputSubmit
                            className="rounded-full h-8 w-8 p-0"
                            aria-label="Send message"
                            disabled={isBusy || hasPendingApproval || !input.trim()}
                        />
                    </PromptInputFooter>
                </PromptInput>
            </div>
        </div>
    );
}

const ChatEmptyState = ({ onPick, disabled }: { onPick: (text: string) => void; disabled: boolean }) => (
    <div className="flex flex-1 flex-col justify-end gap-6 overflow-y-auto px-5 pb-6 pt-8">
        <div className="flex flex-col gap-2">
            <h3 className="font-instrument text-3xl leading-tight text-ink">Your profile assistant</h3>
            <p className="max-w-[34ch] text-sm leading-relaxed text-ink-secondary">
                Tell it about your work and it suggests profile updates. Nothing changes until you approve.
            </p>
        </div>
        <ul className="flex flex-col border-t border-hairline" aria-label="Ways to start">
            {SUGGESTIONS.map((text) => (
                <li key={text} className="border-b border-hairline">
                    <button
                        type="button"
                        onClick={() => onPick(text)}
                        disabled={disabled}
                        className="flex min-h-11 w-full items-center py-2.5 text-left text-sm text-ink transition-colors duration-fast ease-calm hover:text-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground rounded-lg disabled:opacity-50"
                    >
                        {text}
                    </button>
                </li>
            ))}
        </ul>
    </div>
);

const ThinkingRow = () => (
    <div role="status" className="mt-2 flex items-center gap-2 text-sm text-ink-secondary">
        <span className="flex gap-1" aria-hidden>
            <span className="size-1.5 rounded-full bg-ink-secondary/70 motion-safe:animate-pulse" />
            <span className="size-1.5 rounded-full bg-ink-secondary/70 motion-safe:animate-pulse [animation-delay:150ms]" />
            <span className="size-1.5 rounded-full bg-ink-secondary/70 motion-safe:animate-pulse [animation-delay:300ms]" />
        </span>
        Thinking...
    </div>
);

const ToolStatusRow = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
    <div className="my-1 flex items-center gap-2 text-xs font-medium text-ink-secondary">
        {icon}
        <span>{children}</span>
    </div>
);



// --- Profile changes proposed by the chat -----------------------------------
// Every tool that writes to the profile needs the person's approval. These
// helpers turn a tool call into plain words: what will change, and what happened.

type ProfileToolPart = {
    type: string;
    state: string;
    input?: any;
    output?: any;
    approval?: { id: string; approved?: boolean };
};

type ApprovableToolPart = ProfileToolPart & { approval: { id: string; approved?: boolean } };

const FIELD_LABELS: Record<string, string> = {
    displayName: 'Name',
    bio: 'Bio',
    location: 'Location',
    personalMission: 'Personal mission',
    lifePhilosophy: 'Life philosophy',
    age: 'Age',
    title: 'Title',
    company: 'Company',
    employmentType: 'Employment type',
    startDate: 'Start date',
    endDate: 'End date',
    currentlyWorking: 'Currently working here',
    website: 'Website',
    companyLogo: 'Company logo',
    description: 'Description',
    school: 'School',
    degree: 'Degree',
    fieldOfStudy: 'Field of study',
    grade: 'Grade',
    name: 'Name',
    tagline: 'Tagline',
    url: 'Link',
    status: 'Status',
    logo: 'Logo',
    type: 'Type',
    content: 'Text',
};

const STORY_ELEMENT_LABELS: Record<string, string> = {
    mission: 'mission',
    value: 'value',
    milestone: 'milestone',
    dream: 'dream',
    superpower: 'superpower',
};

const PROJECT_STATUS_LABELS: Record<string, string> = {
    wip: 'In progress',
    completed: 'Completed',
    archived: 'Archived',
};

const toolName = (part: ProfileToolPart) => part.type.replace(/^tool-/, '');

const joinWords = (words: string[]) => {
    if (words.length <= 1) return words.join('');
    return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
};

const countLabel = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

const formatValue = (key: string, value: unknown): string => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (key === 'status' && typeof value === 'string') return PROJECT_STATUS_LABELS[value] ?? value;
    if (key === 'type' && typeof value === 'string') return STORY_ELEMENT_LABELS[value] ?? value;
    return String(value);
};

/** The fields a proposed add/update would save, as label/value pairs. */
const proposedFields = (part: ProfileToolPart): { label: string; value: string }[] => {
    const name = toolName(part);
    const input = part.input ?? {};
    if (name === 'addGalleryItem') {
        return [{ label: 'Files', value: countLabel(input.attachmentIds?.length ?? 0, 'file from your message', 'files from your message') }];
    }
    if (name.startsWith('delete')) return [];
    return Object.entries(input)
        .filter(([key, value]) => key !== 'id' && value !== undefined && value !== null && value !== '')
        .map(([key, value]) => ({ label: FIELD_LABELS[key] ?? key, value: formatValue(key, value) }));
};

/** What the person is being asked to approve, in plain words. */
const describeToolRequest = (part: ProfileToolPart): string => {
    const input = part.input ?? {};
    switch (toolName(part)) {
        case 'updateBasicInfo': return 'Update your profile with this?';
        case 'addExperience': return 'Add this work experience to your profile?';
        case 'updateExperience': return 'Update one of your work experiences with this?';
        case 'addEducation': return 'Add this education to your profile?';
        case 'updateEducation': return 'Update one of your education entries with this?';
        case 'addStoryElement': return 'Add this to your story?';
        case 'addProject': return 'Add this project to your profile?';
        case 'updateProject': return 'Update one of your projects with this?';
        case 'addGalleryItem': return 'Add these to your gallery?';
        case 'deleteExperience': {
            const label = [input.title, input.company].filter(Boolean).join(' at ');
            return label ? `Remove "${label}" from your work experience?` : 'Remove this work experience?';
        }
        case 'deleteEducation':
            return input.school ? `Remove "${input.school}" from your education?` : 'Remove this education entry?';
        case 'deleteProject':
            return input.name ? `Remove the project "${input.name}"?` : 'Remove this project?';
        case 'deleteGalleryItem':
            return `Remove ${countLabel(input.ids?.length ?? 0, 'item', 'items')} from your gallery?`;
        default: return 'Make this change to your profile?';
    }
};

/** What happened once the tool ran, in plain words. */
const describeToolDone = (part: ProfileToolPart): string => {
    const input = part.input ?? {};
    switch (toolName(part)) {
        case 'updateBasicInfo': {
            const fields = Object.keys(input)
                .filter((key) => input[key] !== undefined)
                .map((key) => (FIELD_LABELS[key] ?? key).toLowerCase());
            return fields.length ? `Updated your ${joinWords(fields)}` : 'Updated your profile';
        }
        case 'addExperience':
            return input.title && input.company ? `Added ${input.title} at ${input.company}` : 'Added a work experience';
        case 'updateExperience': return 'Updated your work experience';
        case 'addEducation': return input.school ? `Added ${input.school}` : 'Added your education';
        case 'updateEducation': return 'Updated your education';
        case 'addStoryElement': {
            const kind = STORY_ELEMENT_LABELS[input.type];
            return kind ? `Added a ${kind} to your story` : 'Added to your story';
        }
        case 'addProject': return input.name ? `Added the project ${input.name}` : 'Added a project';
        case 'updateProject': return 'Updated your project';
        case 'addGalleryItem': {
            const results: { success?: boolean }[] = Array.isArray(part.output?.output) ? part.output.output : [];
            const added = results.filter((r) => r?.success).length;
            return `Added ${countLabel(added, 'item', 'items')} to your gallery`;
        }
        case 'deleteExperience': return 'Removed the work experience';
        case 'deleteEducation': return 'Removed the education entry';
        case 'deleteProject': return 'Removed the project';
        case 'deleteGalleryItem': return `Removed ${countLabel(input.ids?.length ?? 0, 'item', 'items')} from your gallery`;
        default: return 'Updated your profile';
    }
};

/** One-line status for a tool call that isn't waiting on the person. */
const describeToolStatus = (part: ProfileToolPart): string => {
    switch (part.state) {
        case 'output-available':
            return part.output?.success === false ? "That change didn't go through. Nothing was saved." : describeToolDone(part);
        case 'output-error':
            return "Something went wrong. That change wasn't saved.";
        case 'output-denied':
            return 'Not saved.';
        case 'approval-responded':
            return part.approval?.approved ? 'Saving...' : 'Not saved.';
        default:
            return 'Preparing a change...';
    }
};

/** Show the approval card while the person decides, and its outcome until the tool has run. */
const needsApprovalCard = (part: ProfileToolPart): part is ApprovableToolPart =>
    Boolean(part.approval?.id) &&
    (part.state === 'approval-requested' || part.state === 'approval-responded' || part.state === 'output-denied');

const ToolApprovalCard = ({ part, onRespond }: { part: ApprovableToolPart; onRespond: (approved: boolean) => void }) => {
    const fields = proposedFields(part);
    const isUpdate = toolName(part).startsWith('update');
    const isDelete = toolName(part).startsWith('delete');

    return (
        <Confirmation approval={part.approval} state={part.state as ToolUIPart['state']} className="my-2">
            <ConfirmationRequest>
                <div className="flex flex-col gap-2 text-sm">
                    <p className="font-medium">{describeToolRequest(part)}</p>
                    {fields.length > 0 && (
                        <dl className="flex flex-col gap-1.5">
                            {fields.map(({ label, value }) => (
                                <div key={label} className="flex flex-col">
                                    <dt className="text-xs text-neutral-500 dark:text-neutral-400">{label}</dt>
                                    <dd className="whitespace-pre-wrap break-words">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {isDelete
                            ? 'This will be removed from your public profile.'
                            : isUpdate
                                ? 'Only the fields above will change. They will show on your public profile.'
                                : 'This will show on your public profile.'}
                    </p>
                </div>
            </ConfirmationRequest>
            <ConfirmationAccepted>
                <div className="flex items-center gap-2 text-sm">
                    <CheckIcon className="size-4" />
                    <span>Approved. Saving...</span>
                </div>
            </ConfirmationAccepted>
            <ConfirmationRejected>
                <div className="flex items-center gap-2 text-sm">
                    <XIcon className="size-4" />
                    <span>{isDelete ? 'Kept. Nothing was removed.' : 'Not saved.'}</span>
                </div>
            </ConfirmationRejected>
            <ConfirmationActions>
                <ConfirmationAction variant="outline" onClick={() => onRespond(false)}>
                    {isDelete ? 'Keep it' : 'Reject'}
                </ConfirmationAction>
                <ConfirmationAction variant="default" onClick={() => onRespond(true)}>
                    {isDelete ? 'Remove' : 'Approve'}
                </ConfirmationAction>
            </ConfirmationActions>
        </Confirmation>
    );
};

const PromptInputAttachmentsDisplay = () => {
    const attachments = usePromptInputAttachments();
    if (attachments.files.length === 0) {
        return null;
    }
    return (
        <Attachments variant="inline">
            {attachments.files.map((attachment) => (
                <Attachment
                    data={attachment}
                    key={attachment.id}
                    className='dark:border-neutral-700'
                    onRemove={() => attachments.remove(attachment.id)}
                >
                    <AttachmentPreview />
                    <span className="text-xs w-[60px] truncate">{attachment?.filename}</span>
                    <AttachmentRemove />
                </Attachment>
            ))}
        </Attachments>
    );
};
