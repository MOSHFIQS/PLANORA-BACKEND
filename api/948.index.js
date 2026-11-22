"use strict";
exports.id = 948;
exports.ids = [948];
exports.modules = {

/***/ 32948:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReplLogger: () => (/* binding */ ReplLogger)
/* harmony export */ });
/* harmony import */ var _nestjs_common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(76332);
/* harmony import */ var _nest_application_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(69287);
/* harmony import */ var _router_router_explorer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(92822);
/* harmony import */ var _router_routes_resolver_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(96999);




class ReplLogger extends _nestjs_common__WEBPACK_IMPORTED_MODULE_0__.ConsoleLogger {
    static ignoredContexts = [
        _router_routes_resolver_js__WEBPACK_IMPORTED_MODULE_3__/* .RoutesResolver */ .Z.name,
        _router_router_explorer_js__WEBPACK_IMPORTED_MODULE_2__/* .RouterExplorer */ .r.name,
        _nest_application_js__WEBPACK_IMPORTED_MODULE_1__/* .NestApplication */ .Z.name,
    ];
    log(_message, context) {
        if (ReplLogger.ignoredContexts.includes(context)) {
            return;
        }
        // eslint-disable-next-line
        return super.log.apply(this, Array.from(arguments));
    }
}


/***/ })

};
;