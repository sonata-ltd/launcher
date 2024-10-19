type MessageHandler = (message: string) => void;

class WSStore {
    private sockets: { [key: string]: WebSocket } = {};
    private handlers: { [key: string]: Map<string, MessageHandler> } = {};  // Map<url, Map<source, handler>>
    private retryDelays: { [key: string]: number } = {};
    private messageQueue: { [key: string]: string[] } = {};

    constructor(private maxRetryDelay = 5000) {}  // Max retry delay in ms

    // Connect to a WebSocket URL dynamically
    private connectSocket = (url: string) => {
        if (this.sockets[url] && this.sockets[url].readyState === WebSocket.OPEN) {
            return; // If already connected, skip
        }

        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log(`WebSocket connected to: ${url}`);
            this.sockets[url] = ws;
            this.retryDelays[url] = 500; // Reset retry delay on successful connection
            this.flushMessageQueue(url); // Send any queued messages
        };

        ws.onmessage = (e) => {
            this.handleMessage(url, e.data);
        };

        ws.onclose = () => {
            console.log(`WebSocket closed: ${url}`);
            this.reconnect(url);
        };

        ws.onerror = (err) => {
            console.error(`WebSocket error on ${url}:`, err);
            ws.close(); // Close the connection on error to trigger reconnect
        };

        this.sockets[url] = ws;
    };

    // Reconnect with exponential backoff
    private reconnect = (url: string) => {
        const delay = Math.min(this.retryDelays[url] || 500, this.maxRetryDelay);
        console.log(`Attempting to reconnect to ${url} in ${delay} ms...`);

        setTimeout(() => {
            this.connectSocket(url); // Retry connection
            this.retryDelays[url] = delay * 2; // Exponential backoff
        }, delay);
    };

    // Handle incoming messages and dispatch to subscribed handlers
    private handleMessage = (url: string, message: string) => {
        const sourceHandlers = this.handlers[url];
        if (sourceHandlers) {
            sourceHandlers.forEach((handler) => {
                handler(message); // Call each handler subscribed to this WebSocket
            });
        }
    };

    // Subscribe to a WebSocket URL, avoiding duplicate subscriptions for the same source
    public subscribe = (url: string, handler: MessageHandler, source: string) => {
        console.warn(source);
        if (!this.handlers[url]) {
            this.handlers[url] = new Map();
        }

        const sourceHandlers = this.handlers[url];

        // Check if this source already has a handler
        if (sourceHandlers.has(source)) {
            console.log(`Replacing handler for source: ${source} on WebSocket URL: ${url}`);
        } else {
            console.log(`Subscribing new handler for source: ${source} to WebSocket URL: ${url}`);
        }
        console.log(sourceHandlers);

        // Add or replace the handler for this source
        sourceHandlers.set(source, handler);

        // Connect to the WebSocket if not already connected
        if (!this.sockets[url] || this.sockets[url].readyState !== WebSocket.OPEN) {
            this.connectSocket(url);
        }
    };

    // Send a message to the WebSocket URL
    public sendMessage = (url: string, message: string) => {
        const socket = this.sockets[url];

        if (!socket) {
            console.warn(`No WebSocket connection to ${url}. Queueing message.`);
            this.queueMessage(url, message);
            this.connectSocket(url); // Ensure the socket connects if not connected
            return;
        }

        if (socket.readyState === WebSocket.OPEN) {
            console.log(`Sending message to ${url}: ${message}`);
            socket.send(message);
        } else if (socket.readyState === WebSocket.CONNECTING) {
            console.log(`WebSocket to ${url} is still connecting. Queueing message.`);
            this.queueMessage(url, message); // Queue the message if the socket isn't ready
        } else {
            console.warn(`Cannot send message to ${url}. WebSocket is closed or in an error state.`);
        }
    };

    // Queue a message to be sent once the WebSocket is open
    private queueMessage = (url: string, message: string) => {
        if (!this.messageQueue[url]) {
            this.messageQueue[url] = [];
        }
        this.messageQueue[url].push(message);
    };

    // Flush queued messages once the WebSocket is open
    private flushMessageQueue = (url: string) => {
        const queue = this.messageQueue[url];
        if (queue && queue.length > 0) {
            console.log(`Flushing message queue for ${url}.`);
            queue.forEach((message) => {
                this.sendMessage(url, message);
            });
            this.messageQueue[url] = []; // Clear the queue after sending
        }
    };

    // Get the WebSocket instance for a specific URL
    public getSocket = (url: string): WebSocket | undefined => {
        return this.sockets[url];
    };
}

const WSStoreInstance = new WSStore();
export default WSStoreInstance;
