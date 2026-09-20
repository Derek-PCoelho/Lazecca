'use client';

import { useEffect, useState } from 'react';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    fetch('/api/admin/messages')
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages || []);
        setLoading(false);
      });

  useEffect(() => {
    load();
  }, []);

  const toggleRead = async (id, isRead) => {
    await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead }),
    });
    load();
  };

  return (
    <>
      <h1>Mensagens de Contato</h1>
      <p className="admin-sub">{messages.length} mensagens recebidas pelo formulário do site.</p>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m) => (
            <div key={m.id} className="admin-card" style={{ opacity: m.isRead ? 0.7 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <b>{m.name}</b>
                <span style={{ fontSize: 12, color: '#999' }}>{new Date(m.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <div style={{ fontSize: 13, color: '#7a1f2b' }}>{m.email} {m.phone && `· ${m.phone}`}</div>
              <div style={{ fontSize: 13, color: '#999', margin: '4px 0' }}>{m.subject}</div>
              <p style={{ fontSize: 14 }}>{m.message}</p>
              <button className="admin-btn outline" onClick={() => toggleRead(m.id, !m.isRead)}>
                {m.isRead ? 'Marcar como não lida' : 'Marcar como lida'}
              </button>
            </div>
          ))}
          {messages.length === 0 && <p style={{ color: '#999' }}>Nenhuma mensagem ainda.</p>}
        </div>
      )}
    </>
  );
}
