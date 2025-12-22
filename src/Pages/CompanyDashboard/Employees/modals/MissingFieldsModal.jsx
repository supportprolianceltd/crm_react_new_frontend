import Modal from "../../../../components/Modal";

const MissingFieldsModal = ({ isOpen, onClose, missingFields }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Missing Required Fields"
      message="Please complete the following fields before continuing:"
    >
      <div style={{ marginTop: "1rem" }}>
        <ul
          style={{
            listStyleType: "disc",
            paddingLeft: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {missingFields.map((field, index) => (
            <li key={index} style={{ marginBottom: "0.5rem" }}>
              {field}
            </li>
          ))}
        </ul>
      </div>

      <div className="modal-footer">
        <button className="modal-button modal-button-confirm" onClick={onClose}>
          OK
        </button>
      </div>
    </Modal>
  );
};

export default MissingFieldsModal;
