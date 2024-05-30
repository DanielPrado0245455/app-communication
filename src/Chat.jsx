import React from "react";
import "./styles/Chat.scss";
import defaultImg from './assets/Apodo.png';

function Chat({ user, img, isNewMessage }) {
    return (
        <div className="Chat">
            <div className="containerImg">
                <img src={img ? img : defaultImg} alt="user" className="img" />
                <span className={isNewMessage ? 'active' : 'inactive'}></span>
            </div>        
            <p className="user">{user}</p>
        </div>
    );
}

export default Chat;
