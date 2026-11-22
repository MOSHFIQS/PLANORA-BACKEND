import { Module, OnApplicationBootstrap, Logger } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";

import { AppController } from "./app.controller";
import { PrismaModule } from "./database/prisma.module";
import { MailModule } from "./mail/mail.module";
import { auth } from "./modules/auth/auth.config";

import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { TransformResponseInterceptor } from "./common/interceptors/transform-response.interceptor";
import { RolesGuard } from "./common/guards/roles.guard";
import { seedSuperAdmin } from "./common/utils/seed.util";

// Feature Modules
import { AdminModule } from "./modules/admin/admin.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BannerModule } from "./modules/banner/banner.module";
import { CategoryModule } from "./modules/category/category.module";
import { EventModule } from "./modules/event/event.module";
import { FileModule } from "./modules/file/file.module";
import { InvitationModule } from "./modules/invitation/invitation.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { ParticipationModule } from "./modules/participation/participation.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { ProfileModule } from "./modules/profile/profile.module";
import { ReviewModule } from "./modules/review/review.module";
import { StatModule } from "./modules/stat/stat.module";
import { TicketModule } from "./modules/ticket/ticket.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MailModule,

    // Better Auth integration via @thallesp/nestjs-better-auth
    BetterAuthModule.forRoot({
      auth,
      disableGlobalAuthGuard: true,
      bodyParser: {
        json: { limit: "2mb" },
        urlencoded: { limit: "2mb", extended: true },
        rawBody: true, // enables req.rawBody for Stripe webhook signature verification
      },
    }),

    // Application Feature Modules
    AdminModule,
    AuditModule,
    AuthModule,
    BannerModule,
    CategoryModule,
    EventModule,
    FileModule,
    InvitationModule,
    NotificationModule,
    ParticipationModule,
    PaymentModule,
    ProfileModule,
    ReviewModule,
    StatModule,
    TicketModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppModule.name);

  async onApplicationBootstrap() {
    this.logger.log("Seeding initial superadmin if needed...");
    await seedSuperAdmin();
  }
}
