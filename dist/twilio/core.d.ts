import EventEmitter from 'node:events';
import type polka from 'polka';
import twilio from 'twilio';

import type { ITwilioProviderARgs } from '../types';
/**
 * Class representing TwilioCoreVendor, a vendor class for meta core functionality.
 * @extends EventEmitter
 */
export declare class TwilioCoreVendor extends EventEmitter {
    twilio: twilio.Twilio;
    constructor(globalVendorArgs: ITwilioProviderARgs);
    /**
     * Middleware function for indexing home.
     * @type {polka.Middleware}
     */
    indexHome: polka.Middleware;
    /**
     * Middleware function for handling incoming messages.
     * @type {polka.Middleware}
     */
    incomingMsg: polka.Middleware;
    /**
     * Manejar los local media como
     * C:\\Projects\\bot-restaurante\\tmp\\menu.png
     * para que puedas ser llevar a una url online
     * @param req
     * @param res
     */
    handlerLocalMedia: polka.Middleware;
}
//# sourceMappingURL=core.d.ts.map