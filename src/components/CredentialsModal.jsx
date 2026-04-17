import Button from "./Button";
import Modal from "./Modal";
import "../styles/components/CredentialsModal.scss";

const CredentialsModal = ({ isOpen, onClose, credentials, studentId }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${credentials?.username}'s Details`}>
      <div className="credentials-modal">
        <div className="credentials-modal__row">
          <span className="credentials-modal__label">Student ID</span>
          <span className="credentials-modal__value">{studentId || "—"}</span>
        </div>
        <div className="credentials-modal__row">
          <span className="credentials-modal__label">Username</span>
          <span className="credentials-modal__value">{credentials?.username || "—"}</span>
        </div>
        <div className="credentials-modal__actions">
          <Button onClick={onClose}>OK</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CredentialsModal;

