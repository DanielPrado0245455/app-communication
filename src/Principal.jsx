import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ListChats from './ListChats';
import ChatContainer from './ChatContainer';
import './styles/Principal.scss';
import { decipher } from './utils/serverDecipher';
import { cipher } from './utils/clientCipher';

function Principal() {
    const { userId } = useParams(); // Get userId from URL parameters
    const [chats, setChats] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [initialChats, setInitialChats] = useState([]); // Copy of initial chats
    const [newMessageChatId, setNewMessageChatId] = useState(null); // ID of the chat with new messages

    useEffect(() => {
        // Fetch chats and users from the backend
        const fetchChatsAndUsers = async () => {
            try {
                const chatResponse = await fetch('/api/chatrooms/');
                const chatText = await chatResponse.text();
                const chatData = JSON.parse(decipher(chatText, 1));
                setChats(chatData);
                setInitialChats(chatData); // Save initial copy of chats

                const userResponse = await fetch('/api/usuarios/');
                const userText = await userResponse.text();
                const userData = JSON.parse(decipher(userText, 1));
                setUsers(userData);
            } catch (error) {
                console.error('Error fetching chats or users:', error);
            }
        };

        fetchChatsAndUsers();
    }, []); // Empty dependency array ensures this effect runs only once

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch('/api/mensajes/');
                const data = await response.text();
                const decipheredText = decipher(data, 1);
                const newMessages = JSON.parse(decipheredText);

                // Organize new messages by chatroom
                const newMessagesByChat = newMessages.reduce((acc, message) => {
                    if (!acc[message.chatroom]) {
                        acc[message.chatroom] = [];
                    }
                    acc[message.chatroom].push(message);
                    return acc;
                }, {});

                // Compare new messages with the initially stored messages
                setInitialChats(prevInitialChats => {
                    let updatedInitialChats = [...prevInitialChats];
                    for (let chatroomId in newMessagesByChat) {
                        const newMessagesForChat = newMessagesByChat[chatroomId];
                        const initialChat = prevInitialChats.find(chat => chat.id === parseInt(chatroomId));
                        const existingMessages = initialChat ? initialChat.messages : [];
                        if (JSON.stringify(existingMessages) !== JSON.stringify(newMessagesForChat)) {
                            setNewMessageChatId(parseInt(chatroomId)); // Mark chat with new messages
                            // Update the state of chats
                            setChats(prevChats => prevChats.map(prevChat =>
                                prevChat.id === parseInt(chatroomId)
                                    ? { ...prevChat, messages: newMessagesForChat }
                                    : prevChat
                            ));
                            // Update the state of initialChats
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

        const intervalId = setInterval(fetchMessages, 5000); // 5-second interval

        return () => {
            clearInterval(intervalId); // Clear interval when the component unmounts
        };
    }, [initialChats]); // Run the effect when initialChats changes

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);

        if (chat.id === newMessageChatId) {
            // Clear new message alert when selecting the chat
            setNewMessageChatId(null);

            // Update local messages as read
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

            // Update the backend with the new message
            await fetch(`/api/chatrooms/${selectedChat.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: [...selectedChat.messages, message] })
            });
        }
    };

    const getAvailableParticipants = () => {
        // Filter users not currently in the selected chat
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
                newMessageChatId={newMessageChatId} // Pass the chat ID with new messages
            />
            <ChatContainer
                chat={selectedChat}
                onSendMessage={handleSendMessage}
                allParticipants={users} 
                availableParticipants={getAvailableParticipants()} 
                chats={chats} 
                setChats={setChats}
            />
        </div>
    );
}

export default Principal;
