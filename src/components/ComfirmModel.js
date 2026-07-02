import React from "react";

function ConfirmModal({
    show,
    title = "Confirmation",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger",
    onConfirm,
    onClose
}) {

    if (!show) return null;

    const buttonClass = {
        danger: "btn-danger",
        warning: "btn-warning",
        success: "btn-success",
        primary: "btn-primary"
    };

    return (
        <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
                backgroundColor: "rgba(0,0,0,0.5)"
            }}
        >
            <div className="modal-dialog modal-dialog-centered">

                <div className="modal-content border-0 shadow">

                    <div className="modal-header">

                        <h5 className="modal-title">
                            {title}
                        </h5>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        />

                    </div>

                    <div className="modal-body text-center">

                        <div
                            style={{
                                fontSize: "40px"
                            }}
                        >
                            ⚠️
                        </div>

                        <p className="mb-0">
                            {message}
                        </p>

                    </div>

                    <div className="modal-footer justify-content-center">

                        <button
                            type="button"
                            className={`btn ${buttonClass[type] || "btn-danger"}`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default ConfirmModal;