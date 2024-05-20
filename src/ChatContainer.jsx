import React, { useState, useEffect, useRef } from 'react';
import './styles/ChatContainer.scss';
import Logo from './assets/LogoT.png';
import ParticipantModal from './ParticipantModal';
import ActiveParticipantsModal from './ActiveParticipantsModal';
import RequestModal from './RequestModal';

function ChatContainer(props) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
    const [showActiveParticipantsModal, setShowActiveParticipantsModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [participants, setParticipants] = useState([]);
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
        }
    }, [props.chat]);

    useEffect(() => {
        setActiveParticipants(props.chat ? props.chat.participants : []);
    }, [props.chat]);

    const handleInputChange = (event) => {
        setNewMessage(event.target.value);
    };

    const handleEnterPress = (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    const sendMessage = () => {
        if (newMessage.trim() !== '') {
            const message = {
                id: messages.length + 1,
                text: newMessage.trim(),
                sentByCurrentUser: true,
                sender: 'Tu', 
                recipient: selectedParticipant
            };
            setMessages([...messages, message]);
            setNewMessage('');
            props.onSendMessage(message);
        }
    };

    const getAvailableParticipants = () => {
        if (props.chat) {
            return props.allParticipants.filter(user => !props.chat.participants.includes(user.username.toString()));
        } else {
            return [];
        }
    };

    const openAddParticipantModal = () => {
        setShowAddParticipantModal(true);
    };

    const closeAddParticipantModal = () => {
        setShowAddParticipantModal(false);
    };

    const handleAddParticipant = (participant) => {
        setSelectedParticipant(participant);
        if (!participants.includes(participant)) {
            setParticipants([...participants, participant]);
        }
    };

    const openActiveParticipantsModal = () => {
        setShowActiveParticipantsModal(true);
    };

    const closeActiveParticipantsModal = () => {
        setShowActiveParticipantsModal(false);
    };

    const openRequestModal = () => {
        setShowRequestModal(true);
    };

    const closeRequestModal = () => {
        setShowRequestModal(false);
    };

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
                            <img src={require(`${props.chat.img}`)} alt="User" className="UserChat" />
                            <h1>{props.chat.name}</h1>
                        </div>
                        <div className="Participants">
                            <button className="Btn" onClick={openAddParticipantModal}>
                                <img src={require("./assets/Agregar.png")} alt="Logo" className='Img' />
                            </button>
                            <button className="Btn" onClick={openActiveParticipantsModal}>
                                <img src={require("./assets/Participantes.png")} alt="Logo" className='Img' />
                            </button>
                            <button className="Btn" onClick={openRequestModal}>
                                <img src={require("./assets/Solicitud.png")} alt="Logo" className='Img' />
                            </button>
                        </div>
                    </div>
                    <div className="Messages">
                        {messages.map((message) => (
                            <div key={message.id} className={`Message ${message.sentByCurrentUser ? 'sent' : 'received'}`}>
                                <div className="MessageHeader">
                                    <span className="Sender">{message.sentByCurrentUser ? 'Tú' : message.sender}</span>
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
                            <img src={require("./assets/Enviar.png")} alt="Logo" className='Img' />
                        </button>
                    </div>
                    {showAddParticipantModal && (
                        <ParticipantModal
                            availableParticipants={getAvailableParticipants()} 
                            participants={participants}
                            onClose={closeAddParticipantModal}
                            onParticipantSelect={handleAddParticipant}
                        />
                    )}
                    {showActiveParticipantsModal && (
                        <ActiveParticipantsModal
                            participants={activeParticipants}
                            onClose={closeActiveParticipantsModal}
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
