import React, { useState } from 'react';
import Chat from './Chat';
import './styles/ListChats.scss';

function ListChats({ chats, onChatSelect, setChats, currentUser, users }) {
    const [showMenu, setShowMenu] = useState(false);
    const [newChatUser, setNewChatUser] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinChatModal, setShowJoinChatModal] = useState(false);
    const currentUserObj = users.find(user => user.id === parseInt(currentUser));
    const currentUserUsername = currentUserObj ? currentUserObj.username : null;

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

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
            name: newChatUser,
            user: currentUserUsername,
            img: './assets/Apodo.png',
            messages: [],
            participants: [currentUserUsername],
            requests: []
        };
        setChats([...chats, newChat]);
        setNewChatUser('');
        setShowCreateForm(false);
    };

    const handleJoinChat = () => {
        setShowJoinChatModal(true);
    };

    const handleModalClick = (e) => {
        if (e.target.classList.contains('menuOverlay')) {
            setShowCreateForm(false);
            setShowJoinChatModal(false);
        }
    };
    

    const userChats = chats.filter(chat => {
        
        return chat.participants.includes(currentUserUsername);
    });

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
            </div>
            {/* Formulario de creación de chat dentro del modal */}
            {showCreateForm && (
                <div className="menuOverlay" onClick={handleModalClick}>
                    <div className="menu">
                        <form onSubmit={handleCreateFormSubmit}>
                            <input 
                                type="text" 
                                placeholder="Nombre del chat" 
                                value={newChatUser} 
                                onChange={(e) => setNewChatUser(e.target.value)} 
                            />
                            <button type="submit">Crear Chat</button>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal para unirse a un chat */}
            {showJoinChatModal && (
                <div className="menuOverlay" onClick={handleModalClick}>
                    <div className="menu">
                        <h2>Elige un chat para unirte:</h2>
                        <ul>
                            {userChats.map((chat, index) => (
                                <li key={index} onClick={() => handleChatSelect(chat)}>{chat.name ? chat.name : chat.user}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {/* Lista de chats */}
            {userChats.map((chat, index) => (
                <div key={index} onClick={() => handleChatSelect(chat)} className="Chatbox">
                    <Chat user={chat.name ? chat.name : chat.user} img={chat.img} />
                </div>
            ))}
        </div>
    );
}

export default ListChats;
