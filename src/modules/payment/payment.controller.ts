import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Headers,
  BadRequestException,
} from "@nestjs/common";
import { Request } from "express";
import { PaymentService } from "./payment.service";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { IQueryParams } from "../../common/interfaces/query.interface";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env.config";
import { InitiatePaymentDto } from "./dto/initiate-payment.dto";

@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("pay")
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN, Role.ORGANIZER)
  async initiatePayment(
    @CurrentUser() user: IRequestUser,
    @Body() payload: InitiatePaymentDto
  ) {
    return this.paymentService.initiatePayment(user, payload);
  }

  @Public()
  @Post("webhook")
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers("stripe-signature") signature: string
  ) {
    if (!signature) {
      throw new BadRequestException("Missing stripe-signature header");
    }

    try {
      const rawBody = (req as any).rawBody || req.body;
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        envVars.STRIPE_WEBHOOK_SECRET
      );

      await this.paymentService.handleStripeWebhookEvent(event);
      return { received: true };
    } catch (err: any) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }

  @Get("my")
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN, Role.ORGANIZER)
  async getMyPayments(
    @CurrentUser() user: IRequestUser,
    @Query() query: IQueryParams
  ) {
    return this.paymentService.getMyPayments(user, query);
  }

  @Get("organizer")
  @Roles(Role.ORGANIZER)
  async getOrganizerPayments(
    @CurrentUser() user: IRequestUser,
    @Query() query: IQueryParams
  ) {
    return this.paymentService.getOrganizerPayments(user, query);
  }

  @Get("admin")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getAllPayments(@Query() query: IQueryParams) {
    return this.paymentService.getAllPayments(query);
  }
}
