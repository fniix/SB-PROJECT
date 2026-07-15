import { redirect } from 'next/navigation'

export default function SessionsRedirectPage() {
  redirect('/dashboard/parent/bookings')
}
