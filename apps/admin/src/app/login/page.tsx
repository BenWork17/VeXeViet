'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, loadSession, signIn } from '@/lib/api';

/**
 * Real credential sign-in (§8). The demo buttons and the demo-session helper are
 * gone (D6/D7); the only way to a session is a successful `POST /auth/login`.
 *
 * Two failure registers are kept distinct on purpose (§10.7): a server refusal
 * renders the service's own message (a suspended account answers
 * `Invalid credentials`, exactly as a wrong password does — O5, and the console
 * must not invent "account suspended" copy), while a transport failure says
 * something only the client can know.
 */
const NETWORK_MESSAGE = 'Không kết nối được tới máy chủ API. Kiểm tra mạng hoặc cấu hình NEXT_PUBLIC_API_URL rồi thử lại.';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // An already-authenticated admin lands on the dashboard rather than on a
    // second login form. Deferred until after the first render so the page
    // never flashes a redirect before storage has been read.
    if (loadSession()) router.replace('/dashboard');
    else setChecked(true);
  }, [router]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    setError(null);
    setPending(true);

    try {
      await signIn(email.trim(), password);
      router.replace('/dashboard');
    } catch (failure) {
      if (failure instanceof ApiError) {
        if (failure.failure.code === 'NETWORK_ERROR') setError(NETWORK_MESSAGE);
        else setError(failure.failure.message);
      } else {
        setError(NETWORK_MESSAGE);
      }
      setPending(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-ground px-4 py-10">
      <section className="w-full max-w-[380px] rounded-sheet border border-border bg-sheet px-6 py-7">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-4 w-[2px] bg-accent" />
          <span className="text-small font-semibold text-muted">VeXeViet Operations</span>
        </div>

        <h1 className="mt-4 font-display text-title font-normal text-ink">Đăng nhập quản trị</h1>
        <p className="mt-1 text-[13px] leading-5 text-muted">
          Dùng tài khoản quản trị hoặc tài khoản nhà xe do hệ thống cấp.
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-ink">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ten@nhaxe.vn"
              disabled={pending}
              className="h-9 rounded-control border border-control bg-sheet px-3 text-[13px] text-ink transition-colors duration-[120ms] placeholder:text-muted focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:border-rule disabled:bg-raised disabled:text-muted"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-ink">Mật khẩu</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={pending}
              className="h-9 rounded-control border border-control bg-sheet px-3 text-[13px] text-ink transition-colors duration-[120ms] focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:border-rule disabled:bg-raised disabled:text-muted"
            />
          </label>

          {error ? (
            <p role="alert" className="rounded-control border border-pill-negative-bg bg-pill-negative-bg px-3 py-2 text-[13px] leading-5 text-pill-negative-ink">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || !checked}
            className="inline-flex h-9 w-full items-center justify-center rounded-control bg-ink px-3 text-[13px] font-semibold text-white transition-colors duration-[120ms] hover:bg-[#292524] disabled:cursor-not-allowed disabled:bg-raised disabled:text-muted"
          >
            {pending ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-5 border-t border-rule pt-4 text-small leading-5 text-muted">
          ADMIN xem toàn hệ thống. OPERATOR chỉ thấy dashboard, booking, thanh toán và tuyến thuộc nhà xe của mình.
        </p>
      </section>
    </main>
  );
}
