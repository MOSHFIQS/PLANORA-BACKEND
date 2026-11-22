import { SetMetadata } from "@nestjs/common";
import { AllowAnonymous, Public as BetterAuthPublic } from "@thallesp/nestjs-better-auth";

export const IS_PUBLIC_KEY = "PUBLIC";
export const Public = () => {
  return (target: any, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
    SetMetadata(IS_PUBLIC_KEY, true)(target, key, descriptor);
    BetterAuthPublic()(target, key, descriptor);
  };
};

export { AllowAnonymous };
