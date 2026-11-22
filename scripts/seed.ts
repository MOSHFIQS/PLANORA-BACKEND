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
      name: "Planora Super Admin",
      email: "admin@gmail.com",
      role: Role.SUPERADMIN,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Summit Events Organizer",
      email: "organizer@gmail.com",
      role: Role.ORGANIZER,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Moshfiqur Rahman",
      email: "moshfiqs.dev@gmail.com",
      role: Role.USER,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
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

  const superAdmin = createdUsers["admin@gmail.com"];
  const organizer = createdUsers["organizer@gmail.com"];
  const normalUser = createdUsers["moshfiqs.dev@gmail.com"];

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
      description: "Live concerts, electronic music festivals, acoustic twilight sessions, and symphony orchestra performances.",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Business & Startups",
      description: "Venture pitch competitions, executive roundtables, founder matchmaking, and angel investment summits.",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Health & Wellness",
      description: "Mindfulness retreats, biohacking conferences, sunrise yoga festivals, and athletic endurance showcases.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Arts & Culture",
      description: "Modern gallery retrospectives, theater premiers, documentary screenings, and creative workshops.",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Food & Culinary Arts",
      description: "Michelin-star tasting tours, street food festivals, artisan coffee brewing masterclasses, and wine expos.",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Education & Workshops",
      description: "Hands-on professional bootcamps, technical certifications, and design sprints.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Sports & Fitness",
      description: "Marathon runs, amateur tennis tournaments, rock-climbing showcases, and fitness expos.",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Gaming & Esports",
      description: "Competitive LAN tournaments, retro arcade exhibits, gaming hardware showcases, and cosplay conventions.",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Charity & Community",
      description: "Fundraising galas, volunteer mobilization drives, environmental cleanups, and community benefit auctions.",
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  const createdCategories: any[] = [];
  for (const c of categoriesData) {
    const cat = await prisma.category.create({
      data: {
        name: c.name,
        description: c.description,
        image: c.image,
      },
    });
    createdCategories.push(cat);
    console.log(`  ✓ Category: ${cat.name}`);
  }

  // 4. CREATE 17 REALISTIC EVENTS (INCLUDING 7 PRIVATE EVENTS)
  console.log("\n🎪 Creating 17 Realistic Events (with 7 Private Events)...");
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
      title: "SaaS Founders & Seed-to-Series-A Private Venture Forum",
      description:
        "Exclusive invite-only confidential symposium for 40+ active angel investors, venture partners, and repeat founders. Sessions include real-time pitch deck teardowns, unit economics audits, CAC/LTV benchmarks, and private matchmaking dinners for seed and pre-seed stage tech startups.",
      venue: "Metropolitan Pavilion, New York, NY",
      dateTime: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PRIVATE, // Private Event 1
      type: EventType.OFFLINE,
      fee: 0.0,
      images: [
        "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 2,
      organizerId: organizer.id,
    },
    {
      title: "Mindfulness, Breathwork & Sound Healing Retreat",
      description:
        "Escape the digital noise and reconnect with inner balance. Guided breathwork sessions, Tibetan singing bowl vibrational therapy, somatic movement rituals, and organic farm-to-table vegetarian luncheons set against peaceful misty pine forests.",
      venue: "Serenity Sanctuary Grounds, Boulder, CO",
      dateTime: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PUBLIC,
      type: EventType.OFFLINE,
      fee: 65.0,
      images: [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 3,
      organizerId: organizer.id,
    },
    {
      title: "Modern Sculpture & Contemporary Visual Arts Biennial",
      description:
        "Explore over 120 avant-garde installations, interactive digital projections, kinetic light sculptures, and large-format contemporary oil works by pioneering international creators. Includes curator-led gallery walks and artist Q&A forums.",
      venue: "District Arts Warehouse, Chicago, IL",
      dateTime: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PUBLIC,
      type: EventType.OFFLINE,
      fee: 20.0,
      images: [
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 4,
      organizerId: organizer.id,
    },
    {
      title: "Artisanal Coffee Roasting & Sensory Cupping Masterclass",
      description:
        "Step behind the roaster with award-winning Q-graders. Learn green coffee origin profiling, roast development thermodynamics, extraction variables, and participate in a guided blind cupping featuring micro-lots from Gesha, Yirgacheffe, and Huila.",
      venue: "Origin Roastery Labs, Portland, OR",
      dateTime: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PUBLIC,
      type: EventType.OFFLINE,
      fee: 45.0,
      images: [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 5,
      organizerId: organizer.id,
    },
    {
      title: "UX Research, Design Systems & Figma Architecture Sprint",
      description:
        "A rigorous, real-world remote design sprint focused on tokenized multi-brand design systems, automated accessibility auditing, micro-interactions with Rive, and qualitative user testing frameworks. Designed for product designers and frontend leads.",
      venue: "Planora Virtual Design Lab & Figma Org",
      dateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PUBLIC,
      type: EventType.ONLINE,
      meetingLink: "https://meet.google.com/ux-figma-pro",
      fee: 0.0,
      images: [
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 6,
      organizerId: organizer.id,
    },
    {
      title: "City Lights Midnight Half Marathon & 10K Endurance Run",
      description:
        "Lace up your trainers for an electric night run under the neon city skyline. Chip-timed courses with illuminated cheer zones, electrolyte fuel stations, customized finisher medals, and a lively post-race block party with food trucks and DJs.",
      venue: "Waterfront Promenade Starting Line, Miami, FL",
      dateTime: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PUBLIC,
      type: EventType.OFFLINE,
      fee: 40.0,
      images: [
        "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
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
    // Past event for reviews and checked-in tickets
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
    // PRIVATE EVENT 2:
    {
      title: "Private VIP Executive Roundtable: Tech Governance & AI Policy",
      description:
        "Exclusive invite-only confidential symposium for corporate directors, regulators, and venture general partners exploring compliance frameworks, data residency, and enterprise AI guardrails.",
      venue: "The Metropolitan Club, Washington, DC",
      dateTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PRIVATE, // Private Event 2
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
    // PRIVATE EVENT 3:
    {
      title: "Closed Cyber Security Red Team & Zero-Day Defense War Room",
      description:
        "A high-security, invitation-only tactical simulation for principal security engineers, threat intelligence analysts, and national defense contractors. Simulating sophisticated zero-day exploits, container breakouts, and multi-cloud perimeter defenses under realistic adversarial conditions.",
      venue: "Cyber Defense Bunker Suite 400, Reston, VA",
      dateTime: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PRIVATE, // Private Event 3
      type: EventType.OFFLINE,
      fee: 199.0,
      images: [
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 0,
      organizerId: organizer.id,
    },
    // PRIVATE EVENT 4:
    {
      title: "Fintech & High-Frequency Quantitative Trading Closed Summit",
      description:
        "Confidential virtual briefing on ultra-low latency FPGA network stacks, alternative data ingestion, and statistical arbitrage algorithms. Attendance strictly vetted for proprietary trading desks and algorithmic hedge fund partners.",
      venue: "Secure Virtual Trading Room (E2E Encrypted)",
      dateTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PRIVATE, // Private Event 4
      type: EventType.ONLINE,
      meetingLink: "https://meet.google.com/qnt-priv-fin",
      fee: 79.0,
      images: [
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 2,
      organizerId: organizer.id,
    },
    // PRIVATE EVENT 5:
    {
      title: "Venture Capital GP & LP Private Matchmaking Dinner",
      description:
        "An intimate black-tie dinner gathering 25 institutional Limited Partners and emerging fund managers representing over $4B in dry powder. Discussion covers secondary market liquidity, LP allocation trends, and cross-border fund governance.",
      venue: "The Pierre Hotel Grand Penthouse, Manhattan, NY",
      dateTime: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PRIVATE, // Private Event 5
      type: EventType.OFFLINE,
      fee: 0.0,
      images: [
        "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 2,
      organizerId: superAdmin.id,
    },
    // PRIVATE EVENT 6:
    {
      title: "NextGen Autonomous AI Agents Engineering Steering Committee",
      description:
        "Quarterly private roadmap synchronization and benchmark standardization council. Technical leads from leading AI labs review evaluations, tool-calling safety protocols, multi-agent communication schemas, and self-hosted model distillation.",
      venue: "Planora Private Cloud Video Auditorium",
      dateTime: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PRIVATE, // Private Event 6
      type: EventType.ONLINE,
      meetingLink: "https://meet.google.com/ai-steering-priv",
      fee: 0.0,
      images: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 0,
      organizerId: organizer.id,
    },
    // PRIVATE EVENT 7:
    {
      title: "Angel Syndicate & Family Office Private Dealflow Showcase",
      description:
        "Curated closed-door demo day where 8 pre-vetted stealth-stage AI and deep-tech startups present their working prototypes to principal family office investment directors and active syndicate leads.",
      venue: "Skyline Suite 88, Dubai International Financial Centre",
      dateTime: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
      visibility: EventVisibility.PRIVATE, // Private Event 7
      type: EventType.OFFLINE,
      fee: 150.0,
      images: [
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=1200&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryIndex: 2,
      organizerId: organizer.id,
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
    console.log(`  ✓ Event [${ed.visibility} - ${ed.type}]: ${event.title}`);
  }

  // 5. CREATE HOMEPAGE BANNERS
  console.log("\n🖼️ Creating Homepage Feature Banners...");
  const bannersData = [
    {
      title: "Experience the Future: Global AI Summit 2026",
      description: "Join 3,500+ world-class AI engineers and founders in San Francisco for the tech event of the year.",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1920&auto=format&fit=crop",
      position: BannerPosition.MAIN,
      positionOrder: 1,
      buttonText: "Explore Summit",
      altText: "Global AI Summit 2026 Banner",
      eventIndex: 0,
    },
    {
      title: "Under the Open Sky: Acoustic Sunset & Indie Music Fest",
      description: "Three open-air stages, twilight bonfires, and ethereal folk strings in Austin, Texas.",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1920&auto=format&fit=crop",
      position: BannerPosition.MAIN,
      positionOrder: 2,
      buttonText: "Get Festival Passes",
      altText: "Acoustic Music Fest Banner",
      eventIndex: 2,
    },
    {
      title: "Master High-Scale Web Architecture: Next.js 16 & NestJS",
      description: "Zero-downtime databases, edge caching, and scalable micro-services live masterclass.",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1920&auto=format&fit=crop",
      position: BannerPosition.SECONDARY,
      positionOrder: 1,
      buttonText: "Join Online Class",
      altText: "Web Architecture Masterclass Banner",
      eventIndex: 1,
    },
    {
      title: "Exclusive Private Executive Symposia on Tech Governance",
      description: "By-invitation closed summit for corporate directors and venture partners.",
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1920&auto=format&fit=crop",
      position: BannerPosition.SECONDARY,
      positionOrder: 2,
      buttonText: "Request Access",
      altText: "Executive Tech Governance Symposium Banner",
      eventIndex: 11,
    },
  ];

  for (const b of bannersData) {
    const event = createdEvents[b.eventIndex];
    const banner = await prisma.banner.create({
      data: {
        title: b.title,
        description: b.description,
        image: b.image,
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

  // 6. CREATE PARTICIPATIONS & TICKETS (NORMAL USER MOSHFIQUR + COMMUNITY)
  console.log("\n🎟️ Creating Participations & Verified Tickets...");

  const participantsList = [
    // Moshfiqur (Normal User) participations & tickets
    { user: normalUser, eventIndex: 0, status: ParticipationStatus.APPROVED, used: false },
    { user: normalUser, eventIndex: 1, status: ParticipationStatus.APPROVED, used: false },
    { user: normalUser, eventIndex: 2, status: ParticipationStatus.APPROVED, used: false },
    { user: normalUser, eventIndex: 3, status: ParticipationStatus.APPROVED, used: false }, // Accepted private event!
    { user: normalUser, eventIndex: 10, status: ParticipationStatus.APPROVED, used: true }, // Past event with used ticket!
    { user: normalUser, eventIndex: 11, status: ParticipationStatus.APPROVED, used: false }, // Accepted private roundtable!
    { user: normalUser, eventIndex: 4, status: ParticipationStatus.PENDING, used: false }, // Pending approval

    // Community Members
    { user: createdUsers["sophia.martinez@gmail.com"], eventIndex: 0, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["alex.vance@gmail.com"], eventIndex: 0, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["elena.rostova@gmail.com"], eventIndex: 0, status: ParticipationStatus.PENDING, used: false },
    { user: createdUsers["liam.oconnor@gmail.com"], eventIndex: 1, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["chloe.dupont@gmail.com"], eventIndex: 1, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["marcus.sterling@gmail.com"], eventIndex: 2, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["priya.sharma@gmail.com"], eventIndex: 2, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["daniel.lindqvist@gmail.com"], eventIndex: 3, status: ParticipationStatus.APPROVED, used: false },
    { user: createdUsers["sophia.martinez@gmail.com"], eventIndex: 3, status: ParticipationStatus.PENDING, used: false },
    { user: createdUsers["elena.rostova@gmail.com"], eventIndex: 4, status: ParticipationStatus.APPROVED, used: false },
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

  // 7. CREATE INVITATIONS (RICH INVITATIONS FOR PRIVATE EVENTS)
  console.log("\n✉️ Creating 15+ Realistic Event Invitations for Private Events...");
  const invitationsList = [
    // Invitations for normal user Moshfiqur (Accepted, Pending, Declined for dashboard testing!)
    { user: normalUser, eventIndex: 3, status: InvitationStatus.ACCEPTED }, // Private SaaS Forum (Accepted)
    { user: normalUser, eventIndex: 11, status: InvitationStatus.ACCEPTED }, // Private VIP Roundtable (Accepted)
    { user: normalUser, eventIndex: 12, status: InvitationStatus.PENDING }, // Private Cyber Security War Room (Pending - can accept in UI!)
    { user: normalUser, eventIndex: 13, status: InvitationStatus.PENDING }, // Private Fintech Summit (Pending - can accept in UI!)
    { user: normalUser, eventIndex: 14, status: InvitationStatus.DECLINED }, // Private VC Dinner (Declined)
    { user: normalUser, eventIndex: 15, status: InvitationStatus.PENDING }, // Private AI Steering Committee (Pending!)
    { user: normalUser, eventIndex: 16, status: InvitationStatus.PENDING }, // Private Angel Dealflow (Pending!)

    // Other users' invitations
    { user: createdUsers["marcus.sterling@gmail.com"], eventIndex: 11, status: InvitationStatus.PENDING },
    { user: createdUsers["sophia.martinez@gmail.com"], eventIndex: 11, status: InvitationStatus.ACCEPTED },
    { user: createdUsers["priya.sharma@gmail.com"], eventIndex: 12, status: InvitationStatus.PENDING },
    { user: createdUsers["daniel.lindqvist@gmail.com"], eventIndex: 12, status: InvitationStatus.ACCEPTED },
    { user: createdUsers["alex.vance@gmail.com"], eventIndex: 13, status: InvitationStatus.ACCEPTED },
    { user: createdUsers["chloe.dupont@gmail.com"], eventIndex: 14, status: InvitationStatus.PENDING },
    { user: createdUsers["elena.rostova@gmail.com"], eventIndex: 15, status: InvitationStatus.ACCEPTED },
    { user: createdUsers["liam.oconnor@gmail.com"], eventIndex: 16, status: InvitationStatus.DECLINED },
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

  // 8. CREATE REVIEWS FOR COMPLETED & PAST EVENTS
  console.log("\n⭐ Creating Realistic Attendee Reviews...");
  const reviewsList = [
    {
      user: normalUser,
      eventIndex: 10,
      rating: 5,
      comment:
        "The Turbopack deep dive was mind-blowing! Outstanding speaker lineup, seamless registration with Planora, and top-tier technical depth.",
    },
    {
      user: createdUsers["alex.vance@gmail.com"],
      eventIndex: 10,
      rating: 5,
      comment:
        "Easily the best technical conference I attended this past year. Met our current lead investor during the hall-way track networking session.",
    },
    {
      user: createdUsers["liam.oconnor@gmail.com"],
      eventIndex: 10,
      rating: 4,
      comment:
        "Fantastic insights on streaming SSR and cache tags. Venue Wi-Fi was rock-solid and the workshop labs were challenging.",
    },
    {
      user: normalUser,
      eventIndex: 0,
      rating: 5,
      comment:
        "The keynote on frontier autonomous agents exceeded all expectations. Incredible organization and venue setup.",
    },
    {
      user: createdUsers["sophia.martinez@gmail.com"],
      eventIndex: 0,
      rating: 5,
      comment:
        "A monumental event. The AI ethics breakout panel was particularly timely and sparked brilliant discussions.",
    },
    {
      user: normalUser,
      eventIndex: 2,
      rating: 5,
      comment:
        "The twilight bonfire set by the lake was pure magic. Perfect sound design and a warm, inclusive community atmosphere.",
    },
    {
      user: createdUsers["priya.sharma@gmail.com"],
      eventIndex: 2,
      rating: 4,
      comment:
        "Loved the indie acoustic arrangements and local food artisans. Can't wait for next year's edition!",
    },
    {
      user: createdUsers["marcus.sterling@gmail.com"],
      eventIndex: 8,
      rating: 5,
      comment:
        "Running along the midnight waterfront with neon illumination and cheering crowds was an absolute adrenaline rush. Flawless timing chips.",
    },
    {
      user: createdUsers["chloe.dupont@gmail.com"],
      eventIndex: 6,
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

  // 9. CREATE REALISTIC AUDIT LOGS
  console.log("\n📜 Creating Realistic Audit Logs...");
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
      entityId: organizer.id,
      description: "Verified event organizer account onboarded",
      actorId: superAdmin.id,
    },
    {
      action: AuditAction.REGISTER,
      entityType: "user",
      entityId: normalUser.id,
      description: "New platform community user registered and verified",
      actorId: normalUser.id,
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
      entityType: "event",
      entityId: createdEvents[0].id,
      description: "Created event: Global AI & NextGen Intelligent Systems Summit 2026",
      actorId: organizer.id,
    },
    {
      action: AuditAction.CREATE,
      entityType: "event",
      entityId: createdEvents[11].id,
      description: "Created private event: Private VIP Executive Roundtable",
      actorId: superAdmin.id,
    },
    {
      action: AuditAction.CREATE,
      entityType: "event",
      entityId: createdEvents[12].id,
      description: "Created private event: Closed Cyber Security Red Team War Room",
      actorId: organizer.id,
    },
    {
      action: AuditAction.CREATE,
      entityType: "banner",
      entityId: randomUUID(),
      description: "Promoted Global AI Summit to MAIN homepage hero banner",
      actorId: superAdmin.id,
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
  console.log(`  ✓ Audit logs successfully inserted.`);

  console.log("\n🎉 FULL DATABASE SEEDING FINISHED SUCCESSFULLY! 🎉");
  console.log("─────────────────────────────────────────────────────────────");
  console.log("🔑 Primary Seed Accounts (Password for all: 11111111):");
  console.log("  • Super Admin: admin@gmail.com     (Role: SUPERADMIN)");
  console.log("  • Organizer:   organizer@gmail.com (Role: ORGANIZER)");
  console.log("  • Normal User: moshfiqs.dev@gmail.com (Role: USER)");
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
