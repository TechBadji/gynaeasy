"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "./action-async-storage.external?8dda":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "./request-async-storage.external?3d59":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "./static-generation-async-storage.external?16bc":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fm12020%2FDocuments%2Fdev%2FAntigravity%2Fgynaeasy%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fm12020%2FDocuments%2Fdev%2FAntigravity%2Fgynaeasy&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fm12020%2FDocuments%2Fdev%2FAntigravity%2Fgynaeasy%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fm12020%2FDocuments%2Fdev%2FAntigravity%2Fgynaeasy&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_m12020_Documents_dev_Antigravity_gynaeasy_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"/Users/m12020/Documents/dev/Antigravity/gynaeasy/app/api/auth/[...nextauth]/route.ts\",\n    nextConfigOutput,\n    userland: _Users_m12020_Documents_dev_Antigravity_gynaeasy_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRm0xMjAyMCUyRkRvY3VtZW50cyUyRmRldiUyRkFudGlncmF2aXR5JTJGZ3luYWVhc3klMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGbTEyMDIwJTJGRG9jdW1lbnRzJTJGZGV2JTJGQW50aWdyYXZpdHklMkZneW5hZWFzeSZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNvQztBQUNqSDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHVHQUF1RztBQUMvRztBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzZKOztBQUU3SiIsInNvdXJjZXMiOlsid2VicGFjazovL2d5bmFlYXN5Lz9kMTQ4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9tMTIwMjAvRG9jdW1lbnRzL2Rldi9BbnRpZ3Jhdml0eS9neW5hZWFzeS9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvbTEyMDIwL0RvY3VtZW50cy9kZXYvQW50aWdyYXZpdHkvZ3luYWVhc3kvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0IH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCwgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fm12020%2FDocuments%2Fdev%2FAntigravity%2Fgynaeasy%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fm12020%2FDocuments%2Fdev%2FAntigravity%2Fgynaeasy&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n\n\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFpQztBQUNRO0FBRXpDLE1BQU1FLFVBQVVGLGdEQUFRQSxDQUFDQyxrREFBV0E7QUFFTyIsInNvdXJjZXMiOlsid2VicGFjazovL2d5bmFlYXN5Ly4vYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHM/YzhhNCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTmV4dEF1dGggZnJvbSBcIm5leHQtYXV0aFwiO1xuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tIFwiQC9saWIvYXV0aFwiO1xuXG5jb25zdCBoYW5kbGVyID0gTmV4dEF1dGgoYXV0aE9wdGlvbnMpO1xuXG5leHBvcnQgeyBoYW5kbGVyIGFzIEdFVCwgaGFuZGxlciBhcyBQT1NUIH07XG4iXSwibmFtZXMiOlsiTmV4dEF1dGgiLCJhdXRoT3B0aW9ucyIsImhhbmRsZXIiLCJHRVQiLCJQT1NUIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/audit.ts":
/*!**********************!*\
  !*** ./lib/audit.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   logAudit: () => (/* binding */ logAudit)\n/* harmony export */ });\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\nasync function logAudit({ userId, action, patientId, details, ipAddress }) {\n    try {\n        await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.auditLog.create({\n            data: {\n                userId,\n                action,\n                patientId,\n                details: details ? JSON.stringify(details) : null,\n                ipAddress\n            }\n        });\n    } catch (error) {\n        // We log the error but avoid crashing the main execution flow if audit logging fails\n        console.error(\"Failed to write to AuditLog (critical for HDS compliance):\", error);\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXVkaXQudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBc0M7QUFFL0IsZUFBZUMsU0FBUyxFQUMzQkMsTUFBTSxFQUNOQyxNQUFNLEVBQ05DLFNBQVMsRUFDVEMsT0FBTyxFQUNQQyxTQUFTLEVBT1o7SUFDRyxJQUFJO1FBQ0EsTUFBTU4sK0NBQU1BLENBQUNPLFFBQVEsQ0FBQ0MsTUFBTSxDQUFDO1lBQ3pCQyxNQUFNO2dCQUNGUDtnQkFDQUM7Z0JBQ0FDO2dCQUNBQyxTQUFTQSxVQUFVSyxLQUFLQyxTQUFTLENBQUNOLFdBQVc7Z0JBQzdDQztZQUNKO1FBQ0o7SUFDSixFQUFFLE9BQU9NLE9BQU87UUFDWixxRkFBcUY7UUFDckZDLFFBQVFELEtBQUssQ0FBQyw4REFBOERBO0lBQ2hGO0FBQ0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9neW5hZWFzeS8uL2xpYi9hdWRpdC50cz9iM2VlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHByaXNtYSB9IGZyb20gXCJAL2xpYi9wcmlzbWFcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvZ0F1ZGl0KHtcbiAgICB1c2VySWQsXG4gICAgYWN0aW9uLFxuICAgIHBhdGllbnRJZCxcbiAgICBkZXRhaWxzLFxuICAgIGlwQWRkcmVzcyxcbn06IHtcbiAgICB1c2VySWQ6IHN0cmluZztcbiAgICBhY3Rpb246IHN0cmluZztcbiAgICBwYXRpZW50SWQ/OiBzdHJpbmc7XG4gICAgZGV0YWlscz86IGFueTsgLy8gb2JqZWN0IHRoYXQgd2lsbCBiZSBzdHJpbmdpZmllZCBmb3Igc3RydWN0dXJlZCBzdG9yYWdlXG4gICAgaXBBZGRyZXNzPzogc3RyaW5nO1xufSkge1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHByaXNtYS5hdWRpdExvZy5jcmVhdGUoe1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHVzZXJJZCxcbiAgICAgICAgICAgICAgICBhY3Rpb24sXG4gICAgICAgICAgICAgICAgcGF0aWVudElkLFxuICAgICAgICAgICAgICAgIGRldGFpbHM6IGRldGFpbHMgPyBKU09OLnN0cmluZ2lmeShkZXRhaWxzKSA6IG51bGwsXG4gICAgICAgICAgICAgICAgaXBBZGRyZXNzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gV2UgbG9nIHRoZSBlcnJvciBidXQgYXZvaWQgY3Jhc2hpbmcgdGhlIG1haW4gZXhlY3V0aW9uIGZsb3cgaWYgYXVkaXQgbG9nZ2luZyBmYWlsc1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHdyaXRlIHRvIEF1ZGl0TG9nIChjcml0aWNhbCBmb3IgSERTIGNvbXBsaWFuY2UpOlwiLCBlcnJvcik7XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbInByaXNtYSIsImxvZ0F1ZGl0IiwidXNlcklkIiwiYWN0aW9uIiwicGF0aWVudElkIiwiZGV0YWlscyIsImlwQWRkcmVzcyIsImF1ZGl0TG9nIiwiY3JlYXRlIiwiZGF0YSIsIkpTT04iLCJzdHJpbmdpZnkiLCJlcnJvciIsImNvbnNvbGUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/audit.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var otplib__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! otplib */ \"(rsc)/./node_modules/otplib/index.js\");\n/* harmony import */ var otplib__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(otplib__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _lib_audit__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/lib/audit */ \"(rsc)/./lib/audit.ts\");\n\n\n\n\n\nconst authOptions = {\n    session: {\n        strategy: \"jwt\",\n        maxAge: 30 * 24 * 60 * 60\n    },\n    pages: {\n        signIn: \"/auth/login\",\n        error: \"/auth/error\"\n    },\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            name: \"Credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Mot de passe\",\n                    type: \"password\"\n                },\n                twoFactorCode: {\n                    label: \"Code 2FA (si activ\\xe9)\",\n                    type: \"text\"\n                }\n            },\n            async authorize (credentials, req) {\n                if (!credentials?.email || !credentials?.password) {\n                    throw new Error(\"Email et mot de passe requis\");\n                }\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                // Use IP for audit logging\n                const ipAddress = (req?.headers)?.[\"x-forwarded-for\"] || \"unknown\";\n                if (!user || !user.password) {\n                    throw new Error(\"Identifiants incorrects\");\n                }\n                const isPasswordValid = await bcryptjs__WEBPACK_IMPORTED_MODULE_2___default().compare(credentials.password, user.password);\n                if (!isPasswordValid) {\n                    // Log failed login attempt\n                    await (0,_lib_audit__WEBPACK_IMPORTED_MODULE_4__.logAudit)({\n                        userId: user.id,\n                        action: \"CONNEXION_ECHOUEE\",\n                        details: {\n                            reason: \"Mot de passe incorrect\"\n                        },\n                        ipAddress\n                    });\n                    throw new Error(\"Identifiants incorrects\");\n                }\n                if (user.twoFactorEnabled) {\n                    if (!credentials.twoFactorCode) {\n                        throw new Error(\"Code 2FA requis\");\n                    }\n                    const isValidToken = otplib__WEBPACK_IMPORTED_MODULE_3__.authenticator.verify({\n                        token: credentials.twoFactorCode,\n                        secret: user.twoFactorSecret\n                    });\n                    if (!isValidToken) {\n                        await (0,_lib_audit__WEBPACK_IMPORTED_MODULE_4__.logAudit)({\n                            userId: user.id,\n                            action: \"CONNEXION_ECHOUEE_2FA\",\n                            details: {\n                                reason: \"Code 2FA invalide\"\n                            },\n                            ipAddress\n                        });\n                        throw new Error(\"Code 2FA invalide\");\n                    }\n                }\n                // Log successful login\n                await (0,_lib_audit__WEBPACK_IMPORTED_MODULE_4__.logAudit)({\n                    userId: user.id,\n                    action: \"CONNEXION_REUSSIE\",\n                    ipAddress\n                });\n                return {\n                    id: user.id,\n                    email: user.email,\n                    name: user.name,\n                    role: user.role\n                };\n            }\n        })\n    ],\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.role = user.role;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (token && session.user) {\n                session.user.id = token.id;\n                session.user.role = token.role;\n            }\n            return session;\n        }\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFJQSxTQUFTaEMsUUFBUWlCLElBQUksRUFBRTtnQkFDdEJqQixRQUFRaUIsSUFBSSxDQUFTUSxFQUFFLEdBQUdPLE1BQU1QLEVBQUU7Z0JBQ2xDekIsUUFBUWlCLElBQUksQ0FBU2tCLElBQUksR0FBR0gsTUFBTUcsSUFBSTtZQUMzQztZQUNBLE9BQU9uQztRQUNYO0lBQ0o7QUFDSixFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3luYWVhc3kvLi9saWIvYXV0aC50cz9iZjdlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRBdXRoT3B0aW9ucyB9IGZyb20gXCJuZXh0LWF1dGhcIjtcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gXCJuZXh0LWF1dGgvcHJvdmlkZXJzL2NyZWRlbnRpYWxzXCI7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tIFwiQC9saWIvcHJpc21hXCI7XG5pbXBvcnQgYmNyeXB0IGZyb20gXCJiY3J5cHRqc1wiO1xuaW1wb3J0IHsgYXV0aGVudGljYXRvciB9IGZyb20gXCJvdHBsaWJcIjtcbmltcG9ydCB7IGxvZ0F1ZGl0IH0gZnJvbSBcIkAvbGliL2F1ZGl0XCI7XG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogTmV4dEF1dGhPcHRpb25zID0ge1xuICAgIHNlc3Npb246IHtcbiAgICAgICAgc3RyYXRlZ3k6IFwiand0XCIsXG4gICAgICAgIG1heEFnZTogMzAgKiAyNCAqIDYwICogNjAsIC8vIDMwIGRheXNcbiAgICB9LFxuICAgIHBhZ2VzOiB7XG4gICAgICAgIHNpZ25JbjogXCIvYXV0aC9sb2dpblwiLFxuICAgICAgICBlcnJvcjogXCIvYXV0aC9lcnJvclwiLFxuICAgIH0sXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIENyZWRlbnRpYWxzUHJvdmlkZXIoe1xuICAgICAgICAgICAgbmFtZTogXCJDcmVkZW50aWFsc1wiLFxuICAgICAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAgICAgICBlbWFpbDogeyBsYWJlbDogXCJFbWFpbFwiLCB0eXBlOiBcImVtYWlsXCIgfSxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogXCJNb3QgZGUgcGFzc2VcIiwgdHlwZTogXCJwYXNzd29yZFwiIH0sXG4gICAgICAgICAgICAgICAgdHdvRmFjdG9yQ29kZTogeyBsYWJlbDogXCJDb2RlIDJGQSAoc2kgYWN0aXbDqSlcIiwgdHlwZTogXCJ0ZXh0XCIgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhc3luYyBhdXRob3JpemUoY3JlZGVudGlhbHMsIHJlcSkge1xuICAgICAgICAgICAgICAgIGlmICghY3JlZGVudGlhbHM/LmVtYWlsIHx8ICFjcmVkZW50aWFscz8ucGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW1haWwgZXQgbW90IGRlIHBhc3NlIHJlcXVpc1wiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICAgICAgICAgICAgICAgIHdoZXJlOiB7IGVtYWlsOiBjcmVkZW50aWFscy5lbWFpbCB9LFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gVXNlIElQIGZvciBhdWRpdCBsb2dnaW5nXG4gICAgICAgICAgICAgICAgY29uc3QgaXBBZGRyZXNzID0gKHJlcT8uaGVhZGVycyBhcyBhbnkpPy5bXCJ4LWZvcndhcmRlZC1mb3JcIl0gYXMgc3RyaW5nIHx8IFwidW5rbm93blwiO1xuXG4gICAgICAgICAgICAgICAgaWYgKCF1c2VyIHx8ICF1c2VyLnBhc3N3b3JkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIklkZW50aWZpYW50cyBpbmNvcnJlY3RzXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGlzUGFzc3dvcmRWYWxpZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKFxuICAgICAgICAgICAgICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICAgICAgdXNlci5wYXNzd29yZFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWlzUGFzc3dvcmRWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBMb2cgZmFpbGVkIGxvZ2luIGF0dGVtcHRcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgbG9nQXVkaXQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkOiB1c2VyLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcIkNPTk5FWElPTl9FQ0hPVUVFXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiB7IHJlYXNvbjogXCJNb3QgZGUgcGFzc2UgaW5jb3JyZWN0XCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlwQWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIklkZW50aWZpYW50cyBpbmNvcnJlY3RzXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh1c2VyLnR3b0ZhY3RvckVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjcmVkZW50aWFscy50d29GYWN0b3JDb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb2RlIDJGQSByZXF1aXNcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpc1ZhbGlkVG9rZW4gPSBhdXRoZW50aWNhdG9yLnZlcmlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjogY3JlZGVudGlhbHMudHdvRmFjdG9yQ29kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY3JldDogdXNlci50d29GYWN0b3JTZWNyZXQhLFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWRUb2tlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbG9nQXVkaXQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZDogdXNlci5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwiQ09OTkVYSU9OX0VDSE9VRUVfMkZBXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogeyByZWFzb246IFwiQ29kZSAyRkEgaW52YWxpZGVcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlwQWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29kZSAyRkEgaW52YWxpZGVcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBMb2cgc3VjY2Vzc2Z1bCBsb2dpblxuICAgICAgICAgICAgICAgIGF3YWl0IGxvZ0F1ZGl0KHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcklkOiB1c2VyLmlkLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwiQ09OTkVYSU9OX1JFVVNTSUVcIixcbiAgICAgICAgICAgICAgICAgICAgaXBBZGRyZXNzLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHVzZXIuaWQsXG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHJvbGU6IHVzZXIucm9sZSwgLy8gQ3VzdG9tIHJvbGUgYWRkZWQgdG8gSldUXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgIF0sXG4gICAgY2FsbGJhY2tzOiB7XG4gICAgICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyIH0pIHtcbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgdG9rZW4uaWQgPSB1c2VyLmlkO1xuICAgICAgICAgICAgICAgIHRva2VuLnJvbGUgPSAodXNlciBhcyBhbnkpLnJvbGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9KSB7XG4gICAgICAgICAgICBpZiAodG9rZW4gJiYgc2Vzc2lvbi51c2VyKSB7XG4gICAgICAgICAgICAgICAgKHNlc3Npb24udXNlciBhcyBhbnkpLmlkID0gdG9rZW4uaWQgYXMgc3RyaW5nO1xuICAgICAgICAgICAgICAgIChzZXNzaW9uLnVzZXIgYXMgYW55KS5yb2xlID0gdG9rZW4ucm9sZSBhcyBzdHJpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICAgICAgfSxcbiAgICB9LFxufTtcbiJdLCJuYW1lcyI6WyJDcmVkZW50aWFsc1Byb3ZpZGVyIiwicHJpc21hIiwiYmNyeXB0IiwiYXV0aGVudGljYXRvciIsImxvZ0F1ZGl0IiwiYXV0aE9wdGlvbnMiLCJzZXNzaW9uIiwic3RyYXRlZ3kiLCJtYXhBZ2UiLCJwYWdlcyIsInNpZ25JbiIsImVycm9yIiwicHJvdmlkZXJzIiwibmFtZSIsImNyZWRlbnRpYWxzIiwiZW1haWwiLCJsYWJlbCIsInR5cGUiLCJwYXNzd29yZCIsInR3b0ZhY3RvckNvZGUiLCJhdXRob3JpemUiLCJyZXEiLCJFcnJvciIsInVzZXIiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJpcEFkZHJlc3MiLCJoZWFkZXJzIiwiaXNQYXNzd29yZFZhbGlkIiwiY29tcGFyZSIsInVzZXJJZCIsImlkIiwiYWN0aW9uIiwiZGV0YWlscyIsInJlYXNvbiIsInR3b0ZhY3RvckVuYWJsZWQiLCJpc1ZhbGlkVG9rZW4iLCJ2ZXJpZnkiLCJ0b2tlbiIsInNlY3JldCIsInR3b0ZhY3RvclNlY3JldCIsInJvbGUiLCJjYWxsYmFja3MiLCJqd3QiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE4QztBQUU5QyxNQUFNQyxrQkFBa0JDO0FBRWpCLE1BQU1DLFNBQVNGLGdCQUFnQkUsTUFBTSxJQUFJLElBQUlILHdEQUFZQSxHQUFHO0FBRW5FLElBQUlJLElBQXFDLEVBQUVILGdCQUFnQkUsTUFBTSxHQUFHQSIsInNvdXJjZXMiOlsid2VicGFjazovL2d5bmFlYXN5Ly4vbGliL3ByaXNtYS50cz85ODIyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gXCJAcHJpc21hL2NsaWVudFwiO1xuXG5jb25zdCBnbG9iYWxGb3JQcmlzbWEgPSBnbG9iYWxUaGlzIGFzIHVua25vd24gYXMgeyBwcmlzbWE6IFByaXNtYUNsaWVudCB9O1xuXG5leHBvcnQgY29uc3QgcHJpc21hID0gZ2xvYmFsRm9yUHJpc21hLnByaXNtYSB8fCBuZXcgUHJpc21hQ2xpZW50KCk7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPSBwcmlzbWE7XG4iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiZ2xvYmFsRm9yUHJpc21hIiwiZ2xvYmFsVGhpcyIsInByaXNtYSIsInByb2Nlc3MiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/bcryptjs","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/@otplib","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/preact-render-to-string","vendor-chunks/uuid","vendor-chunks/cookie","vendor-chunks/thirty-two","vendor-chunks/oidc-token-hash","vendor-chunks/@panva","vendor-chunks/otplib"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fm12020%2FDocuments%2Fdev%2FAntigravity%2Fgynaeasy%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fm12020%2FDocuments%2Fdev%2FAntigravity%2Fgynaeasy&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();