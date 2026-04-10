import bcrypt from "bcryptjs";
import { createHmac } from "node:crypto";

export const generateHash = async (
    {
        text,
        salt = process.env.HASH_SALT ? parseInt(process.env.HASH_SALT) : 10
    }: {
        text: string,
        salt?: number
    }
): Promise<string> => {
    return await bcrypt.hash(text, salt || 10);

};

export const hashEmail = (email: string) => {
    const secret = process.env.EMAIL_HASH_SECRET;
    if (!secret) throw new Error('EMAIL_HASH_SECRET is not set');
    return createHmac('sha256', secret).update(email).digest('hex')
}

export const hashToken = (token: string) => {
    const secret = process.env.TOKEN_HASH_SECRET;
    if (!secret) throw new Error("TOKEN_HASH_SECRET is not set");

    return createHmac("sha256", secret)
        .update(token)
        .digest("hex");
};

export const compareHash = async ({
    plainText,
    hashText
}: {
    plainText: string,
    hashText: string
}) => {
    return await bcrypt.compare(plainText, hashText)
}