import { NextResponse } from 'next/server';
import { getServerGigs, addServerGig } from '@/lib/server-db';

export async function GET() {
  try {
    const gigs = await getServerGigs();
    return NextResponse.json({ success: true, gigs });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch gigs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.title || !body.venue) {
      return NextResponse.json({ success: false, error: 'Missing required gig fields' }, { status: 400 });
    }

    const newGig = {
      ...body,
      id: body.id || `g-${Date.now()}`
    };

    const saved = await addServerGig(newGig);
    return NextResponse.json({ success: true, gig: saved });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save gig log' }, { status: 500 });
  }
}
