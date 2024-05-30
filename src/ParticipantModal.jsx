import React from 'react';

function ParticipantModal({ availableParticipants, onClose, onParticipantSelect, chatroomId, chat }) {
    const handleCloseModal = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            onClose();
        }
    };

    const handleParticipantSelect = (participant) => {
        fetch(`/api/chatrooms/${chatroomId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...chat,
                users: [...chat.users, participant.username],
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add participant');
            }
            return response.json();
        })
        .then(data => {
            onParticipantSelect(data.users); // Pass the updated list of users
            onClose();
        })
        .catch(error => {
            console.error('Error adding participant:', error);
        });
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
