

export interface IRegisterUserPayload {
     name: string;
     email: string;
     password: string;
     image: string;
}

export interface IChangePasswordPayload {
     currentPassword: string;
     newPassword: string;
}
