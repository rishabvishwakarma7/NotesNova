'use client';

export const dynamic = 'force-dynamic';

import dynamic_import from 'next/dynamic';

const ChatWindow = dynamic_import(() => import('@/components/chat/ChatWindow'), {
  ssr: false,
  loading: () => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}>
      <div style={{ width:28, height:28, borderRadius:'50%',
        border:'3px solid rgba(139,92,246,0.2)', borderTopColor:'#8B5CF6',
        animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  ),
});

export default function ChatPage() {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <ChatWindow />
    </div>
  );
}
