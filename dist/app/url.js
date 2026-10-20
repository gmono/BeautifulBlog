"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripBaseUrl = stripBaseUrl;
function stripBaseUrl(requestPath, baseUrl) {
    const base = baseUrl === "/" ? "" : `/${baseUrl.split("/").filter(Boolean).join("/")}`;
    if (base === "")
        return requestPath.startsWith("/") ? requestPath : `/${requestPath}`;
    if (requestPath === base || requestPath === `${base}/`)
        return "/";
    if (!requestPath.startsWith(`${base}/`))
        return null;
    return requestPath.slice(base.length);
}
//# sourceMappingURL=url.js.map