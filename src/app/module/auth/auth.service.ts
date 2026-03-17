import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { tokenUtils } from "../../utils/token";
import { IRegisterUserPayload } from "./auth.interface";

const registerUser = async (payload: IRegisterUserPayload) => {
     const { name, email, password, image } = payload;

     const data = await auth.api.signUpEmail({
          body: {
               name,
               email,
               password,
               image,
          },
     });

     if (!data.user) {
          throw new AppError(status.BAD_REQUEST, "Failed to register user");
     }

     const accessToken = tokenUtils.getAccessToken({
          userId: data.user.id,
          role: data.user.role,
          name: data.user.name,
          email: data.user.email,
          status: data.user.status,
          isDeleted: data.user.isDeleted,
          emailVerified: data.user.emailVerified,
     });

     const refreshToken = tokenUtils.getRefreshToken({
          userId: data.user.id,
          role: data.user.role,
          name: data.user.name,
          email: data.user.email,
          status: data.user.status,
          isDeleted: data.user.isDeleted,
          emailVerified: data.user.emailVerified,
     });

     return {
          ...data,
          accessToken,
          refreshToken,
     };
};

export const AuthService = {
     registerUser,
};
