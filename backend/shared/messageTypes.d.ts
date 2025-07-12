export interface Message {
    id: string;
    type: 'user' | 'claude';
    content: string;
    isThinking?: boolean;
    error?: string | null;
}
//# sourceMappingURL=messageTypes.d.ts.map