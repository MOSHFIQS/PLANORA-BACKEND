"use strict";
exports.id = 735;
exports.ids = [735];
exports.modules = {

/***/ 71735:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   assignToObject: () => (/* binding */ assignToObject)
/* harmony export */ });
/**
 * Similar to `Object.assign` but copying properties descriptors from `source`
 * as well.
 */
function assignToObject(target, source) {
    Object.defineProperties(target, Object.keys(source).reduce((descriptors, key) => {
        descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
        return descriptors;
    }, Object.create(null)));
    return target;
}


/***/ })

};
;