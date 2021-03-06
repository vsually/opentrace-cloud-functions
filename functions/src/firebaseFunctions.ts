import * as functions from "firebase-functions";

import config from "./config";

/**
 * Wrapper around functions to handle authentication
 * @param handler
 * @param runtimeOpt
 */
export function https(
  handler: (uid: string, data: any, context: functions.https.CallableContext) => any | Promise<any>,
  runtimeOpt: functions.RuntimeOptions = {memory: '256MB', timeoutSeconds: 60}
): functions.HttpsFunction {
  return functions
    .runWith(runtimeOpt)
    .region(...config.regions)
    .https.onCall(async (data, context) => {
      const uid = await config.authenticator.authenticate(data, context);

      return handler(uid, data, context);
    });
}

export function storage(
  bucket: string,
  handler: (object: functions.storage.ObjectMetadata) => any | Promise<any>,
  runtimeOpt: functions.RuntimeOptions = {memory: '256MB', timeoutSeconds: 60}
): functions.CloudFunction<functions.storage.ObjectMetadata> {
  return functions
    .runWith(runtimeOpt)
    .region(...config.regions)
    .storage.bucket(bucket).object().onFinalize(async (object) => {
      return handler(object);
    });
}
