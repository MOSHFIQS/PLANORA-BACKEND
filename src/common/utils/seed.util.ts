import { Role, UserStatus } from "../../generated/prisma/enums";
import { auth, prisma } from "../../modules/auth/auth.config";
import { envVars } from "../../config/env.config";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await prisma.user.findFirst({
      where: {
        role: Role.SUPERADMIN,
      },
    });

    if (isSuperAdminExist) {
      console.log("Super Admin already exists. Skipping seeding.");
      return;
    }

    const superAdminUser = await auth.api.signUpEmail({
      body: {
        email: envVars.SUPER_ADMIN_EMAIL,
        password: envVars.SUPER_ADMIN_PASSWORD,
        name: "Super Admin",
        role: Role.SUPERADMIN,
      },
    });

    if (superAdminUser?.user) {
      await prisma.user.update({
        where: {
          id: superAdminUser.user.id,
        },
        data: {
          emailVerified: true,
          status: UserStatus.ACTIVE,
          role: Role.SUPERADMIN,
        },
      });
      console.log("Super Admin seeded successfully.");
    }
  } catch (error) {
    console.error("Failed to seed Super Admin:", error);
  }
};
