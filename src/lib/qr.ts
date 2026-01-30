import QRCode from "qrcode";
import { cloudinary } from "./cloudinary";
import { config } from "../config";


export const generateQRCode = async (cardId: string) => {
  const publicUrl = `${config.authOrigin}/card/${cardId}`;

  const qrBase64 = await QRCode.toDataURL(publicUrl, {
    width: 300,
    margin: 2,
  });

  const uploaded = await cloudinary.uploader.upload(qrBase64, {
    folder: "contactx/qr",
    public_id: cardId,
    overwrite: true,
  });

  return {
    qrCode: publicUrl,
    qrImage: uploaded.secure_url,
  };
};
