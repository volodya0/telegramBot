import functions from "firebase-functions";
import bot from "./App";

// handle all telegram updates with HTTPs trigger
exports.echoBot = functions.https.onRequest(
    async (request: any, response: any) => {
        functions.logger.log("Incoming message", request.body);
        return await bot
            .handleUpdate(request.body, response)
            .then((rv: any) => {
                // if it's not a request from the telegram, rv will be undefined, but we should respond with 200
                return !rv && response.sendStatus(200);
            });
    }
);
