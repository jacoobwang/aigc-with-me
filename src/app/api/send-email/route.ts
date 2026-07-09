import { getItemInfoById } from '@/data/item';
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/mail';
import { PricePlans } from '@/lib/submission';
import { getDashboardLink, getItemLinkInWebsite } from '@/lib/utils';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

function isValidOrigin(requestHeaders: Headers): boolean {
  const origin = requestHeaders.get('origin');
  const referer = requestHeaders.get('referer');
  console.log('isValidOrigin, origin', origin);
  console.log('isValidOrigin, referer', referer);

  const allowedDomains = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3300'
  ].filter(Boolean);

  return allowedDomains.some(domain => 
    origin?.includes(domain as string) ||
    referer?.includes(domain as string)
  );
}

export async function POST(request: Request) {
  try {
    // check if the request is from a valid origin
    const headersList = headers();
    if (!isValidOrigin(headersList)) {
      return NextResponse.json(
        { message: 'Unauthorized request origin' },
        { status: 403 }
      );
    }

    const { itemId } = await request.json();
    const item = await getItemInfoById(itemId);
    if (!item || !item.submitter) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }

    console.log(`SendEmail, itemName: ${item.name}, 
        userName: ${item.submitter.name}, 
        userEmail: ${item.submitter.email}`);

    // only send email for items in free plan and is approved or rejected
    if (item.pricePlan === PricePlans.FREE) {
      if (item.freePlanStatus === "approved") {
        const itemLink = getItemLinkInWebsite(item.slug.current);
        await sendApprovalEmail(item.submitter.name, item.submitter.email, itemLink);
      } else if (item.freePlanStatus === "rejected") {
        const dashboardLink = getDashboardLink();
        await sendRejectionEmail(item.submitter.name, item.submitter.email, dashboardLink);
      } else {
        console.warn(`SendEmail, item ${item.name} is not approved or rejected`);
        return NextResponse.json({ message: 'No email sent' }, { status: 200 });
      }
    } else {
      console.warn(`SendEmail, item ${item.name} is not free plan`);
      return NextResponse.json({ message: 'No email sent' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: 'Failed to send email' },
      { status: 500 }
    );
  }
}
