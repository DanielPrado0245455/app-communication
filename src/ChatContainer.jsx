import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './styles/ChatContainer.scss';
import Logo from './assets/LogoT.png';
import ParticipantModal from './ParticipantModal';
import ActiveParticipantsModal from './ActiveParticipantsModal';
import RequestModal from './RequestModal';
import { useParams } from 'react-router-dom';
import Apodo from './assets/Apodo.png';
import Agregar from './assets/Agregar.png';
import Participantes from './assets/Participantes.png';
import Solicitud from './assets/Solicitud.png';
import Enviar from './assets/Enviar.png';
import { decipher } from './utils/serverDecipher';
import { cipher } from './utils/clientCipher';

function ChatContainer(props) {
    const { userId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
    const [showActiveParticipantsModal, setShowActiveParticipantsModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [activeParticipants, setActiveParticipants] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (props.chat) {
            setMessages(props.chat.messages || []);
            setActiveParticipants(props.chat.users || []);
        }
    }, [props.chat]);

    useEffect(() => {
        if (props.chat) {
            const fetchMessages = async () => {
                try {
                    const response = await fetch(`/api/mensajes/?chatroom=${props.chat.id}`);
                    const data = await response.text();
                    const decipheredText = decipher(data, 1);
                    const messages = JSON.parse(decipheredText);
                    setMessages(messages);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            };
    
            fetchMessages();
            const intervalId = setInterval(fetchMessages, 5000);
    
            return () => clearInterval(intervalId);
        }
    }, [props.chat]);

    const handleInputChange = (event) => setNewMessage(event.target.value);

    const handleEnterPress = (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    const sendMessage = useCallback(async () => {
        if (newMessage.trim() === '') return;
    
        if (!props.chat || !props.chat.id) {
            console.error('No chat selected or chat ID is missing');
            return;
        }
    
        const message = {
            user: userId,
            text: newMessage.trim(),
            chatroom: props.chat.id,
        };
    
        try {
            const response = await fetch('/api/mensajes/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: cipher(JSON.stringify(message), 1),
            });
    
            if (!response.ok) throw new Error('Failed to send message');
    
            const responseData = await response.text(); // Get response text
            const decipheredData = decipher(responseData, 1); // Decipher the response data
            const data = JSON.parse(decipheredData); // Parse the deciphered data
    
            setMessages((prevMessages) => [...prevMessages, data]);
            setNewMessage('');
            props.onSendMessage(data);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }, [newMessage, props.chat, userId, props.onSendMessage]);
    

    const getUserNickname = (username) => {
        const user = props.allParticipants.find(participant => participant.username === username);
        return user ? user.nickname : 'Desconocido';
    };

    const getAvailableParticipants = useMemo(() => {
        if (props.chat) {
            return props.allParticipants.filter((user) => !activeParticipants.includes(user.username.toString()));
        }
        return [];
    }, [props.allParticipants, activeParticipants]);

    const openAddParticipantModal = () => setShowAddParticipantModal(true);
    const closeAddParticipantModal = () => setShowAddParticipantModal(false);

    const handleAddParticipant = (updatedUsers) => {
        setActiveParticipants(updatedUsers);
        closeAddParticipantModal();
    };

    const handleDeleteParticipant = (updatedUsers) => {
        setActiveParticipants(updatedUsers);
        if (updatedUsers.length === 0) {
            props.onChatDeleted();
        }
    };

    const openActiveParticipantsModal = () => setShowActiveParticipantsModal(true);
    const closeActiveParticipantsModal = () => setShowActiveParticipantsModal(false);

    const openRequestModal = () => setShowRequestModal(true);
    const closeRequestModal = (updatedChat) => {
        if (updatedChat) {
            const updatedChats = props.chats.map(c => (c.id === updatedChat.id ? updatedChat : c));
            props.setChats(updatedChats);
            props.onChatSelect(updatedChat);
        }
        setShowRequestModal(false);
    };

    const checkAndDeleteChatroom = useCallback(async () => {
        if (activeParticipants.length === 1 && props.chat) {
            try {
                const response = await fetch(`/api/chatrooms/${props.chat.id}`, {
                    method: 'DELETE',
                });
    
                if (!response.ok) {
                    throw new Error('Failed to delete chatroom');
                }
    
                props.onChatDeleted();
            } catch (error) {
                console.error('Error deleting chatroom:', error);
            }
        }
    }, [activeParticipants, props.chat, props.onChatDeleted]);

    useEffect(() => {
        checkAndDeleteChatroom();
    }, [activeParticipants, checkAndDeleteChatroom]);

    if (!props.chat) {
        return (
            <div className="ChatContainer">
                <div className="NoChatSelected">
                    <img src={Logo} alt="Logo" className="Logo" />
                    <p className="NoChatSelectedText">Selecciona un chat para comenzar</p>
                </div>
            </div>
        );
    }
    return (
        <div className="ChatContainer">
            {props.chat && (
                <>
                    <div className="TopBar">
                        <div className="UserInfo">
                            <img src={Apodo} alt="User" className="UserChat" />
                            <h1>{props.chat.title}</h1>
                        </div>
                        <div className="Participants">
                            {props.chat.creator === userId && (
                                <>
                                    <button className="Btn" onClick={openAddParticipantModal}>
                                        <img src={Agregar} alt="Logo" className='Img' />
                                    </button>
                                    <button className="Btn" onClick={openRequestModal}>
                                        <img src={Solicitud} alt="Logo" className='Img' />
                                    </button>
                                </>
                            )}
                            <button className="Btn" onClick={openActiveParticipantsModal}>
                                <img src={Participantes} alt="Logo" className='Img' />
                            </button>
                        </div>
                    </div>
                    <div className="Messages">
                        {messages.map((message) => (
                            <div key={message.id} className={`Message ${message.user === userId ? 'sent' : 'received'}`}>
                                <div className="MessageHeader">
                                    <span className="Sender">{getUserNickname(message.user)}</span>
                                </div>
                                <div className="MessageBody">
                                    {message.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="BottomBar">
                        <input
                            type="text"
                            className="Input"
                            placeholder='Escribe un mensaje'
                            value={newMessage}
                            onChange={handleInputChange}
                            onKeyPress={handleEnterPress}
                        />
                        <button className="Btn" onClick={sendMessage}>
                            <img src={Enviar} alt="Logo" className='Img' />
                        </button>
                    </div>
                    {showAddParticipantModal && (
                        <ParticipantModal
                            availableParticipants={getAvailableParticipants}
                            onClose={closeAddParticipantModal}
                            onParticipantSelect={handleAddParticipant}
                            chatroomId={props.chat.id}
                            chat={props.chat}
                        />
                    )}
                    {showActiveParticipantsModal && (
                        <ActiveParticipantsModal
                            participants={activeParticipants}
                            onClose={closeActiveParticipantsModal}
                            chatroomId={props.chat.id}
                            chat={props.chat}
                            userId={userId}
                            onDeleteParticipant={handleDeleteParticipant}
                            onChatDeleted={props.onChatDeleted} // Pass this prop to handle chat deletion
                        />
                    )}
                    {showRequestModal && (
                        <RequestModal
                            requests={props.chat.requests}
                            chatId={props.chat.id}
                            chats={props.chats}
                            setChats={props.setChats}
                            onClose={closeRequestModal}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default ChatContainer;
