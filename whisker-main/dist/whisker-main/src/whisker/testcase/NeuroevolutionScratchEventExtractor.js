"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeuroevolutionScratchEventExtractor = void 0;
const KeyPressEvent_1 = require("./events/KeyPressEvent");
const Container_1 = require("../utils/Container");
const MouseMoveToEvent_1 = require("./events/MouseMoveToEvent");
const ClickSpriteEvent_1 = require("./events/ClickSpriteEvent");
const ClickStageEvent_1 = require("./events/ClickStageEvent");
const SoundEvent_1 = require("./events/SoundEvent");
const DynamicScratchEventExtractor_1 = require("./DynamicScratchEventExtractor");
const MouseDownForStepsEvent_1 = require("./events/MouseDownForStepsEvent");
const TypeNumberEvent_1 = require("./events/TypeNumberEvent");
const Arrays_1 = __importDefault(require("../utils/Arrays"));
const ScratchInterface_1 = require("../scratch/ScratchInterface");
const WaitEvent_1 = require("./events/WaitEvent");
const MouseMoveDimensionEvent_1 = require("./events/MouseMoveDimensionEvent");
class NeuroevolutionScratchEventExtractor extends DynamicScratchEventExtractor_1.DynamicScratchEventExtractor {
    /**
     * Constructs a new NeuroevolutionScratchEventExtractor.
     * @param vm The Scratch VM from which events will be extracted.
     * @param _classificationType The classification type of the network.
     */
    constructor(vm, _classificationType) {
        super(vm);
        this._classificationType = _classificationType;
        /**
         * Whether events should be extracted statically, ignoring if a sprite is invisible or not.
         */
        this._staticMode = false;
    }
    extractEvents(vm) {
        const events = super.extractEvents(vm);
        if (this._classificationType === 'multiLabel') {
            return events.filter(event => !(event instanceof WaitEvent_1.WaitEvent));
        }
        return events;
    }
    /**
     * Used for extracting events when loading a network from a saved json file. We exclude DragSpriteEvents in
     * Neuroevolution algorithms.
     * @param vm the state of the Scratch-Project from which events will be extracted.
     */
    extractStaticEvents(vm) {
        this._staticMode = true;
        const eventList = [];
        // Get all hat blocks and set up the procedureMap which maps the name of a procedure to the encountered events
        // of the procedure definition script.
        for (const target of vm.runtime.targets) {
            for (const scriptId of target.sprite.blocks.getScripts()) {
                const hatBlock = target.blocks.getBlock(scriptId);
                eventList.push(...this._extractEventsFromBlock(target, target.blocks.getBlock(scriptId)));
                this.traverseBlocks(target, hatBlock, eventList);
            }
        }
        const equalityFunction = (a, b) => a.stringIdentifier() === b.stringIdentifier();
        this._staticMode = false;
        if (this._classificationType === 'multiClass') {
            eventList.push(new WaitEvent_1.WaitEvent());
        }
        return Arrays_1.default.distinctByComparator(eventList, equalityFunction);
    }
    /**
     * Extracts input events from Scratch-Blocks. Neuroevolution does not include DragSpriteEvents since these
     * events violate the intended gameplay. By not using DragSpriteEvents, we can omit costly colorDistance
     * calculations.
     * @param target the target whose block is analysed.
     * @param block the block which will be analysed for potential input events.
     * @returns a list of extracted scratch events.
     */
    _extractEventsFromBlock(target, block) {
        const eventList = [];
        if (typeof block.opcode === 'undefined') {
            return eventList;
        }
        switch (target.blocks.getOpcode(block)) {
            case 'event_whenkeypressed': { // Key press in HatBlocks
                const fields = target.blocks.getFields(block);
                eventList.push(new KeyPressEvent_1.KeyPressEvent(fields.KEY_OPTION.value));
                // one event per concrete key for which there is a hat block
                break;
            }
            case 'sensing_keypressed': { // Key press in SensingBlocks
                const keyOptionsBlock = target.blocks.getBlock(block.inputs.KEY_OPTION.block);
                const fields = target.blocks.getFields(keyOptionsBlock);
                if ("KEY_OPTION" in fields) {
                    eventList.push(new KeyPressEvent_1.KeyPressEvent(fields.KEY_OPTION.value));
                }
                else {
                    // TODO: The key is dynamically computed
                }
                break;
            }
            case 'sensing_mousex':
            case 'sensing_mousey':
            case 'pen_penDown': {
                this._addMouseMoveEvents(eventList);
                break;
            }
            case 'motion_goto': {
                // GoTo MousePointer block
                const goToMenu = target.blocks.getBlock(block.inputs.TO.block);
                if (goToMenu.fields.TO && goToMenu.fields.TO.value === '_mouse_') {
                    this._addMouseMoveEvents(eventList);
                }
                break;
            }
            case 'sensing_touchingobject': {
                const touchingMenuBlock = target.blocks.getBlock(block.inputs.TOUCHINGOBJECTMENU.block);
                const field = target.blocks.getFields(touchingMenuBlock);
                const value = field.VARIABLE ? field.Variable.value : field.TOUCHINGOBJECTMENU.value;
                // Target senses Mouse
                if (value == "_mouse_" && target.visible) {
                    // Only add a MouseMoveTo event if the mouse is currently not located at the targeted position.
                    const currentMousePosition = ScratchInterface_1.ScratchInterface.getMousePositionClient();
                    if (!target.isTouchingPoint(currentMousePosition.x, currentMousePosition.y)) {
                        eventList.push(new MouseMoveToEvent_1.MouseMoveToEvent(target.x, target.y, target.sprite.name));
                    }
                    this._addMouseMoveEvents(eventList);
                }
                break;
            }
            case 'sensing_distanceto': {
                const distanceMenuBlock = target.blocks.getBlock(block.inputs.DISTANCETOMENU.block);
                const field = target.blocks.getFields(distanceMenuBlock);
                if (field['DISTANCETOMENU'] && field['DISTANCETOMENU'].value == "_mouse_") {
                    this._addMouseMoveEvents(eventList);
                }
                break;
            }
            case 'motion_pointtowards': {
                const towards = target.blocks.getBlock(block.inputs.TOWARDS.block);
                if (towards.fields.TOWARDS && towards.fields.TOWARDS.value === '_mouse_')
                    this._addMouseMoveEvents(eventList);
                break;
            }
            case 'sensing_mousedown': {
                // Mouse down
                const isMouseDown = Container_1.Container.testDriver.isMouseDown();
                // Only add the event if the mouse is currently not pressed
                if (!isMouseDown) {
                    eventList.push(new MouseDownForStepsEvent_1.MouseDownForStepsEvent());
                }
                break;
            }
            case 'sensing_askandwait':
                // Type text
                if (this._staticMode || Container_1.Container.vmWrapper.isQuestionAsked()) {
                    if (this.potentiallyComparesNumbers) {
                        eventList.push(new TypeNumberEvent_1.TypeNumberEvent());
                    }
                    eventList.push(...this._getTypeTextEvents());
                }
                break;
            case 'event_whenthisspriteclicked':
                // Click sprite
                if ((target.visible || this._staticMode) && target.isOriginal) {
                    eventList.push(new ClickSpriteEvent_1.ClickSpriteEvent(target));
                }
                // Do not allow too many clones to avoid an explosion of output nodes.
                else if (this._staticMode || target.visible) {
                    const spriteName = target.sprite.name;
                    if (!this.currentClickClones.has(spriteName) ||
                        this.currentClickClones.get(spriteName) < NeuroevolutionScratchEventExtractor.CLONE_THRESHOLD) {
                        if (!this.currentClickClones.has(spriteName)) {
                            this.currentClickClones.set(spriteName, 0);
                        }
                        this.currentClickClones.set(spriteName, this.currentClickClones.get(spriteName) + 1);
                        const steps = Container_1.Container.config.getClickDuration();
                        const cloneNumber = this.currentClickClones.get(spriteName);
                        eventList.push(new ClickSpriteEvent_1.ClickSpriteEvent(target, steps, cloneNumber));
                    }
                }
                break;
            case 'event_whenstageclicked':
                // Click stage
                eventList.push(new ClickStageEvent_1.ClickStageEvent());
                break;
            case 'event_whengreaterthan': {
                if (block.fields.WHENGREATERTHANMENU.value === 'LOUDNESS') {
                    // Fetch the sound value for the sound block. We add 1 since the block tests using greater than.
                    const soundParameterBlock = target.blocks.getBlock(block.inputs.VALUE.block);
                    const soundValue = Number.parseFloat(soundParameterBlock.fields.NUM.value) + 1;
                    eventList.push(new SoundEvent_1.SoundEvent(soundValue));
                }
                break;
            }
            case 'sensing_loudness': {
                try {
                    const operatorBlock = target.blocks.getBlock(block.parent);
                    // Find out on which side of the operator the value which is compared against the volume is placed.
                    let compareValueOperatorBlock;
                    let compareValueIsFirstOperand;
                    if (operatorBlock.inputs.OPERAND1.block !== block.id) {
                        compareValueOperatorBlock = target.blocks.getBlock(operatorBlock.inputs.OPERAND1.block);
                        compareValueIsFirstOperand = true;
                    }
                    else {
                        compareValueOperatorBlock = target.blocks.getBlock(operatorBlock.inputs.OPERAND2.block);
                        compareValueIsFirstOperand = false;
                    }
                    // Now that we know where to find the value which is compared against the current volume value, we
                    // can set the volume appropriately.
                    let volumeValue = Number.parseFloat(compareValueOperatorBlock.fields.TEXT.value);
                    // Greater than
                    if (operatorBlock.opcode === 'operator_gt') {
                        compareValueIsFirstOperand ? volumeValue -= 1 : volumeValue += 1;
                    }
                    // Lower than
                    else if (operatorBlock.opcode === 'operator_lt') {
                        compareValueIsFirstOperand ? volumeValue += 1 : volumeValue -= 1;
                    }
                    eventList.push(new SoundEvent_1.SoundEvent(volumeValue));
                }
                // If we cannot infer the correct volume, simply set the volume to the highest possible value.
                catch (e) {
                    eventList.push(new SoundEvent_1.SoundEvent(100));
                }
            }
        }
        return eventList;
    }
    /**
     * Neuroevolution controllers move the mouse continuously in the x and y direction.
     * Therefore, we refrain from using {@link MouseMoveEvent}s and instead apply {@link MouseMoveDimensionEvent}s.
     * @param eventList to which the {@link MouseMoveDimensionEvent}s are added.
     */
    _addMouseMoveEvents(eventList) {
        eventList.push(new MouseMoveDimensionEvent_1.MouseMoveDimensionEvent("X"));
        eventList.push(new MouseMoveDimensionEvent_1.MouseMoveDimensionEvent("Y"));
    }
}
exports.NeuroevolutionScratchEventExtractor = NeuroevolutionScratchEventExtractor;
NeuroevolutionScratchEventExtractor.CLONE_THRESHOLD = 1;
