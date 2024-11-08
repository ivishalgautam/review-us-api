"use strict";
import QRCode from "qrcode";
import { ErrorHandler } from "../helpers/handleError.js";

export const QrGenerator = async (data) => {
  return await QRCode.toDataURL(data)
    .then((url) => url)
    .catch((err) => ErrorHandler({ message: "Error generating QR!" }));
};
