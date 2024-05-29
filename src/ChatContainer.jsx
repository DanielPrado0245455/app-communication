import React, { useState, useEffect, useRef } from 'react';
import './styles/ChatContainer.scss';
import Logo from './assets/LogoT.png';
import ParticipantModal from './ParticipantModal';
import ActiveParticipantsModal from './ActiveParticipantsModal';
import RequestModal from './RequestModal';
import { useParams } from 'react-router-dom';

function ChatContainer(props) {
    const { userId } = useParams(); // Obtén el userId de los parámetros de la URL
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
        setActiveParticipants(props.chat ? props.chat.users : []);
    }, [props.chat]);

    useEffect(() => {
        // Establecer un intervalo para consultar nuevos mensajes cada 5 segundos
        const interval = setInterval(fetchNewMessages, 5000);

        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(interval);
    }, []);

    const fetchNewMessages = () => {
        // Realizar una solicitud al servidor para obtener nuevos mensajes
        fetch('/api/mensajes/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch new messages');
                }
                return response.json();
            })
            .then(data => {
                // Filtrar solo los mensajes que no estén presentes en el estado actual
                const newMessages = data.filter(message => !messages.some(existingMessage => existingMessage.id === message.id));
                // Actualizar el estado de los mensajes con los nuevos mensajes recibidos
                setMessages(prevMessages => [...prevMessages, ...newMessages]);
            })
            .catch(error => {
                console.error('Error fetching new messages:', error);
                // Manejar cualquier error de solicitud aquí
            });
    };

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
                user: userId,
                text:  newMessage.trim(), // Asigna el userId como el remitente del mensaje
                chatroom: props.chat.id // Asigna el participante seleccionado como el destinatario del mensaje
            };
    
            // Realiza la solicitud POST al backend para enviar el mensaje
            fetch('/api/mensajes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send message');
                }
                return response.json();
            })
            .then(data => {
                // Si la solicitud es exitosa, actualiza el estado de mensajes si es necesario
                setMessages([...messages, data]); // Asumiendo que el servidor devuelve el mensaje creado con su ID
                setNewMessage('');
                props.onSendMessage(data); // Llama a la función onSendMessage con el mensaje enviado
            })
            .catch(error => {
                console.error('Error sending message:', error);
                // Maneja cualquier error de solicitud aquí
            });
        }
    };
    

    const getAvailableParticipants = () => {
        if (props.chat) {
            return props.allParticipants.filter(user => !props.chat.users.includes(user.username.toString()));
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
                            <img src={require("./assets/Apodo.png")} alt="User" className="UserChat" />
                            <h1>{props.chat.title}</h1>
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
                            <div key={message.id} className={`Message ${message.user === userId ? 'sent' : 'received'}`}>
                                <div className="MessageHeader">
                                    <span className="Sender">{message.user ?  userId === message.user ? 'Tu' : message.user: message.sender}</span>
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
