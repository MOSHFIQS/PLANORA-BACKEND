import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule, SwaggerCustomOptions } from "@nestjs/swagger";

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle("Planora API")
    .setDescription(
      "Planora Event Management & Ticketing Platform - Complete REST API Documentation with zero-level clean architecture."
    )
    .setVersion("1.0.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "Enter your Bearer Token or Session Token",
        in: "header",
      },
      "bearer"
    )
    .addTag("App", "General application health and status")
    .addTag("Auth", "Authentication, Better-Auth integration, registration, login & tokens")
    .addTag("Profile", "User profile retrieval and update operations")
    .addTag("Admin", "Super Admin and Admin operations (Users, Roles, Status)")
    .addTag("Category", "Event category management (CRUD)")
    .addTag("Banner", "Homepage and promotional banners management")
    .addTag("Event", "Events discovery, creation, updates, and featured status")
    .addTag("Ticket", "Tickets management, user ticket retrieval, QR check-in")
    .addTag("Participation", "Participant tracking, registrations, and status updates")
    .addTag("Payment", "Stripe payment intents, webhooks, and invoices")
    .addTag("Review", "Event reviews, ratings, and feedback")
    .addTag("Invitation", "Speaker and VIP event invitations")
    .addTag("Notification", "User notifications and read state management")
    .addTag("Stat", "Platform, Admin, Organizer, and User analytical statistics")
    .addTag("Audit", "System activity and security audit logs")
    .addTag("File", "Image and media uploads to Cloudinary")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: "Planora API Documentation",
    customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js",
    ],
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: "none",
    },
  };

  SwaggerModule.setup("docs", app, document, customOptions);
  SwaggerModule.setup("api/docs", app, document, customOptions);
}
