import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Only initialize Stripe if the key is present
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any,
    })
  : null

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { bookingId, tutorName, subject, price, duration } = body
    const origin = req.headers.get('origin') || 'http://localhost:3000'
    const successPath = body.successPath || '/dashboard/parent/bookings'

    if (!stripe) {
      console.warn('STRIPE_SECRET_KEY not set — using mock success URL.')
      return NextResponse.json({ url: `${origin}${successPath}?success=true&booking_id=${bookingId}` })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'bhd',
            product_data: {
              name: `Tutoring Session: ${subject}`,
              description: `${duration} mins with ${tutorName}`,
            },
            unit_amount: Math.round(price * 1000), // BHD — 1 BHD = 1000 fils
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}${successPath}?success=true&booking_id=${bookingId}`,
      cancel_url:  `${origin}${successPath}?canceled=true`,
      metadata: { bookingId },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json(
      { error: err.message || 'Error creating checkout session' },
      { status: 500 }
    )
  }
}
