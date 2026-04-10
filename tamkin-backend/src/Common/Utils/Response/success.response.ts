import { I_Response } from "../../Interfaces/response.interface";

export const SuccessResponse = <T = any>({
    message = 'done',
    info,
    statusCode = 200,
    data = undefined,
}: I_Response<T> = {}): I_Response<T> => {
    return { message, info, statusCode, data };
};