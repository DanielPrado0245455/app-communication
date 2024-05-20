import React from 'react';
import './styles/ActiveParticipantsModal.scss';

function ActiveParticipantsModal(props) {
    const { participants, onClose } = props;

    const handleCloseModal = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            onClose();
        }
    };

    const deleteParticipant = (participant) => {
        const updatedParticipants = participants.filter((p) => p !== participant);
        props.onDeleteParticipant(updatedParticipants);
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
                                <img src={require("./assets/Eliminar.png")} alt="Logo" className='Img' />
                            </button>
                        </li>

                    ))}
                </ul>
            </div>
        </div>
    );
}
export default ActiveParticipantsModal;
