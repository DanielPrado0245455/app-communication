import React from 'react';
import { cipher, decipher } from './utils/clientCipher';

function ParticipantModal({ availableParticipants, onClose, onParticipantSelect, chatroomId, chat }) {
    const handleCloseModal = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            onClose();
        }
    };
    const handleParticipantSelect = async (participant) => {
        try {
            const response = await fetch(`/api/chatrooms/${chatroomId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: cipher(JSON.stringify({
                    ...chat,
                    users: [...chat.users, participant.username],
                }), 1),
            });
    
            if (!response.ok) {
                throw new Error('Failed to add participant');
            }
    
            const responseBody = await response.text();
            const decryptedData = JSON.parse(decipher(responseBody, 1));
    
            onParticipantSelect(decryptedData.users); // Pass the updated list of users
            onClose();
        } catch (error) {
            console.error('Error adding participant:', error);
        }
    };

    return (
        <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal">
                <h2>Seleccionar Participante</h2>
                <ul>
                    {availableParticipants.map(participant => (
                        <li key={participant.id} onClick={() => handleParticipantSelect(participant)}>
                            {participant.username}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ParticipantModal;
