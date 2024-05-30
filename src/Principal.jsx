import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ListChats from './ListChats';
import ChatContainer from './ChatContainer';
import './styles/Principal.scss';

function Principal() {
    const { userId } = useParams(); // Obtén el userId de los parámetros de la URL
    const [chats, setChats] = useState([]);
    const [users, setUsers] = useState([]); 
    const [selectedChat, setSelectedChat] = useState(null);

    useEffect(() => {
        // Realizar solicitudes al backend para obtener los chats y usuarios
        fetch('/api/chatrooms/')
            .then(response => response.json())
            .then(data => setChats(data))
            .catch(error => console.error('Error fetching chats:', error));

        fetch('/api/usuarios/')
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
    };

    const handleSendMessage = (message) => {
        if (selectedChat) {
            const updatedChats = chats.map(chat => {
                if (chat.id === selectedChat.id) {
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
            return users.filter(user => !selectedChat.users.some(participant => participant.toString() === user.username.toString()));
        } else {
            return [];
        }
    };

    return (
        <div className="Principal">
            <ListChats 
                chats={chats} 
                onChatSelect={handleChatSelect} 
                setChats={setChats} 
                currentUser={userId} 
                users={users} 
            />
            <ChatContainer
                chat={selectedChat}
                onSendMessage={handleSendMessage}
                allParticipants={users} 
                availableParticipants={getAvailableParticipants()} 
                chats={chats} // Pasar chats y setChats al ChatContainer
                setChats={setChats}
            />
        </div>
    );
}

export default Principal;
