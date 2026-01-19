import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Find FREE plan
    const freePlan = await prisma.subscriptionPlan.findFirst({
      where: { tier: 'FREE' },
    });

    if (!freePlan) {
      console.error('❌ FREE plan not found!');
      return;
    }

    console.log(`✅ Found FREE plan: ${freePlan.name} (${freePlan.id})`);

    // Get all tenant subscriptions
    const subscriptions = await prisma.tenantSubscription.findMany({
      include: {
        plan: true,
        tenant: true,
      },
    });

    console.log(`\n📋 Found ${subscriptions.length} subscription(s)`);

    // Update all to FREE
    for (const sub of subscriptions) {
      if (sub.planId === freePlan.id) {
        console.log(
          `⏭️  Tenant "${sub.tenant.name}" already on FREE plan, skipping...`,
        );
        continue;
      }

      await prisma.tenantSubscription.update({
        where: { tenantId: sub.tenantId },
        data: {
          planId: freePlan.id,
          updatedAt: new Date(),
        },
      });

      console.log(
        `✅ Reset tenant "${sub.tenant.name}" from ${sub.plan.tier} to FREE`,
      );
    }

    console.log('\nDone! All subscriptions reset to FREE plan');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
