"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldKeys = exports.broadcastInputToField = exports.broadcastToField = exports.listToField = exports.variableToField = exports.isField1 = void 0;
function isField1(field) {
    return (field.length === 1 && typeof field[0] === "string" ||
        field.length === 2 && typeof field[0] === "string" && field[1] === null);
}
exports.isField1 = isField1;
function variableToField([variableID, [variableName]]) {
    return [variableName, variableID];
}
exports.variableToField = variableToField;
function listToField([listID, [listName]]) {
    return [listName, listID];
}
exports.listToField = listToField;
function broadcastToField([broadcastID, broadcastName]) {
    return [broadcastName, broadcastID];
}
exports.broadcastToField = broadcastToField;
function broadcastInputToField([, broadcastName, broadcastID]) {
    return [broadcastName, broadcastID];
}
exports.broadcastInputToField = broadcastInputToField;
// Rectangular drop-down menus
const noShadowFieldKeys = Object.freeze([
    "STYLE",
    "EFFECT",
    "FRONT_BACK",
    "FORWARD_BACKWARD",
    "NUMBER_NAME",
    "WHENGREATERTHANMENU",
    "BROADCAST_OPTION",
    "STOP_OPTION",
    "DRAG_MODE",
    "PROPERTY",
    "CURRENTMENU",
    "OPERATOR",
    "VARIABLE",
    "LIST",
]);
// Oval-shaped drop-down menus
const shadowFieldKeys = Object.freeze([
    "TO",
    "TOWARDS",
    "COSTUME",
    "SOUND_MENU",
    "CLONE_OPTION",
    "TOUCHINGOBJECTMENU",
    "DISTANCETOMENU",
    "OBJECT",
    "VALUE",
    "colorParam",
]);
exports.fieldKeys = Object.freeze([
    ...noShadowFieldKeys,
    ...shadowFieldKeys,
    // These keys can occur in both a rectangular or oval-shaped drop-down menu:
    "KEY_OPTION",
    "BACKDROP",
]);
