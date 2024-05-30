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
                    const data = await response.json();
                    setMessages(data);
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
                body: JSON.stringify(message),
            });
    
            if (!response.ok) throw new Error('Failed to send message');
    
            const data = await response.json();
            setMessages((prevMessages) => [...prevMessages, data]);
            setNewMessage('');
            props.onSendMessage(data);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }, [newMessage, props.chat, userId, props.onSendMessage]);
    

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
    };

    const openActiveParticipantsModal = () => setShowActiveParticipantsModal(true);
    const closeActiveParticipantsModal = () => setShowActiveParticipantsModal(false);

    const openRequestModal = () => setShowRequestModal(true);
    const closeRequestModal = () => setShowRequestModal(false);

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
                            <button className="Btn" onClick={openAddParticipantModal}>
                                <img src={Agregar} alt="Logo" className='Img' />
                            </button>
                            <button className="Btn" onClick={openActiveParticipantsModal}>
                                <img src={Participantes} alt="Logo" className='Img' />
                            </button>
                            <button className="Btn" onClick={openRequestModal}>
                                <img src={Solicitud} alt="Logo" className='Img' />
                            </button>
                        </div>
                    </div>
                    <div className="Messages">
                        {messages.map((message) => (
                            <div key={message.id} className={`Message ${message.user === userId ? 'sent' : 'received'}`}>
                                <div className="MessageHeader">
                                    <span className="Sender">{message.user ? (userId === message.user ? 'Tu' : message.user) : message.sender}</span>
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
                            onDeleteParticipant={handleDeleteParticipant}
                        />
                    )}
                    {showRequestModal && (
                        <RequestModal
                            requests={props.chat.requests}
                            onClose={closeRequestModal}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default ChatContainer;
