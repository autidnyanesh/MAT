import React from "react";
import "../../styles/tableAlign.css";

const DetailItem = ({ label, value }) => (
    <div className="col-lg-4 col-md-6">
        <div
            className="border rounded-3 p-2 h-100"
            style={{
                background: "#fff",
                borderColor: "#e8edf3"
            }}
        >
            <small
                className="text-uppercase text-muted d-block mb-1"
                style={{
                    fontSize: "11px",
                    letterSpacing: ".5px"
                }}
            >
                {label}
            </small>

            <div
                className="fw-semibold"
                style={{
                    color: "#2c3e50",
                    wordBreak: "break-word"
                }}
            >
                {value || "—"}
            </div>
        </div>
    </div>
);

const RequestDetailsModal = ({
    show,
    request,
    onClose,
    fields,
    title = "Request Details",
    firstDateLabel = "Raised Date",
    firstDateValue
}) => {

    if (!show || !request) return null;

    return (
        <div
            className="modal show d-block"
            style={{ background: "rgba(0,0,0,.45)" }}
        >
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

                <div
                    className="modal-content border-0 shadow-lg"
                    style={{ borderRadius: "8px" }}
                >

                    {/* Header */}

                    <div
                        className="modal-header px-4 py-2"
                        style={{
                            background: "#ebf4fc",
                            borderBottom: "1px solid #d9e8f7"
                        }}
                    >
                        <div>
                            <h6 className="mb-1 fw-semibold">
                                {title}
                            </h6>
                        </div>

                        <button
                            className="btn-close"
                            onClick={onClose}
                        />
                    </div>
                    {/* Body */}

                    <div className="modal-body">

                        <div
                            className="row g-1 mb-2 mt-1 p-2 rounded"
                            style={{
                                background: "#f8fbff",
                                border: "1px solid #d9e8f7"
                            }}
                        >

                            <div className="col-md-6">

                                <label className="text-muted small d-block">
                                    Request ID
                                </label>

                                <div className="fw-semibold fs-6 text-primary">
                                    {request.requestId}
                                </div>

                            </div>

                            <div className="col-md-6">

                                <label className="text-muted small d-block">
                                    {firstDateLabel}
                                </label>

                                <div className="fw-semibold">
                                    {firstDateValue}
                                </div>

                            </div>

                        </div>

                        <h6 className="fw-semibold text-primary mb-3">
                            Request Information
                        </h6>

                        <div className="row g-3">

                            {fields.map((field) => (

                                <DetailItem
                                    key={field.label}
                                    label={field.label}
                                    value={field.value}
                                />

                            ))}

                        </div>

                    </div>

                    <div className="modal-footer py-2 ">

                        <button
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Close
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default RequestDetailsModal;