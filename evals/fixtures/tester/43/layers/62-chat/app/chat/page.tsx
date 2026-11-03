import { ChatPanel } from '../../components/chat/chat-panel.tsx';

export const metadata = {
  title: 'Ask the assistant | Helpdesk Help Center',
};

export default function ChatPage() {
  return (
    <main>
      <h1>Ask the assistant</h1>
      <p>
        Answers are generated automatically and can be wrong. For account or billing problems, contact
        support@helpdesk.example.
      </p>
      <ChatPanel />
    </main>
  );
}
