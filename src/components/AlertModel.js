import React from "react";

function AlertModal({
    show,
    title,
    message,
    type = "success",
    onClose
}) {

    if (!show) return null;

    return (
        <div
            className="modal show d-block"
            style={{
                backgroundColor: "rgba(0,0,0,0.4)"
            }}
        >
            <div className="modal-dialog modal-dialog-centered">

                <div className="modal-content border-0 shadow">

                    <div className="modal-header">

                        <h5 className="modal-title">

                            {type === "success" && "✅ Success"}

                            {type === "error" && "❌ Error"}

                            {type === "warning" && "⚠ Warning"}

                            {type === "info" && "ℹ Information"}

                        </h5>

                    </div>

                    <div className="modal-body text-center">

                        <h6>{title}</h6>

                        <p className="mb-0 text-muted">
                            {message}
                        </p>

                    </div>

                    <div className="modal-footer justify-content-center">

                        <button
                            className="btn btn-primary px-4"
                            onClick={onClose}
                        >
                            OK
                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default AlertModal;