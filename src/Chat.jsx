import React from "react";
import "./styles/Chat.scss";

function Chat(props) {
    return (
        <div className="Chat">
            <div className="containerImg">
                <img src={require(`${props.img}`)} alt="user" className="img"/>
                <span></span>
            </div>        
            <p className="user">{props.user}</p>
        </div>
    );
}

export default Chat;