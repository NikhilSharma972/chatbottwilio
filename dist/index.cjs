'use strict';

var bot = require('@builderbot/bot');
var os = require('os');
var path = require('path');
var EventEmitter = require('node:events');
var twilio = require('twilio');

const parseNumber = (number) => {
    return number.replace(/(?:whatsapp:|\+\d+)/, '').replace(/\s/g, '');
};
const parseNumberFrom = (number) => {
    const cleanNumber = number.replace(/whatsapp|:|\+/g, '').replace(/\s/g, '');
    return `whatsapp:+${cleanNumber}`;
};

/**
 * Class representing TwilioCoreVendor, a vendor class for meta core functionality.
 * @extends EventEmitter
 */
class TwilioCoreVendor extends EventEmitter {
    constructor(globalVendorArgs) {
        super();
        /**
         * Middleware function for indexing home.
         * @type {polka.Middleware}
         */
        this.indexHome = (_, res) => {
            res.end('running ok');
        };
        /**
         * Middleware function for handling incoming messages.
         * @type {polka.Middleware}
         */
        this.incomingMsg = (req, res) => {
            const body = req.body;
            const payload = {
                ...req.body,
                from: parseNumber(body.From),
                to: parseNumber(body.To),
                host: parseNumber(body.To),
                body: body.Body,
                name: `${body?.ProfileName}`,
            };
            if (body?.NumMedia !== '0' && body?.MediaContentType0) {
                const type = body?.MediaContentType0.split('/')[0];
                switch (type) {
                    case 'audio':
                        payload.body = bot.utils.generateRefProvider('_event_voice_note_');
                        break;
                    case 'image':
                    case 'video':
                        payload.body = bot.utils.generateRefProvider('_event_media_');
                        break;
                    case 'application':
                        payload.body = bot.utils.generateRefProvider('_event_document_');
                        break;
                    case 'text':
                        payload.body = bot.utils.generateRefProvider('_event_contacts_');
                        break;
                }
            }
            else {
                if (body.Latitude && body.Longitude) {
                    payload.body = bot.utils.generateRefProvider('_event_location_');
                }
            }
            this.emit('message', payload);
            JSON.stringify({ body });
            //res.status(200).end(); 
            res.end();
        };
        this.twilio = twilio(globalVendorArgs.accountSid, globalVendorArgs.authToken);
        const host = {
            phone: parseNumber(globalVendorArgs.vendorNumber),
        };
        this.emit('host', host);
    }
}

/**
 * A class representing a TwilioProvider for interacting with Twilio messaging service.
 * @extends ProviderClass
 * @implements {TwilioInterface}
 */
class TwilioProvider extends bot.ProviderClass {
    constructor(args) {
        super();
        /**
         * Event handlers for bus events.
         */
        this.busEvents = () => [
            {
                event: 'auth_failure',
                func: (payload) => this.emit('auth_failure', payload),
            },
            {
                event: 'ready',
                func: () => this.emit('ready', true),
            },
            {
                event: 'message',
                func: (payload) => {
                    this.emit('message', payload);
                },
            },
            {
                event: 'host',
                func: (payload) => {
                    this.emit('host', payload);
                },
            },
        ];
        /**
         * Sends media content via Twilio.
         * @param {string} number - The recipient's phone number.
         * @param {string} [message=''] - The message to be sent.
         * @param {string} mediaInput - The media input to be sent.
         * @returns {Promise<any>} A Promise that resolves when the media is sent.
         */
        this.sendMedia = async (number, message = '', mediaInput) => {
            const entryPointUrl = this.globalVendorArgs?.publicUrl ?? `http://localhost:${this.globalVendorArgs.port}`;
            if (!mediaInput)
                throw new Error(`Media cannot be null`);
            const encryptPath = bot.utils.encryptData(encodeURIComponent(mediaInput));
            const urlEncode = `${entryPointUrl}/tmp?path=${encryptPath}`;
            const regexUrl = /^(?!https?:\/\/)[^\s]+$/;
            const instructions = [
                `You are trying to send a file that is local.`,
                `For this to work with Twilio, the file needs to be in a public URL.`,
                `More information here https://builderbot.vercel.app/en/twilio/uses-cases`,
                `This is the URL that will be sent to Twilio (must be public)`,
                ``,
                `${urlEncode}`,
            ];
            if (mediaInput.includes('localhost') ||
                mediaInput.includes('127.0.0.1') ||
                mediaInput.includes('0.0.0.0') ||
                regexUrl.test(mediaInput)) {
                mediaInput = urlEncode;
                this.emit('notice', {
                    title: '🟠  WARNING 🟠',
                    instructions,
                });
            }
            try {
                const twilioQueue = this.vendor.twilio.messages.create({
                    mediaUrl: [`${mediaInput}`],
                    body: message,
                    from: parseNumberFrom(this.globalVendorArgs.vendorNumber),
                    to: parseNumberFrom(number),
                });
                return twilioQueue;
            }
            catch (err) {
                console.log(`Error Twilio:`, err);
            }
        };
        /**
         * Sends buttons via Twilio.
         * @returns {Promise<void>} A Promise that resolves when buttons are sent.
         */
        this.sendButtons = async () => {
            this.emit('notice', {
                title: '📃 INFO 📃',
                instructions: [
                    `Twilio presents a different way to implement buttons and lists`,
                    `To understand more about how it works, I recommend you check the following URLs`,
                    `https://builderbot.vercel.app/en/providers/twilio/uses-cases`,
                ],
            });
        };
        /**
         *
         * @param number
         * @param message
         * @returns
         */
        this.send = async (number, message, options) => {
            const response = await this.vendor.twilio.messages.create({
                ...options,
                body: message,
                from: parseNumberFrom(this.globalVendorArgs.vendorNumber),
                to: parseNumberFrom(number),
            });
            return response;
        };
        /**
         * Sends a message via Twilio.
         * @param {string} number - The recipient's phone number.
         * @param {string} message - The message to be sent.
         * @param {SendOptions} [options] - The options for sending the message.
         * @returns {Promise<any>} A Promise that resolves when the message is sent.
         */
        this.sendMessage = async (number, message, options) => {
            options = { ...options, ...options['options'] };
            if (options?.buttons?.length)
                await this.sendButtons();
            if (options?.media)
                return this.sendMedia(number, message, options.media);
            const response = this.vendor.twilio.messages.create({
                body: message,
                from: parseNumberFrom(this.globalVendorArgs.vendorNumber),
                to: parseNumberFrom(number),
            });
            return response;
        };
        /**
         * Saves a file received via Twilio.
         * @param {Partial<TwilioRequestBody & BotContext>} ctx - The context containing the received file.
         * @param {{ path: string }} [options] - The options for saving the file.
         * @returns {Promise<string>} A Promise that resolves with the saved file path.
         */
        this.saveFile = async (ctx, options) => {
            try {
                const basicAuthToken = Buffer.from(`${this.globalVendorArgs.accountSid}:${this.globalVendorArgs.authToken}`).toString('base64');
                const twilioHeaders = {
                    Authorization: `Basic ${basicAuthToken}`,
                };
                const pathFile = path.join(options?.path ?? os.tmpdir());
                const localPath = await bot.utils.generalDownload(`${ctx?.MediaUrl0}`, pathFile, twilioHeaders);
                return localPath;
            }
            catch (err) {
                console.log(`[Error]:`, err);
                return 'ERROR';
            }
        };
        this.globalVendorArgs = {
            accountSid: undefined,
            authToken: undefined,
            vendorNumber: undefined,
            name: 'bot',
            port: 3000,
            writeMyself: 'none',
        };
        this.globalVendorArgs = { ...this.globalVendorArgs, ...args };
    }
    /**
     * Initialize the vendor for TwilioProvider.
     * @returns {Promise<any>} A Promise that resolves when vendor is initialized.
     * @protected
     */
    async initVendor() {
        const vendor = new TwilioCoreVendor(this.globalVendorArgs);
        this.vendor = vendor;
        return Promise.resolve(vendor);
    }
    beforeHttpServerInit() {
        this.server = this.server
            .use((req, _, next) => {
            req['globalVendorArgs'] = this.globalVendorArgs;
            return next();
        })
            .post('/', this.vendor.indexHome)
            .post('/webhook', this.vendor.incomingMsg);
        // .get('/tmp', this.vendor.handlerLocalMedia)
    }
    afterHttpServerInit() { }
}

exports.TwilioProvider = TwilioProvider;
