import './styles/RequestModal.scss';



function RequestModal(props) {

    const handleCloseModal = (e) => {
        if (e.target.classList.contains('RequestModal')) {
            props.onClose();
        }
    };
    return (
        <div className="RequestModal" onClick={handleCloseModal}>
            <div className="modal">
                <p className="title">Solicitudes pendientes</p>
                <div className="list">
                    {props.requests.map((request, index) => (
                        <div className="request" key={index}>
                            <p className="user">{request}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default RequestModal