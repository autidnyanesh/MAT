// Central place for env-driven feature flags shared across pages, so
// mock/real backend switching is consistent instead of being decided
// ad hoc inside each component.
//
// REACT_APP_USE_MOCK_LOGIN   -> gates the login screen (see pages/Login.js)
// REACT_APP_USE_MOCK_DATA    -> gates business-data screens (refund search,
//                               TID validation, request submission, etc.)
// These are separate flags on purpose: you may want to point the login
// screen at the real backend before every business endpoint is ready,
// or vice versa.

export const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA !== "false";