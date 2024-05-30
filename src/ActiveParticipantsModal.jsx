import React from 'react';
import './styles/ActiveParticipantsModal.scss';

function ActiveParticipantsModal(props) {
    const { participants, onClose, chatroomId, chat } = props;

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
                body: JSON.stringify({
                    ...chat,
                    users: chat.users.filter(user => user !== participant.username),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete participant');
            }

            const data = await response.json();
            props.onDeleteParticipant(data.users);
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
                            <p className="user">{participant}</p>
                            <button className="Btn" onClick={() => deleteParticipant(participant)}>
                                <img src={require("./assets/Eliminar.png")} alt="Eliminar" className='Img' />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ActiveParticipantsModal;
