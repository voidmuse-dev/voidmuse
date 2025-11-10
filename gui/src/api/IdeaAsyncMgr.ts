interface PendingRequest {
    onSuccess: (response: any) => void;
    onFailure: (error_code: string, error_message: string) => void;
}

// Message manager
const IdeaAsyncMgr = {
    // Store pending requests
    pendingRequests: new Map<string, PendingRequest>(),

    // Send message and register callback
    sendMessage: function (data: any, onSuccess: (response: any) => void, onFailure: (error_code: string, error_message: string) => void): void {
        // Generate unique identifier
        const requestId = Math.random().toString(36).substring(2, 15);

        // Store callback functions
        this.pendingRequests.set(requestId, { onSuccess, onFailure });

        data["requestId"] = requestId;

        // Send message
        window.callJava({
            request: JSON.stringify(data),
            onSuccess: function (response) {
                console.log(`window.callJava callback success:, data: ${JSON.stringify(data)}, response:${JSON.stringify(response)}`);
            },
            onFailure: function (error_code, error_message) {
                onFailure(error_code + '', error_message);
                console.error('window.callJava callback failed:', error_code, error_message);
            }
        });

        // Set timeout
        setTimeout(() => {
            if (this.pendingRequests.has(requestId)) {
                const { onFailure } = this.pendingRequests.get(requestId)!;
                onFailure('TIMEOUT', 'Request timed out');
                this.pendingRequests.delete(requestId);
            }
        }, 30000); // 30 seconds timeout
    },
};

// Export IdeaAsyncMgr
export default IdeaAsyncMgr;

interface CallbackMessage {
    requestId: string;
    arg: any;
}
// Route to corresponding method based on methodName
const callJavaCallback = async (message: string): Promise<void> => {
    try {
        // message is json string data, convert to corresponding object
        console.log(`callJavaCallback message: ${message.substring(0, 100)}`);
        const parsedMessage: CallbackMessage = JSON.parse(message); // Convert json string to object
        if (parsedMessage.requestId && IdeaAsyncMgr.pendingRequests.has(parsedMessage.requestId)) {
            const { onSuccess, onFailure } = IdeaAsyncMgr.pendingRequests.get(parsedMessage.requestId)!;
            onSuccess(parsedMessage.arg.response);
            IdeaAsyncMgr.pendingRequests.delete(parsedMessage.requestId);
        }
    } catch (error) {
        console.error('callJavaCallback error occurred:', error); // Catch and print error information
    }
};

window.callJavaCallback = callJavaCallback;