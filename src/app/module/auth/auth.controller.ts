import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";
import { AuthService } from "./auth.service";

const registerUser = catchAsync(async (req: Request, res: Response) => {
     const payload = req.body;

     console.log(payload);

     const result = await AuthService.registerUser(payload);
     console.log(result);

     const { accessToken, refreshToken, token, ...rest } = result;

     tokenUtils.setAccessTokenCookie(res, accessToken);
     tokenUtils.setRefreshTokenCookie(res, refreshToken);
     tokenUtils.setBetterAuthSessionCookie(res, token as string);

     sendResponse(res, {
          httpStatusCode: status.CREATED,
          success: true,
          message: "User registered successfully",
          data: {
               token,
               accessToken,
               refreshToken,
               ...rest,
          },
     });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
     const payload = req.body;
     const result = await AuthService.loginUser(payload);
     const { accessToken, refreshToken, token, ...rest } = result;

     tokenUtils.setAccessTokenCookie(res, accessToken);
     tokenUtils.setRefreshTokenCookie(res, refreshToken);
     tokenUtils.setBetterAuthSessionCookie(res, token);

     sendResponse(res, {
          httpStatusCode: status.OK,
          success: true,
          message: "User logged in successfully",
          data: {
               token,
               accessToken,
               refreshToken,
               ...rest,
          },
     });
});

export const AuthController = {
     registerUser,
     loginUser,
};
