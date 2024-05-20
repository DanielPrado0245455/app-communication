import React from 'react';

function ParticipantModal(props) {
    const { availableParticipants, onClose, onParticipantSelect } = props;

    const handleCloseModal = (e) => {
        // Verifica si se hizo clic en el fondo oscuro del modal
        if (e.target.classList.contains('modal-overlay')) {
            onClose();
        }
    };

    const handleParticipantSelect = (participant) => {
        onParticipantSelect(participant);
        onClose();
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
