import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../context/auth.context';
import Emoticon from '../../components/Emoticon';
import ReactionPicker from '../../components/Reaction';
import '../../css/chats/Chat.css';
import { useParams } from 'react-router-dom';

function Chat() {

  const { gameName } = useParams();
  const { user, fetchAllMessages, fetchAllMessagesGame, messages: contextMessages } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);
  const [showEmoticonPicker, setShowEmoticonPicker] = useState(false);
  const [reactionToMessageId, setReactionToMessageId] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionPickerPosition, setReactionPickerPosition] = useState({ x: 0, y: 0 });
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [typingGameUsers, setTypingGameUsers] = useState([]);
  const emoticonPickerRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeout = useRef(null);

  // Formato de mensaje.

  useEffect(() => {
    if (contextMessages) {
      setMessages(contextMessages.map(msg => ({
        ...msg,
        timestamp: msg.sentAt,
        formattedText: formatMessageText(msg.text),
      })));
    }
  }, [contextMessages]);

  // Respecto al websocket del chat.

  useEffect(() => {

  if (!socketRef.current) {

    socketRef.current = io('https://coloretto-api.onrender.com', {
      query: { userName: user.username, gameName },
      withCredentials: true,
    });
  }

    const socket = socketRef.current;

    socket.on('message', (message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...message,
          formattedText: formatMessageText(message.text),
        },
      ]);
    });

    socket.on('general', (message) => {
        setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...message,
          formattedText: formatMessageText(message.text),
        },
      ]);
    });

    socket.on('users-updated', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('reaction-updated', (updatedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.messageId === updatedMessage.messageId ? updatedMessage : msg
        )
      );
    });

    socket.on('reaction-removed', (updatedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.messageId === updatedMessage.messageId ? updatedMessage : msg
        )
      );
    });

    socket.on('typing', (usersTyping) => {
      setTypingUsers(usersTyping);
    });
  
    socket.on('stop-typing', (usersTyping) => {
      setTypingUsers(usersTyping);
    });
  
    socket.on('typingGame', (usersTyping) => {
      setTypingGameUsers(usersTyping);
    });
  
    socket.on('stop-typingGame', (usersTyping) => {
      setTypingGameUsers(usersTyping);
    });

    socket.emit('user-connected', { userName: user.username });

    return () => {
      socket.off('message');
      socket.off('general');
      socket.off('users-updated');
      socket.off('reaction-updated');
      socket.off('reaction-removed');
      socket.off('typing');
      socket.off('stop-typing');
      socket.off('typingGame');
      socket.off('stop-typingGame');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user.username, gameName]);

    const fetchAllMessagesRef = useRef(fetchAllMessages);
    const fetchAllMessagesGameRef = useRef(fetchAllMessagesGame);

  useEffect(() => {

    fetchAllMessagesRef.current = fetchAllMessages;
    fetchAllMessagesGameRef.current = fetchAllMessagesGame;

  }, [fetchAllMessages, fetchAllMessagesGame]);

  // Obtener todos los mensajes de los usuarios.

  useEffect(() => {
    if (user && user.username) {
        const fetchMessages = async () => {
            if (gameName) {
                await fetchAllMessagesGameRef.current(gameName);
            } else {
                await fetchAllMessagesRef.current(user.username);
            }
        };
        fetchMessages();
    }
  }, [user, gameName]);

 // Emojis y reacciones.

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emoticonPickerRef.current && !emoticonPickerRef.current.contains(event.target)) {
        setShowEmoticonPicker(false);
      }
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target)) {
        setShowReactionPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  
  // Formatear referencias en el mensaje.

  const formatMessageText = (text) => {
    const mentionPattern = /@(\w+)/g;
    return text.split(mentionPattern).map((part, index) =>
      index % 2 === 1 ? (
        <a key={index} href={`users/profile/${part}`} className="mention">
          @{part}
        </a>
      ) : (
        part
      )
    );
  };

  // Formato de la hora y minuto que se envió el mensaje.

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
        const timestamp = Date.now();
        socketRef.current.emit('message', { sender: user.username, text: input, timestamp, gameName });
        
        if (gameName) {
            socketRef.current.emit('stop-typingGame', { user: user.username, gameName });
        } else {
            socketRef.current.emit('stop-typing', { user: user.username });
        }
        setInput('');
    }
};

  const handleEmoticonClick = (emoticon) => {
    setInput(input + emoticon);
    setShowEmoticonPicker(false);
  };

  const handleReactionClick = (messageId, e) => {
    e.stopPropagation();
    if (reactionToMessageId === messageId && showReactionPicker) {
      setShowReactionPicker(false);
      setReactionToMessageId(null);
    } else {
      setReactionToMessageId(messageId);
      setReactionPickerPosition({ x: e.clientX, y: e.clientY });
      setShowReactionPicker(true);
    }
  };

  const handleReactionSelect = (emoji) => {
    if (reactionToMessageId) {
      const message = messages.find((msg) => msg.messageId === reactionToMessageId);
      const userHasReacted = message?.reactions?.[emoji]?.includes(user.username);

      if (userHasReacted) {
        socketRef.current.emit('remove-reaction', {
          messageId: reactionToMessageId,
          emoji,
          user: user.username,
        });
      } else {
        const currentReactions = message.reactions || {};
        const newReactions = {
          ...currentReactions,
          [emoji]: [user.username]
        };
        socketRef.current.emit('reaction', {
          messageId: reactionToMessageId,
          emoji,
          user: user.username,
          reactions: newReactions,
        });
      }

      setReactionToMessageId(null);
      setShowReactionPicker(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (e.target.value) {
        if (gameName) {
            socketRef.current.emit('typingGame', { user: user.username, gameName });
        } else {
            socketRef.current.emit('typing', { user: user.username });
        }
    }

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
        if (gameName) {
            socketRef.current.emit('stop-typingGame', { user: user.username, gameName });
        } else {
            socketRef.current.emit('stop-typing', { user: user.username });
        }
    }, 3000);
};

return (
  <div className="chat-container">
    <div className="messages-and-users">
      <div className="messages-section">
        <div className="message-list">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <li
                key={msg.messageId}
                className="message-item"
                onMouseEnter={() => setHoveredMessageId(msg.messageId)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <div className="message-text">
                  <div className="message-header">
                  <img className='profile-pic' src={`https://coloretto-api.onrender.com/${user.profile.profilePicture}`} alt="Foto de perfil"/>
                    <span className="message-sender">{msg.sender}</span>
                    <span className="message-time">
                      {msg.timestamp ? formatTime(msg.timestamp) : ''}
                    </span>
                  </div>
                  <div className="message-content">
                    {msg.formattedText}
                  </div>
                </div>
                {hoveredMessageId === msg.messageId && (
                  <button
                    className="reaction-button"
                    onClick={(e) => handleReactionClick(msg.messageId, e)}
                  >
                    <i className="fas fa-comment-dots"></i>
                  </button>
                )}
                {showReactionPicker && reactionToMessageId === msg.messageId && (
                  <ReactionPicker
                    onSelect={handleReactionSelect}
                    style={{ position: 'absolute', left: reactionPickerPosition.x, top: reactionPickerPosition.y }}
                    ref={reactionPickerRef}
                  />
                )}
                <div className="message-reactions">
                  {msg.reactions &&
                    Object.entries(msg.reactions).map(([emoji, users]) => (
                      <div key={emoji} className="reaction" onClick={() => handleEmoticonClick(emoji, msg.messageId)}>
                        <span>{emoji}</span>
                        <span>({users.length})</span>
                      </div>
                    ))}
                </div>
              </li>
            ))
          ) : (
            <li>No hay mensajes.</li>
          )}
        </div>
        <div className={`typing-indicator ${typingGameUsers.length > 0 || typingUsers.length > 0 ? 'visible' : ''}`}>
      {gameName ? (
        typingGameUsers.length > 0 ? (
          `${typingGameUsers.join(', ')} está escribiendo...`
        ) : null
      ) : (
        typingUsers.length > 0 ? (
          `${typingUsers.join(', ')} está escribiendo...`
        ) : null
      )}
    </div>
      </div>
      

      <div className="connected-users-panel">
        <h2>Usuarios</h2>
        <ul>
          {users.length === 0 ? (
            <li>Cargando usuarios...</li>
          ) : users.map((userItem, idx) => (
            <li
              key={idx}
              className={`user-item ${userItem.isConnected ? 'online' : 'offline'}`}
            >
              <span className={`status-indicator ${userItem.isConnected ? 'online' : 'offline'}`}></span>
              {userItem.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
    
    <form onSubmit={sendMessage} className="chat-form">
  <div className="input-container">
    <input
      id="messageInput"
      type="text"
      className="chatInput"
      value={input}
      onChange={handleInputChange}
      placeholder="Escribe un mensaje..."
    />
    <button
      type="button"
      className="emoticon-button"
      onClick={() => setShowEmoticonPicker(!showEmoticonPicker)}
    >
      <i className="fas fa-smile"></i>
    </button>
  </div>
  <button className = "submitChat" type="submit">Enviar</button>
  {showEmoticonPicker && (
    <div className="emoticon-picker" ref={emoticonPickerRef}>
      <Emoticon onSelect={handleEmoticonClick} />
    </div>
  )}
</form>
  </div>
);
}

export default Chat;
