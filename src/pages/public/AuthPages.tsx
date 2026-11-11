import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '../../api/http';
import type { UserOut } from '../../api/types';
import { Logo } from '../../components/layout/Logo';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../hooks/useToast';

interface LocationState {
  from?: string;
}

/** Куди повернути користувача після входу. */
function useRedirectTarget() {
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from;
  return (user: UserOut) => {
    if (from && from !== '/login' && from !== '/register') return from;
    return user.role === 'admin' ? '/admin' : '/cabinet';
  };
}

function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <Logo size={48} />
        </div>
        <h1 className="auth-card__title">{title}</h1>
        <p className="auth-card__subtitle">{subtitle}</p>
        {children}
        <div className="auth-card__footer">{footer}</div>
      </div>
    </div>
  );
}

export function LoginPage() {
  useDocumentTitle('Вхід');
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const redirectTarget = useRedirectTarget();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (user && !pending) return <Navigate to={redirectTarget(user)} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const u = await login({ email: email.trim(), password });
      toast.success(`Вітаємо, ${u.full_name}!`);
      navigate(redirectTarget(u), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Вхід до кабінету"
      subtitle="Увійдіть, щоб бронювати номери та накопичувати бонуси."
      footer={
        <>
          Ще немає акаунту?{' '}
          <Link to="/register" state={location.state}>
            Зареєструватися
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className="input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Пароль</label>
          <input
            id="login-password"
            className="input"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn--dark btn--lg btn--block" disabled={pending}>
          {pending ? 'Вхід…' : 'Увійти'}
        </button>
        <div className="auth-hint">
          <strong>Тестові акаунти:</strong>
          <button type="button" className="link-btn" onClick={() => { setEmail('client@hotel.ua'); setPassword('client123'); }}>
            client@hotel.ua / client123
          </button>
          <button type="button" className="link-btn" onClick={() => { setEmail('admin@hotel.ua'); setPassword('admin123'); }}>
            admin@hotel.ua / admin123
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  useDocumentTitle('Реєстрація');
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const redirectTarget = useRedirectTarget();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (user && !pending) return <Navigate to={redirectTarget(user)} replace />;

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      setError('Пароль має містити щонайменше 6 символів');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Паролі не збігаються');
      return;
    }
    setPending(true);
    try {
      const u = await register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        password: form.password,
      });
      toast.success('Акаунт створено. Ласкаво просимо!');
      navigate(redirectTarget(u), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Реєстрація"
      subtitle="Створіть акаунт гостя — це займе менше хвилини."
      footer={
        <>
          Вже маєте акаунт?{' '}
          <Link to="/login" state={location.state}>
            Увійти
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="field">
          <label htmlFor="reg-name">ПІБ</label>
          <input id="reg-name" className="input" required autoComplete="name" value={form.full_name} onChange={set('full_name')} />
        </div>
        <div className="field">
          <label htmlFor="reg-email">Email</label>
          <input id="reg-email" className="input" type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
        </div>
        <div className="field">
          <label htmlFor="reg-phone">Телефон (необов’язково)</label>
          <input
            id="reg-phone"
            className="input"
            type="tel"
            autoComplete="tel"
            placeholder="+380…"
            value={form.phone}
            onChange={set('phone')}
          />
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="reg-pass">Пароль</label>
            <input
              id="reg-pass"
              className="input"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
            />
          </div>
          <div className="field">
            <label htmlFor="reg-confirm">Повторіть пароль</label>
            <input
              id="reg-confirm"
              className="input"
              type="password"
              required
              autoComplete="new-password"
              value={form.confirm}
              onChange={set('confirm')}
            />
          </div>
        </div>
        <button type="submit" className="btn btn--dark btn--lg btn--block" disabled={pending}>
          {pending ? 'Створення…' : 'Зареєструватися'}
        </button>
      </form>
    </AuthShell>
  );
}
