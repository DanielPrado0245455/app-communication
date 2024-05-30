import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ListChats from './ListChats';
import ChatContainer from './ChatContainer';
import './styles/Principal.scss';
import { decipher } from './utils/serverDecipher';

function Principal() {
    const { userId } = useParams();
    const [chats, setChats] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [initialChats, setInitialChats] = useState([]);
    const [newMessageChatId, setNewMessageChatId] = useState(null);

    useEffect(() => {
        const fetchChatsAndUsers = async () => {
            try {
                const chatResponse = await fetch('/api/chatrooms/');
                const chatText = await chatResponse.text();
                const chatData = JSON.parse(decipher(chatText, 1));
                setChats(chatData);
                setInitialChats(chatData);

                const userResponse = await fetch('/api/usuarios/');
                const userText = await userResponse.text();
                const userData = JSON.parse(decipher(userText, 1));
                setUsers(userData);
            } catch (error) {
                console.error('Error fetching chats or users:', error);
            }
        };

        fetchChatsAndUsers();
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch('/api/mensajes/');
                const data = await response.text();
                const decipheredText = decipher(data, 1);
                const newMessages = JSON.parse(decipheredText);

                const newMessagesByChat = newMessages.reduce((acc, message) => {
                    if (!acc[message.chatroom]) {
                        acc[message.chatroom] = [];
                    }
                    acc[message.chatroom].push(message);
                    return acc;
                }, {});

                setInitialChats(prevInitialChats => {
                    let updatedInitialChats = [...prevInitialChats];
                    for (let chatroomId in newMessagesByChat) {
                        const newMessagesForChat = newMessagesByChat[chatroomId];
                        const initialChat = prevInitialChats.find(chat => chat.id === parseInt(chatroomId));
                        const existingMessages = initialChat ? initialChat.messages : [];
                        if (JSON.stringify(existingMessages) !== JSON.stringify(newMessagesForChat)) {
                            setNewMessageChatId(parseInt(chatroomId));
                            setChats(prevChats => prevChats.map(prevChat =>
                                prevChat.id === parseInt(chatroomId)
                                    ? { ...prevChat, messages: newMessagesForChat }
                                    : prevChat
                            ));
                            updatedInitialChats = updatedInitialChats.map(prevInitialChat =>
                                prevInitialChat.id === parseInt(chatroomId)
                                    ? { ...prevInitialChat, messages: newMessagesForChat }
                                    : prevInitialChat
                            );
                        }
                    }
                    return updatedInitialChats;
                });
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        const intervalId = setInterval(fetchMessages, 5000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);

        if (chat.id === newMessageChatId) {
            setNewMessageChatId(null);

            setInitialChats(prev => prev.map(prevChat =>
                prevChat.id === chat.id
                    ? { ...prevChat, messages: chat.messages }
                    : prevChat
            ));
        }
    };

    const handleSendMessage = async (message) => {
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

            await fetch(`/api/chatrooms/${selectedChat.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: [...selectedChat.messages, message] })
            });
        }
    };

    const handleChatDeleted = useCallback((deletedChatId) => {
        setSelectedChat(null);
        setChats(prevChats => prevChats.filter(chat => chat.id !== deletedChatId));
    }, []);

    const getAvailableParticipants = useMemo(() => {
        if (selectedChat) {
            return users.filter(user => !selectedChat.users.some(participant => participant.toString() === user.username.toString()));
        } else {
            return [];
        }
    }, [selectedChat, users]);

    return (
        <div className="Principal">
            <ListChats 
                chats={chats} 
                onChatSelect={handleChatSelect} 
                setChats={setChats} 
                currentUser={userId} 
                users={users}
                newMessageChatId={newMessageChatId}
            />
            <ChatContainer
                chat={selectedChat}
                onSendMessage={handleSendMessage}
                allParticipants={users} 
                availableParticipants={getAvailableParticipants} 
                chats={chats} 
                setChats={setChats}
                onChatSelect={handleChatSelect} 
                onChatDeleted={handleChatDeleted}
            />
        </div>
    );
}

export default Principal;

