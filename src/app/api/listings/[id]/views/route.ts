import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Server-Sent Events endpoint for real-time view count updates
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Set up SSE headers
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control, Accept',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Credentials': 'false'
    });

    // Get initial view count
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { viewCount: true }
    });
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Create a simple readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send initial view count immediately
        const initialData = `data: ${JSON.stringify({ viewCount: listing.viewCount })}\n\n`;
        controller.enqueue(encoder.encode(initialData));
        console.log('SSE: Sent initial view count:', listing.viewCount);

        // Set up interval to send updates every 5 seconds
        const interval = setInterval(async () => {
          try {
            const updatedListing = await prisma.listing.findUnique({
              where: { id },
              select: { viewCount: true }
            });
            
            if (updatedListing) {
              const data = `data: ${JSON.stringify({ viewCount: updatedListing.viewCount })}\n\n`;
              controller.enqueue(encoder.encode(data));
              console.log('SSE: Sent updated view count:', updatedListing.viewCount);
            }
          } catch (error) {
            console.error('SSE: Error fetching view count:', error);
          }
        }, 5000);

        // Clean up on close
        request.signal.addEventListener('abort', () => {
          console.log('SSE: Connection aborted, cleaning up');
          clearInterval(interval);
          controller.close();
        });
      }
    });

    return new Response(stream, { headers });
  } catch (error) {
    console.error('Error setting up SSE:', error);
    return NextResponse.json(
      { error: 'Failed to set up real-time updates' },
      { status: 500 }
    );
  }
}