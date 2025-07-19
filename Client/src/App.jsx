import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [users, setUsers] = useState([]);
  const [privateTo, setPrivateTo] = useState('');
  const [privateMessages, setPrivateMessages] = useState([]);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('receive_private', (data) => {
      setPrivateMessages((prev) => [...prev, data]);
    });

    socket.on('user_typing', (data) => {
      setTyping(`${data} is typing...`);
      setTimeout(() => setTyping(''), 2000);
    });

    socket.on('user_list', (data) => {
      setUsers(data);
    });

    return () => {
      socket.off('receive_message');
      socket.off('receive_private');
      socket.off('user_typing');
      socket.off('user_list');
    };
  }, []);

  const registerUser = () => {
    if (username.trim()) {
      socket.emit('register', username);
      setIsRegistered(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      if (privateTo) {
        socket.emit('private_message', { to: privateTo, from: username, text: message });
      } else {
        socket.emit('send_message', { user: username, text: message });
      }
      setMessage('');
    }
  };

  const handleTyping = () => {
    socket.emit('typing', username);
  };

  if (!isRegistered) {
    return (
      <div className="chat-container1">
        <h2>Enter your name to join chat</h2>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your name" />
        <button onClick={registerUser}>Join</button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <h2>💬 {privateTo ? `Chat with ${privateTo}` : 'Group Chat'}</h2>

      <div className="user-list">
        <strong>Users:</strong>
        {users.map((u) => (
          <span key={u} onClick={() => setPrivateTo(u === username ? '' : u)} className={u === privateTo ? 'selected' : ''}>
            {u === username ? 'You' : u}
          </span>
        ))}
      </div>

      <div className="chat-box">
        {(privateTo ? privateMessages : messages).map((msg, idx) => (
          <div key={idx} className="msg">
            <strong>{msg.from || msg.user}:</strong> {msg.text}
          </div>
        ))}
        <p className="typing">{typing}</p>
      </div>

      <div className="input-box">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;




