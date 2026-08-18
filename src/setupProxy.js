const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * Same-origin /api → backend :8081 so HttpOnly refresh cookie works on F5.
 * Requires restart of `npm start` after changes.
 */
module.exports = function setupProxy(app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8081",
      changeOrigin: true,
      logLevel: "warn",
    })
  );
};
