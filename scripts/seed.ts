import path from "path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  Role,
  UserStatus,
  EventVisibility,
  EventType,
  ParticipationStatus,
  TicketStatus,
  InvitationStatus,
  BannerPosition,
  AuditAction,
} from "../src/generated/prisma/enums";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "crypto";

dotenv.config({ path: path.join(__dirname, "../.env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log("🌱 Starting Planora full database seed...\n");

  // 1. CLEAR EXISTING DATA IN FOREIGN-KEY SAFE ORDER
  console.log("🧹 Resetting existing database records...");
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.participation.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("✅ Database reset complete.\n");

  // Default password hash for "11111111"
  const defaultPasswordHash = await hashPassword("11111111");

  // 2. CREATE PRIMARY ACCOUNTS (ORGANIZER, ADMIN, SUPERADMIN) & DEMO USERS
  console.log("👤 Creating user accounts with password: '11111111'...");

  const coreUsersData = [
    {
      name: "Moshfiqur Rahman",
      email: "moshfiqs.dev@gmail.com",
      role: Role.SUPERADMIN,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Planora Admin",
      email: "admin@gmail.com",
      role: Role.ADMIN,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Summit Events Organizer",
      email: "organizer@gmail.com",
      role: Role.ORGANIZER,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
    },
    // Community members & participants
    {
      name: "Sophia Martinez",
      email: "sophia.martinez@gmail.com",
      role: Role.USER,
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Alexander Vance",
      email: "alex.vance@gmail.com",
      role: Role.USER,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Elena Rostova",
      email: "elena.rostova@gmail.com",
      role: Role.USER,
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Liam O'Connor",
      email: "liam.oconnor@gmail.com",
      role: Role.USER,
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Chloe Dupont",
      email: "chloe.dupont@gmail.com",
      role: Role.USER,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Marcus Sterling",
      email: "marcus.sterling@gmail.com",
      role: Role.USER,
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Priya Sharma",
      email: "priya.sharma@gmail.com",
      role: Role.USER,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Daniel Lindqvist",
      email: "daniel.lindqvist@gmail.com",
      role: Role.USER,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
    },
  ];

  const createdUsers: Record<string, any> = {};

  for (const u of coreUsersData) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        emailVerified: true,
        role: u.role,
        status: UserStatus.ACTIVE,
        needPasswordChange: false,
        image: u.image,
      },
    });

    await prisma.account.create({
      data: {
        id: randomUUID(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: defaultPasswordHash,
      },
    });

    createdUsers[u.email] = user;
    console.log(`  ✓ ${u.role}: ${u.email} (${u.name})`);
  }

  const organizer = createdUsers["organizer@gmail.com"];
  const admin = createdUsers["admin@gmail.com"];
  const superAdmin = createdUsers["moshfiqs.dev@gmail.com"];

  // 3. CREATE CATEGORIES (10 Realistic Categories)
  console.log("\n📁 Creating 10 Realistic Categories...");
  const categoriesData = [
    {
      name: "Technology & AI",
      description: "Artificial intelligence, software engineering, cloud computing, robotics, and next-generation tech breakthroughs.",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Music & Festivals",
      description: "Live concerts, indie acoustic sessions, electronic festivals, jazz ensembles, and international orchestra performances.",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Business & Startups",
      description: "Founder pitch events, venture capital forums, growth hack conferences, and enterprise leadership summits.",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Health & Wellness",
      description: "Mindfulness retreats, holistic yoga intensives, longevity biohacking workshops, and mental wellness seminars.",
      image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Arts & Culture",
      description: "Contemporary art biennials, sculpture galleries, classical theater showcases, and indigenous craft exhibitions.",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Sports & Fitness",
      description: "Urban marathons, crossfit championships, cycling grand prix, and athletic endurance competitions.",
      image: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Education & Workshops",
      description: "Hands-on coding bootcamps, executive design sprints, language immersion labs, and science seminars.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Food & Culinary Arts",
      description: "Gourmet wine tastings, artisan chef masterclasses, street food festivals, and organic farm-to-table dinners.",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Gaming & Esports",
      description: "Global multiplayer tournaments, game development hackathons, VR showcase arenas, and streamer fan expos.",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Photography & Film",
      description: "Cinema documentary premieres, landscape photo expeditions, drone cinematography labs, and darkroom classes.",
      image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  const createdCategories: any[] = [];
  for (const c of categoriesData) {
    const cat = await prisma.category.create({ data: c });
    createdCategories.push(cat);
    console.log(`  ✓ Category: ${cat.name}`);
  }

  // 4. CREATE 12 REALISTIC EVENTS
  console.log("\n🎪 Creating 12 Realistic Events...");
  const now = new Date();

  const eventsData = [
    {
      title: "Global AI & NextGen Intelligent Systems Summit 2026",
      description:
        "Join 3,500+ world-class AI researchers, prompt architects, machine learning engineers, and founders at the premier generative AI conference of the year. Featuring keynotes on frontier LLMs, autonomous agentic workflows, edge AI deployment, and synthetic data ethics.\n\nAttendees receive access to hands-on breakout labs, networking lounges with top-tier venture firms, and an exclusive API test harness playground.",
      venue: "Moscone Center West, San Francisco, CA",
      dateTime: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days future
      visibility: EventVisibility.PUBLIC,
      type: EventType.OFFLINE,
      fee: 149.0,
      images: [
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: true,
      categoryIndex: 0,
      organizerId: organizer.id,
    },
    {
      title: "Full-Stack TypeScript & Cloud Architecture Masterclass",
      description:
        "An intensive deep dive into building ultra-scalable distributed applications with Next.js 16, NestJS, Prisma 7, PostgreSQL, and event-driven microservices. We explore zero-downtime database migrations, micro-frontends, caching strategies, and robust authentication layers.\n\nAll live coding exercises are hosted in interactive cloud environments with immediate instructor feedback.",
      venue: "Virtual Live Auditorium & GitHub Classroom",
      dateTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days future
      visibility: EventVisibility.PUBLIC,
      type: EventType.ONLINE,
      meetingLink: "https://meet.google.com/xyz-plnr-tech",
      fee: 49.0,
      images: [
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: true,
      categoryIndex: 0,
      organizerId: organizer.id,
    },
    {
      title: "Acoustic Sunset & Indie Music Festival 2026",
      description:
        "Breathe in the evening breeze with an ethereal blend of indie folk, ambient strings, and soulful acoustic melodies across three open-air amphitheaters. Featuring live sets from rising indie singer-songwriters, artisanal cider tastings, and cozy twilight bonfire acoustic circles.",
      venue: "Zilker Park Outdoor Amphitheater, Austin, TX",
      dateTime: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 days future
      visibility: EventVisibility.PUBLIC,
      type: EventType.OFFLINE,
      fee: 35.0,
      images: [
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: true,
      categoryIndex: 1,
      organizerId: organizer.id,
    },
    {
      title: "SaaS Founders & Seed-to-Series-A Venture Forum",
      description:
        "Connect directly with 40+ active angel investors, venture partners, and repeat founders. Sessions include real-time pitch deck teardowns, unit economics audits, CAC/LTV benchmarks, and private matchmaking dinners for seed and pre-seed stage tech startups.",
      venue: "Metropolitan Pavilion, New York, NY",
      dateTime: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PUBLIC,
      type: EventType.OFFLINE,
      fee: 199.0,
      images: [
        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: true,
      categoryIndex: 2,
      organizerId: organizer.id,
    },
    {
      title: "Mindfulness, Breathwork & Sound Healing Sanctuary",
      description:
        "Escape the noise of daily life for a restorative day dedicated to somatic breathwork, Tibetan singing bowl frequencies, restorative yin yoga, and guided silent meditation. Includes a nourishing vegan lunch and botanical tea ceremonies.",
      venue: "Grand Botanical Conservatory, Portland, OR",
      dateTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PUBLIC,
      type: EventType.OFFLINE,
      fee: 0.0, // Free community event
      images: [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: true,
      categoryIndex: 3,
      organizerId: organizer.id,
    },
    {
      title: "Modern Art Biennale & Interactive Installation Showcase",
      description:
        "Explore curated contemporary works from 60+ international painters, sculptors, and digital installation artists. Experience light tunnels, kinetic sculptures, and interactive digital canvas projection mappings.",
      venue: "Palace of Fine Arts, San Francisco, CA",
      dateTime: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PUBLIC,
      type: EventType.OFFLINE,
      fee: 25.0,
      images: [
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 4,
      organizerId: admin.id,
    },
    {
      title: "Urban Skyline Half-Marathon & 10K Fitness Challenge",
      description:
        "Lace up your running shoes for a picturesque race through the city's iconic bridges, riverwalks, and historic neighborhoods. Chip-timed with hydration stations every 2 miles, finisher medals, and a lively post-race block party.",
      venue: "Millennium Park Plaza, Chicago, IL",
      dateTime: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PUBLIC,
      type: EventType.OFFLINE,
      fee: 45.0,
      images: [
        "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 5,
      organizerId: organizer.id,
    },
    {
      title: "Design Systems & Micro-Interactions Virtual Workshop",
      description:
        "A practical 4-hour hands-on design engineering workshop covering token architecture, Figma variables, complex gesture animations, and accessibility-first WCAG AAA design implementation.",
      venue: "Figma Live Space & Zoom Video Hub",
      dateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PUBLIC,
      type: EventType.ONLINE,
      meetingLink: "https://meet.google.com/uxd-dsgn-live",
      fee: 39.0,
      images: [
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 6,
      organizerId: superAdmin.id,
    },
    {
      title: "Artisan Coffee Roasting & Specialty Cupping Experience",
      description:
        "Explore single-origin coffee varietals from Ethiopia, Colombia, and Yemen. Learn the science of roast profiling, maillard reactions, pour-over extraction geometry, and sensory cupping.",
      venue: "The Roastery Warehouse, Brooklyn, NY",
      dateTime: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PUBLIC,
      type: EventType.OFFLINE,
      fee: 55.0,
      images: [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: true,
      categoryIndex: 7,
      organizerId: organizer.id,
    },
    {
      title: "Apex Arena Esports Invitational & Fan Convention",
      description:
        "The top 16 regional esports squads compete live on stage in front of thousands of screaming fans. Includes LAN side tournaments, retro arcade alleys, cosplayer photo ops, and high-performance gaming hardware giveaways.",
      venue: "Hyperion Arena, Los Angeles, CA",
      dateTime: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PUBLIC,
      type: EventType.OFFLINE,
      fee: 29.0,
      images: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 8,
      organizerId: organizer.id,
    },
    // Past events for realistic reviews and verified tickets!
    {
      title: "Next.js 15 & Modern Web Development Summit 2025",
      description:
        "An unforgettable gathering of front-end architects detailing Turbopack internals, Server Actions, streaming SSR, and edge hydration optimizations. Recorded keynote sessions and slide decks available to all alumni.",
      venue: "Convention Center Hall A, Seattle, WA",
      dateTime: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago (Past)
      visibility: EventVisibility.PUBLIC,
      type: EventType.OFFLINE,
      fee: 99.0,
      images: [
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 0,
      organizerId: organizer.id,
    },
    {
      title: "Private VIP Executive Roundtable: Tech Governance & AI Policy",
      description:
        "Exclusive invite-only confidential symposium for corporate directors, regulators, and venture general partners exploring compliance frameworks, data residency, and enterprise AI guardrails.",
      venue: "The Metropolitan Club, Washington, DC",
      dateTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PRIVATE, // Private event to test invitations
      type: EventType.OFFLINE,
      fee: 0.0,
      images: [
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 2,
      organizerId: superAdmin.id,
    },
  ];

  const createdEvents: any[] = [];
  for (const ed of eventsData) {
    const category = createdCategories[ed.categoryIndex];
    const event = await prisma.event.create({
      data: {
        title: ed.title,
        description: ed.description,
        venue: ed.venue,
        dateTime: ed.dateTime,
        visibility: ed.visibility,
        type: ed.type,
        meetingLink: ed.meetingLink,
        fee: ed.fee,
        images: ed.images,
        isFeatured: ed.isFeatured,
        categoryId: category.id,
        organizerId: ed.organizerId,
      },
    });
    createdEvents.push(event);
    console.log(`  ✓ Event: ${event.title} [${event.type} | Fee: $${event.fee}]`);
  }

  // 5. CREATE 10 REALISTIC BANNERS
  console.log("\n🎨 Creating 10 Realistic Homepage Banners...");
  const bannersData = [
    {
      title: "Global AI & NextGen Systems Summit",
      description: "Step into the future of autonomous intelligence with leading researchers and engineers.",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
      position: BannerPosition.MAIN,
      positionOrder: 1,
      buttonText: "Reserve Ticket",
      altText: "Global AI Summit stage lights and presentation",
      type: EventType.OFFLINE,
      eventIndex: 0,
    },
    {
      title: "Full-Stack TypeScript & Cloud Masterclass",
      description: "Master modern microservices and high-throughput architectures online with world-class mentors.",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
      position: BannerPosition.MAIN,
      positionOrder: 2,
      buttonText: "Join Online Stream",
      altText: "Interactive coding and system architecture workshop",
      type: EventType.ONLINE,
      eventIndex: 1,
    },
    {
      title: "Acoustic Sunset & Indie Music Festival",
      description: "Three outdoor stages, twilight bonfires, and unforgettable live indie acoustic performances.",
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop",
      position: BannerPosition.MAIN,
      positionOrder: 3,
      buttonText: "Explore Lineup",
      altText: "Outdoor acoustic concert during golden hour",
      type: EventType.OFFLINE,
      eventIndex: 2,
    },
    {
      title: "SaaS Founders & Venture Capital Meetup",
      description: "Get funded, meet visionary operators, and gain actionable scaling frameworks in New York City.",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop",
      position: BannerPosition.SECONDARY,
      positionOrder: 1,
      buttonText: "Apply to Pitch",
      altText: "Venture forum panel with startup leaders",
      type: EventType.OFFLINE,
      eventIndex: 3,
    },
    {
      title: "Mindfulness & Sound Healing Sanctuary",
      description: "Free community day for breathwork, singing bowls, and restorative holistic rejuvenation.",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
      position: BannerPosition.SECONDARY,
      positionOrder: 2,
      buttonText: "Register Free",
      altText: "Peaceful yoga meditation inside conservatory",
      type: EventType.OFFLINE,
      eventIndex: 4,
    },
    {
      title: "Modern Art Biennale & Installations",
      description: "Curated immersive light tunnels and digital paintings from world-renowned artists.",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop",
      position: BannerPosition.SECONDARY,
      positionOrder: 3,
      buttonText: "View Gallery",
      altText: "Modern art exhibition gallery view",
      type: EventType.OFFLINE,
      eventIndex: 5,
    },
    {
      title: "Urban Skyline Half-Marathon Challenge",
      description: "Experience the city's breathtaking bridges and scenic skyline on a professionally chip-timed course.",
      image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop",
      position: BannerPosition.THIRD,
      positionOrder: 1,
      buttonText: "Sign Up Today",
      altText: "Marathon runners crossing urban bridge",
      type: EventType.OFFLINE,
      eventIndex: 6,
    },
    {
      title: "Design Systems & Token Architecture",
      description: "Elevate your product craftsmanship with scalable component libraries and Figma variable workflows.",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1200&auto=format&fit=crop",
      position: BannerPosition.THIRD,
      positionOrder: 2,
      buttonText: "Reserve Seat",
      altText: "UI design wireframes on laptop screen",
      type: EventType.ONLINE,
      eventIndex: 7,
    },
    {
      title: "Artisan Coffee Roasting Masterclass",
      description: "Learn single-origin cupping, roast curves, and espresso dial-in techniques from champion baristas.",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
      position: BannerPosition.THIRD,
      positionOrder: 3,
      buttonText: "Taste & Learn",
      altText: "Pour over specialty coffee extraction",
      type: EventType.OFFLINE,
      eventIndex: 8,
    },
    {
      title: "Apex Arena Esports Invitational",
      description: "Witness adrenaline-packed LAN matchups and meet your favorite streamers in Los Angeles.",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
      position: BannerPosition.THIRD,
      positionOrder: 4,
      buttonText: "Get Tournament Pass",
      altText: "Esports tournament stage with glowing arena lighting",
      type: EventType.OFFLINE,
      eventIndex: 9,
    },
  ];

  for (const b of bannersData) {
    const event = createdEvents[b.eventIndex];
    const banner = await prisma.banner.create({
      data: {
        title: b.title,
        description: b.description,
        image: b.image,
        redirectUrl: `/events/${event.id}`,
        dateTime: event.dateTime,
        type: b.type,
        position: b.position,
        positionOrder: b.positionOrder,
        buttonText: b.buttonText,
        altText: b.altText,
        isActive: true,
        eventId: event.id,
      },
    });
    console.log(`  ✓ Banner [${banner.position} #${banner.positionOrder}]: ${banner.title}`);
  }

  // 6. CREATE PARTICIPATIONS & TICKETS (AT LEAST 15+ REALISTIC ITEMS)
  console.log("\n🎟️ Creating Participations & Verified Tickets...");

  const participantsList = [
    { user: superAdmin, eventIndex: 0, status: ParticipationStatus.APPROVED, used: false },
    { user: admin, eventIndex: 0, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["sophia.martinez@gmail.com"], eventIndex: 0, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["alex.vance@gmail.com"], eventIndex: 0, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["elena.rostova@gmail.com"], eventIndex: 0, status: ParticipationStatus.PENDING, used: false },

    { user: superAdmin, eventIndex: 1, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["liam.oconnor@gmail.com"], eventIndex: 1, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["chloe.dupont@gmail.com"], eventIndex: 1, status: ParticipationStatus.APPROVED, used: false },

    { user: superAdmin, eventIndex: 2, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["marcus.sterling@gmail.com"], eventIndex: 2, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["priya.sharma@gmail.com"], eventIndex: 2, status: ParticipationStatus.APPROVED, used: false },

    { user: createdUsers["daniel.lindqvist@gmail.com"], eventIndex: 3, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["sophia.martinez@gmail.com"], eventIndex: 3, status: ParticipationStatus.PENDING, used: false },

    { user: superAdmin, eventIndex: 4, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["elena.rostova@gmail.com"], eventIndex: 4, status: ParticipationStatus.APPROVED, used: false },

    // Past event (eventIndex: 10) with USED tickets!
    { user: superAdmin, eventIndex: 10, status: ParticipationStatus.APPROVED, used: true },
    { user: createdUsers["alex.vance@gmail.com"], eventIndex: 10, status: ParticipationStatus.APPROVED, used: true },
    { user: createdUsers["liam.oconnor@gmail.com"], eventIndex: 10, status: ParticipationStatus.APPROVED, used: true },
  ];

  for (let i = 0; i < participantsList.length; i++) {
    const p = participantsList[i];
    const event = createdEvents[p.eventIndex];

    const participation = await prisma.participation.create({
      data: {
        userId: p.user.id,
        eventId: event.id,
        status: p.status,
      },
    });

    if (p.status === ParticipationStatus.APPROVED) {
      const qrCode = `PLN-TKT-${event.id.slice(-6).toUpperCase()}-${p.user.id.slice(-6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await prisma.ticket.create({
        data: {
          userId: p.user.id,
          eventId: event.id,
          participationId: participation.id,
          qrCode,
          status: p.used ? TicketStatus.USED : TicketStatus.VALID,
          checkedInAt: p.used ? new Date(event.dateTime.getTime() + 30 * 60 * 1000) : null,
        },
      });
      console.log(`  ✓ Participation + Ticket: ${p.user.email} -> ${event.title} [${p.used ? "USED" : "VALID"}]`);
    } else {
      console.log(`  ✓ Participation [PENDING]: ${p.user.email} -> ${event.title}`);
    }
  }

  // 7. CREATE INVITATIONS (AT LEAST 10+ REALISTIC INVITATIONS)
  console.log("\n✉️ Creating 10+ Realistic Event Invitations...");
  const invitationsList = [
    { user: superAdmin, eventIndex: 11, status: InvitationStatus.ACCEPTED },
    { user: admin, eventIndex: 11, status: InvitationStatus.ACCEPTED },
    { user: createdUsers["marcus.sterling@gmail.com"], eventIndex: 11, status: InvitationStatus.PENDING },
    { user: createdUsers["sophia.martinez@gmail.com"], eventIndex: 11, status: InvitationStatus.PENDING },

    { user: superAdmin, eventIndex: 3, status: InvitationStatus.ACCEPTED },
    { user: createdUsers["priya.sharma@gmail.com"], eventIndex: 3, status: InvitationStatus.PENDING },
    { user: createdUsers["daniel.lindqvist@gmail.com"], eventIndex: 3, status: InvitationStatus.ACCEPTED },

    { user: createdUsers["chloe.dupont@gmail.com"], eventIndex: 7, status: InvitationStatus.PENDING },
    { user: createdUsers["alex.vance@gmail.com"], eventIndex: 7, status: InvitationStatus.ACCEPTED },

    { user: createdUsers["elena.rostova@gmail.com"], eventIndex: 8, status: InvitationStatus.ACCEPTED },
    { user: createdUsers["liam.oconnor@gmail.com"], eventIndex: 8, status: InvitationStatus.DECLINED },
  ];

  for (const inv of invitationsList) {
    const event = createdEvents[inv.eventIndex];
    await prisma.invitation.create({
      data: {
        eventId: event.id,
        userId: inv.user.id,
        status: inv.status,
      },
    });
    console.log(`  ✓ Invitation [${inv.status}]: ${inv.user.email} for ${event.title}`);
  }

  // 8. CREATE REVIEWS (10+ REALISTIC REVIEWS)
  console.log("\n⭐ Creating 10+ Authentic Event Reviews...");
  const reviewsList = [
    {
      user: superAdmin,
      eventIndex: 10,
      rating: 5,
      comment:
        "Exceptional organization and brilliant presentations! The deep-dive into Next.js 15 Turbopack and Server Actions provided immense value. Everything was seamless from registration to Q&A.",
    },
    {
      user: createdUsers["alex.vance@gmail.com"],
      eventIndex: 10,
      rating: 5,
      comment:
        "One of the most informative developer conferences I've ever attended. The speakers were incredibly approachable and the venue acoustics were crystal clear.",
    },
    {
      user: createdUsers["liam.oconnor@gmail.com"],
      eventIndex: 10,
      rating: 4,
      comment:
        "Great content, brilliant technical workshops. The networking break felt a bit short, but the high-caliber discussions more than made up for it. Highly recommended!",
    },
    {
      user: createdUsers["sophia.martinez@gmail.com"],
      eventIndex: 0,
      rating: 5,
      comment:
        "The keynote lineup for this AI Summit is unmatched. The pre-event Discord discussions and materials provided in advance are top tier.",
    },
    {
      user: createdUsers["chloe.dupont@gmail.com"],
      eventIndex: 1,
      rating: 5,
      comment:
        "Outstanding curriculum! Learned how to architect enterprise Next.js applications with battle-tested patterns that immediately saved our team weeks of trial and error.",
    },
    {
      user: createdUsers["marcus.sterling@gmail.com"],
      eventIndex: 2,
      rating: 5,
      comment:
        "Pure magic at sunset. The acoustic atmosphere, cozy fire pits, and intimate performances made this festival the highlight of my summer.",
    },
    {
      user: createdUsers["priya.sharma@gmail.com"],
      eventIndex: 2,
      rating: 4,
      comment:
        "Mesmerizing sound and beautiful venue ambiance. The food trucks were diverse and line times were short. Can't wait for next year!",
    },
    {
      user: createdUsers["daniel.lindqvist@gmail.com"],
      eventIndex: 3,
      rating: 5,
      comment:
        "Invaluable networking. Had meaningful conversations with three venture firms who are now reviewing our seed round materials. Essential event for founders.",
    },
    {
      user: createdUsers["elena.rostova@gmail.com"],
      eventIndex: 4,
      rating: 5,
      comment:
        "A transformative morning of breathwork and sound meditation. Truly a sanctuary away from the hustle of urban tech life.",
    },
    {
      user: superAdmin,
      eventIndex: 8,
      rating: 5,
      comment:
        "Incredible sensory experience. The baristas explained extraction thermodynamics with engaging enthusiasm. The Ethiopian pour-over was divine.",
    },
  ];

  for (const rev of reviewsList) {
    const event = createdEvents[rev.eventIndex];
    await prisma.review.create({
      data: {
        userId: rev.user.id,
        eventId: event.id,
        rating: rev.rating,
        comment: rev.comment,
      },
    });
    console.log(`  ✓ Review [${rev.rating}★]: ${rev.user.name} on ${event.title}`);
  }

  // 9. CREATE 15 REALISTIC AUDIT LOGS
  console.log("\n📜 Creating 15 Realistic Audit Logs...");
  const auditLogsList = [
    {
      action: AuditAction.REGISTER,
      entityType: "user",
      entityId: superAdmin.id,
      description: "Super Admin account initialized and provisioned with root administrative privileges",
      actorId: superAdmin.id,
    },
    {
      action: AuditAction.REGISTER,
      entityType: "user",
      entityId: admin.id,
      description: "Platform administrator account provisioned",
      actorId: superAdmin.id,
    },
    {
      action: AuditAction.REGISTER,
      entityType: "user",
      entityId: organizer.id,
      description: "Verified event organizer account onboarded",
      actorId: admin.id,
    },
    {
      action: AuditAction.CREATE,
      entityType: "category",
      entityId: createdCategories[0].id,
      description: "Created category: Technology & AI",
      actorId: superAdmin.id,
    },
    {
      action: AuditAction.CREATE,
      entityType: "category",
      entityId: createdCategories[1].id,
      description: "Created category: Music & Festivals",
      actorId: admin.id,
    },
    {
      action: AuditAction.CREATE,
      entityType: "category",
      entityId: createdCategories[2].id,
      description: "Created category: Business & Startups",
      actorId: admin.id,
    },
    {
      action: AuditAction.CREATE,
      entityType: "event",
      entityId: createdEvents[0].id,
      description: "Created event: Global AI & NextGen Intelligent Systems Summit 2026",
      actorId: organizer.id,
    },
    {
      action: AuditAction.CREATE,
      entityType: "event",
      entityId: createdEvents[1].id,
      description: "Created event: Full-Stack TypeScript & Cloud Architecture Masterclass",
      actorId: organizer.id,
    },
    {
      action: AuditAction.CREATE,
      entityType: "banner",
      entityId: randomUUID(),
      description: "Promoted Global AI Summit to MAIN homepage hero banner",
      actorId: admin.id,
    },
    {
      action: AuditAction.UPDATE,
      entityType: "event",
      entityId: createdEvents[0].id,
      description: "Updated event details and confirmed keynote speaker allocations",
      actorId: organizer.id,
    },
    {
      action: AuditAction.LOGIN,
      entityType: "auth",
      entityId: organizer.id,
      description: "User logged in with credential provider via secure session",
      actorId: organizer.id,
    },
    {
      action: AuditAction.LOGIN,
      entityType: "auth",
      entityId: superAdmin.id,
      description: "Super Admin authenticated from authorized management IP",
      actorId: superAdmin.id,
    },
    {
      action: AuditAction.CREATE,
      entityType: "event",
      entityId: createdEvents[2].id,
      description: "Created event: Acoustic Sunset & Indie Music Festival 2026",
      actorId: organizer.id,
    },
    {
      action: AuditAction.UPDATE,
      entityType: "category",
      entityId: createdCategories[3].id,
      description: "Refined category description and updated banner imagery for Health & Wellness",
      actorId: admin.id,
    },
    {
      action: AuditAction.CREATE,
      entityType: "ticket",
      entityId: randomUUID(),
      description: "Issued verified QR entry ticket for participant",
      actorId: organizer.id,
    },
  ];

  for (const a of auditLogsList) {
    await prisma.auditLog.create({
      data: {
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        description: a.description,
        ipAddress: "192.168.1.10",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36",
        actorId: a.actorId,
      },
    });
  }
  console.log(`  ✓ 15 Audit logs successfully inserted.`);

  console.log("\n🎉 FULL DATABASE SEEDING FINISHED SUCCESSFULLY! 🎉");
  console.log("─────────────────────────────────────────────────────────────");
  console.log("🔑 Primary Seed Accounts (Password for all: 11111111):");
  console.log("  • Super Admin: moshfiqs.dev@gmail.com");
  console.log("  • Admin:       admin@gmail.com");
  console.log("  • Organizer:   organizer@gmail.com");
  console.log("─────────────────────────────────────────────────────────────\n");
}

seed()
  .catch((err) => {
    console.error("❌ Seeding failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
