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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from "@nestjs/swagger";
import { Request } from "express";
import { PaymentService } from "./payment.service";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env.config";
import { InitiatePaymentDto } from "./dto/initiate-payment.dto";

@ApiTags("Payment")
@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("pay")
  @ApiBearerAuth("bearer")
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN, Role.ORGANIZER)
  @ApiOperation({ summary: "Initiate Stripe checkout session / payment intent" })
  @ApiResponse({ status: 201, description: "Payment session created successfully" })
  async initiatePayment(
    @CurrentUser() user: IRequestUser,
    @Body() payload: InitiatePaymentDto
  ) {
    return this.paymentService.initiatePayment(user, payload);
  }

  @Public()
  @Post("webhook")
  @ApiOperation({ summary: "Stripe Webhook handler (raw payload verification)" })
  @ApiHeader({ name: "stripe-signature", description: "Stripe webhook signature" })
  @ApiResponse({ status: 200, description: "Webhook event processed" })
  @ApiResponse({ status: 400, description: "Invalid webhook signature" })
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
  @ApiBearerAuth("bearer")
  @Roles(Role.USER, Role.ADMIN, Role.ORGANIZER, Role.SUPERADMIN)
  @ApiOperation({ summary: "Get payments and invoices of logged in user" })
  @ApiResponse({ status: 200, description: "User payments list returned successfully" })
  async getMyPayments(
    @CurrentUser() user: IRequestUser,
    @Query() query: PaginationQueryDto
  ) {
    return this.paymentService.getMyPayments(user, query);
  }

  @Get("organizer")
  @ApiBearerAuth("bearer")
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: "Get payments received for organizer's events" })
  @ApiResponse({ status: 200, description: "Organizer payments list returned successfully" })
  async getOrganizerPayments(
    @CurrentUser() user: IRequestUser,
    @Query() query: PaginationQueryDto
  ) {
    return this.paymentService.getOrganizerPayments(user, query);
  }

  @Get("admin")
  @ApiBearerAuth("bearer")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Get all platform payments (Admin/SuperAdmin)" })
  @ApiResponse({ status: 200, description: "All platform payments returned successfully" })
  async getAllPaymentsAdmin(@Query() query: PaginationQueryDto) {
    return this.paymentService.getAllPayments(query);
  }
}
