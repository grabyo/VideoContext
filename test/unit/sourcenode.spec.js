import * as utils from "../../src/utils";
import SourceNode from "../../src/SourceNodes/sourcenode";
import sinon from "sinon";
import "webgl-mock";

global.window = {}; // eslint-disable-line

let mockGLContext;

const PAUSED_STATE = 3;
const ENDED_STATE = 4;
const ELEMENT = { mock: "videoElement" };
const mockRenderGraph = {};

beforeEach(() => {
    const canvas = new HTMLCanvasElement(500, 500);
    mockGLContext = canvas.getContext("webgl");
});

describe("_update", () => {
    test("updatesTexture if currentTime is changed and ctx is PAUSED and node is ready", () => {
        const updateTextureSpy = sinon.spy(utils, "updateTexture");
        const currentTime = 0;
        const node = new SourceNode(ELEMENT, mockGLContext, mockRenderGraph, currentTime);

        node.startAt(currentTime);

        // force into paused state
        node._state = PAUSED_STATE;
        expect(node.state).toEqual(PAUSED_STATE);

        // force to be ready
        node._ready = true;

        // Expect updateTexture to not be called at this point
        expect(updateTextureSpy.calledOnce).toBeFalsy();

        // force an update
        node._update(currentTime + 1);

        // Expect updateTexture to be called after update
        expect(updateTextureSpy.calledOnce).toBeTruthy();
    });

    test("at the end of the playblack, it should first update _state=ENDED and then call clearTexture()", () => {
        const clearTextureSpy = sinon.spy(utils, "clearTexture");
        const currentTime = 3;
        const node = new SourceNode(ELEMENT, mockGLContext, mockRenderGraph, currentTime);
        node.startAt(0);
        node.stopAt(2);
        
        // force an update
        node._update(currentTime);

        // Expect node to have an ended state
        expect(node.state).toEqual(ENDED_STATE);
        // Expect clearTexture to not be called at this point
        expect(clearTextureSpy.calledOnce).toBeFalsy();

        node._update(currentTime + 0.2);
        // Expect updateTexture to be called after 2nd update
        expect(clearTextureSpy.calledOnce).toBeTruthy();
    });
});
