import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ListChats from './ListChats';
import ChatContainer from './ChatContainer';
import data from './data/data.json';
import './styles/Principal.scss';

function Principal() {
    const { userId } = useParams(); // Obtén el userId de los parámetros de la URL
    const [chats, setChats] = useState([]);
    const [users, setUsers] = useState([]); 
    const [selectedChat, setSelectedChat] = useState(null);

    useEffect(() => {
        setChats(data.chats);
        setUsers(data.users); 
    }, []);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
    };

    const handleSendMessage = (message) => {
        if (selectedChat) {
            const updatedChats = chats.map(chat => {
                if (chat.user === selectedChat.user) {
                    return {
                        ...chat,
                        messages: [...chat.messages, message]
                    };
                }
                return chat;
            });
            setChats(updatedChats);
        }
    };

    const getAvailableParticipants = () => {
        // Filtrar los usuarios que no están en el chat seleccionado actualmente
        if (selectedChat) {
            return users.filter(user => !selectedChat.participants.some(participant => participant.toString() === user.username.toString()));
        } else {
            return [];
        }
    };
    

    return (
        <div className="Principal">
            <ListChats chats={chats} onChatSelect={handleChatSelect} setChats={setChats} currentUser={userId} users={users} />
            <ChatContainer
                chat={selectedChat}
                onSendMessage={handleSendMessage}
                allParticipants={users} 
                availableParticipants={getAvailableParticipants()} // Pasamos la lista de participantes disponibles
            />
        </div>
    );
}

export default Principal;
