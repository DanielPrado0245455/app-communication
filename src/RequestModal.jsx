import React, { useState, useEffect } from 'react';
import './styles/RequestModal.scss';
import { cipher } from './utils/clientCipher';
import { decipher } from './utils/serverDecipher';

function RequestModal({ requests, chatId, chats, setChats, onClose }) {
    const [currentRequests, setCurrentRequests] = useState(requests);

    useEffect(() => {
        setCurrentRequests(requests);
    }, [requests]);

    const handleCloseModal = (e) => {
        if (e.target.classList.contains('RequestModal')) {
            onClose(null);
        }
    };

    const handleApproveRequest = (request) => {
        const chat = chats.find(chat => chat.id === chatId);
        if (!chat) {
          console.error('Chat not found');
          return;
        }
      
        const updatedChat = {
          ...chat,
          users: [...chat.users, request],
          requests: chat.requests.filter(req => req !== request),
        };
      
        fetch(`/api/chatrooms/${chatId}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: cipher(JSON.stringify(updatedChat), 1),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to update chat');
          }
          return response.text(); // Get response text
        })
        .then(data => {
          const decipheredData = decipher(data, 1); // Decipher the response data
          const parsedData = JSON.parse(decipheredData); // Parse the deciphered data
          const updatedChats = chats.map(c => (c.id === chatId ? parsedData : c));
          setChats(updatedChats);
          setCurrentRequests(updatedChat.requests); // Update the current requests
          onClose(parsedData); // Close the modal after approving with updated data
        })
        .catch(error => {
          console.error('Error updating chat:', error);
        });
      };

    const handleRejectRequest = (request) => {
        const chat = chats.find(chat => chat.id === chatId);
        if (!chat) {
          console.error('Chat not found');
          return;
        }
      
        const updatedChat = {
          ...chat,
          requests: chat.requests.filter(req => req !== request),
        };
      
        fetch(`/api/chatrooms/${chatId}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: cipher(JSON.stringify(updatedChat), 1),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to update chat');
          }
          return response.text(); // Get response text
        })
        .then(data => {
          const decipheredData = decipher(data, 1); // Decipher the response data
          const parsedData = JSON.parse(decipheredData); // Parse the deciphered data
          const updatedChats = chats.map(c => (c.id === chatId ? parsedData : c));
          setChats(updatedChats);
          setCurrentRequests(updatedChat.requests); // Update the current requests
          onClose(parsedData); // Close the modal after rejecting with updated data
        })
        .catch(error => {
          console.error('Error updating chat:', error);
        });
      };

    return (
        <div className="RequestModal" onClick={handleCloseModal}>
            <div className="modal">
                <p className="title">Solicitudes pendientes</p>
                <div className="list">
                    {currentRequests.map((request, index) => (
                        <div className="request" key={index}>
                            <p className="user">{request}</p>
                            <button onClick={() => handleApproveRequest(request)}>Aprobar</button>
                            <button onClick={() => handleRejectRequest(request)}>Rechazar</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default RequestModal;
