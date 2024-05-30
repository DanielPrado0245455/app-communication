import React from 'react';
import './styles/ActiveParticipantsModal.scss';
import { cipher } from './utils/clientCipher';
import { decipher } from './utils/serverDecipher';

function ActiveParticipantsModal(props) {
    const { participants, onClose, chatroomId, chat, userId } = props;

    const handleCloseModal = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            onClose();
        }
    };

    const deleteParticipant = async (participant) => {
        try {
            const response = await fetch(`/api/chatrooms/${chatroomId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: cipher(JSON.stringify({
                    ...chat,
                    users: chat.users.filter(user => user !== participant),
                }), 1),
            });

            if (!response.ok) {
                throw new Error('Failed to delete participant');
            }

            const responseBody = await response.text();
            const decryptedData = JSON.parse(decipher(responseBody, 1));
            props.onDeleteParticipant(decryptedData.users);

            // Show alert when a participant is deleted
            alert('Un usuario se eliminó.');
        } catch (error) {
            console.error('Error deleting participant:', error);
        }
    };

    return (
        <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal">
                <h2>Participantes Activos</h2>
                <ul>
                    {participants.map((participant, index) => (
                        <li key={index}>
                            <p className="user">
                                {participant} {chat.creator === participant && <span>(coordinador)</span>}
                            </p>
                            {chat.creator === userId && (
                                <button className="Btn" onClick={() => deleteParticipant(participant)}>
                                    <img src={require("./assets/Eliminar.png")} alt="Eliminar" className='Img' />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ActiveParticipantsModal;
