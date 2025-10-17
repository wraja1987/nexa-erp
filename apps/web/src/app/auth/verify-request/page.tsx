export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function VerifyRequest(){
  return (
    <main className="min-h-screen w-full grid place-items-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-8 text-center">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="mt-2 text-gray-600 text-sm">We’ve sent you a sign-in link. It expires shortly.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a href="/login" className="rounded-lg bg-blue-600 text-white px-4 py-2.5 font-medium">Back to login</a>
          <a href="/auth/forgot-password" className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 font-medium">Resend link</a>
        </div>
      </div>
    </main>
  );
}


