import React, { useState } from 'react';
import Chat from './Chat';
import './styles/ListChats.scss';

function ListChats({ chats, onChatSelect, setChats, currentUser, users }) {
    const [showMenu, setShowMenu] = useState(false);
    const [newChatTitle, setNewChatTitle] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinChatModal, setShowJoinChatModal] = useState(false);
    const [showListUsers, setShowListUsers] = useState(false);
    const [participants, setParticipants] = useState([]);
    const generalUsers = users.filter(user => user.username !== currentUser && !participants.includes(user.username));

    const toggleMenu = () => setShowMenu(!showMenu);
    const handleListUsers = () => setShowListUsers(!showListUsers);

    const handleCreateChat = () => {
        setShowMenu(false);
        setShowCreateForm(true);
    };

    const handleChatSelect = (chat) => {
        onChatSelect(chat);
        setShowMenu(false);
    };

    const handleCreateFormSubmit = (event) => {
        event.preventDefault();
        const newChat = {
            creator: currentUser,
            users: [...participants, currentUser],
            requests: [],
            title: newChatTitle
        };

        fetch('/api/chatrooms/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newChat)
        })
        .then(response => response.json())
        .then(data => {
            setChats([...chats, data]);
            setNewChatTitle('');
            setParticipants([]);
            setShowCreateForm(false);
        })
        .catch(error => {
            console.error('Error creating chat:', error);
        });
    };

    const handleJoinChat = () => setShowJoinChatModal(true);

    const handleModalClick = (e) => {
        if (e.target.classList.contains('menuOverlay')) {
            setShowCreateForm(false);
            setShowJoinChatModal(false);
            setShowListUsers(false);
        }
    };

    const userChats = chats.filter(chat => chat.users.includes(currentUser));

    const handleAddParticipant = (username) => {
        if (!participants.includes(username)) {
            setParticipants([...participants, username]);
        }
    };

    const handleRemoveParticipant = (username) => {
        setParticipants(participants.filter(user => user !== username));
    };

    return (
        <div className="ListChats">
            <div className='chats'>
                ChatRoom
                <button onClick={toggleMenu} className="menuButton">
                    <img src={require("./assets/Crear.png")} alt="Logo" className='Img' />
                    {showMenu && (
                        <div className="menuOverlay" onClick={handleModalClick}>
                            <div className="menu">
                                <button onClick={handleCreateChat}>Crear nuevo chat</button>
                                <button onClick={handleJoinChat}>Unirse a chat</button>
                            </div>
                        </div>
                    )}
                </button>
                <button onClick={handleListUsers} className="menuButton">
                    <img src={require("./assets/Usuarios.png")} alt="Logo" className='Img' />
                </button>
            </div>

            {showCreateForm && (
                <div className="menuOverlay" onClick={handleModalClick}>
                    <div className="menu">
                        <h2>Crear nuevo chat</h2>
                        <form onSubmit={handleCreateFormSubmit}>
                            <input
                                type="text"
                                placeholder="Nombre del chat"
                                value={newChatTitle}
                                onChange={(e) => setNewChatTitle(e.target.value)}
                            />
                            <ul>
                                {generalUsers.map((user, index) => (
                                    <li key={index} onClick={() => handleAddParticipant(user.username)}>
                                        {user.username}
                                    </li>
                                ))}
                            </ul>
                            <div>
                                <h3>Participantes:</h3>
                                <ul>
                                    {participants.map((participant, index) => (
                                        <li key={index}>
                                            {participant} <button onClick={() => handleRemoveParticipant(participant)}>Remove</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button type="submit" className="createButton">Crear</button>
                        </form>
                    </div>
                </div>
            )}

            {showJoinChatModal && (
                <div className="menuOverlay" onClick={handleModalClick}>
                    <div className="menu">
                        <h2>Elige un chat para unirte:</h2>
                        <ul>
                            {userChats.map((chat, index) => (
                                <li key={index} onClick={() => handleChatSelect(chat)}>
                                    {chat.title ? chat.title : chat.creator}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {showListUsers && (
                <div className="menuOverlay" onClick={handleModalClick}>
                    <div className="menu">
                        <h2>Lista de usuarios</h2>
                        <ul>
                            {generalUsers.map((user, index) => (
                                <li key={index}>{user.username}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {userChats.map((chat, index) => (
                <div key={index} onClick={() => handleChatSelect(chat)} className="Chatbox">
                    <Chat user={chat.title ? chat.title : chat.creator} img={require(`./assets/Apodo.png`)} />
                </div>
            ))}
        </div>
    );
}

export default ListChats;
