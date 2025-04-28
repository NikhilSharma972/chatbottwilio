import { ProviderClass } from '@builderbot/bot';
import type { BotContext, SendOptions } from '@builderbot/bot/dist/types';
import type { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';
import { TwilioCoreVendor } from './core';
import type { TwilioInterface } from '../interface/twilio';
import type { ITwilioProviderARgs, TwilioRequestBody } from '../types';
/**
 * A class representing a TwilioProvider for interacting with Twilio messaging service.
 * @extends ProviderClass
 * @implements {TwilioInterface}
 */
declare class TwilioProvider extends ProviderClass<TwilioCoreVendor> implements TwilioInterface {
    globalVendorArgs: ITwilioProviderARgs;
    constructor(args: ITwilioProviderARgs);
    /**
     * Initialize the vendor for TwilioProvider.
     * @returns {Promise<any>} A Promise that resolves when vendor is initialized.
     * @protected
     */
    protected initVendor(): Promise<any>;
    protected beforeHttpServerInit(): void;
    protected afterHttpServerInit(): void;
    /**
     * Event handlers for bus events.
     */
    busEvents: () => {
        event: string;
        func: (payload: any) => void;
    }[];
    /**
     * Sends media content via Twilio.
     * @param {string} number - The recipient's phone number.
     * @param {string} [message=''] - The message to be sent.
     * @param {string} mediaInput - The media input to be sent.
     * @returns {Promise<any>} A Promise that resolves when the media is sent.
     */
    sendMedia: (number: string, message: string, mediaInput: string) => Promise<any>;
    /**
     * Sends buttons via Twilio.
     * @returns {Promise<void>} A Promise that resolves when buttons are sent.
     */
    sendButtons: () => Promise<void>;
    /**
     *
     * @param number
     * @param message
     * @returns
     */
    send: (number: string, message: string, options?: MessageListInstanceCreateOptions) => Promise<any>;
    /**
     * Sends a message via Twilio.
     * @param {string} number - The recipient's phone number.
     * @param {string} message - The message to be sent.
     * @param {SendOptions} [options] - The options for sending the message.
     * @returns {Promise<any>} A Promise that resolves when the message is sent.
     */
    sendMessage: (number: string, message: string, options?: SendOptions) => Promise<any>;
    /**
     * Saves a file received via Twilio.
     * @param {Partial<TwilioRequestBody & BotContext>} ctx - The context containing the received file.
     * @param {{ path: string }} [options] - The options for saving the file.
     * @returns {Promise<string>} A Promise that resolves with the saved file path.
     */
    saveFile: (ctx: Partial<TwilioRequestBody & BotContext>, options?: {
        path: string;
    }) => Promise<string>;
}
export { TwilioProvider };
//# sourceMappingURL=provider.d.ts.map