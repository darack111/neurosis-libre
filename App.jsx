import React, { useState, useEffect } from 'react';
import { BookOpen, PenLine, Search, Settings, LogOut, X, Trash2, Lock } from 'lucide-react';
import { supabase } from './supabaseClient';

const TYPES = [
  { key: 'Poesia', label: 'Poesía', color: 'var(--indigo)' },
  { key: 'Pensamiento', label: 'Pensamiento', color: 'var(--brass)' },
  { key: 'Nota', label: 'Nota', color: 'var(--rust)' },
];

function typeInfo(key) {
  return TYPES.find((t) => t.key === key) || TYPES[0];
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function displayTitle(entry) {
  if (entry.title && entry.title.trim()) return entry.title.trim();
  const firstLine = (entry.content || '').split('\n')[0].trim();
  if (!firstLine) return 'Sin título';
  return firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine;
}

function inputStyle() {
  return {
    background: 'var(--card-alt)',
    border: '1px solid var(--line)',
    color: 'var(--ink)',
  };
}

// ---------- Pantalla de login / registro ----------

function AuthScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Contanos cómo te llamás.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('La clave necesita al menos 6 caracteres.');
        setLoading(false);
        return;
      }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim() } },
      });
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user && !data.session) {
        setInfo('Te mandamos un email para confirmar tu cuenta. Revisá tu casilla.');
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
    }
    setLoading(false);
  }

  async function handleForgotPassword() {
    setError('');
    setInfo('');
    if (!email) {
      setError('Escribí tu email primero, así te mandamos el link.');
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (resetError) setError(resetError.message);
    else setInfo('Te mandamos un email con un link para elegir una clave nueva.');
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div
        className="w-full max-w-sm rounded-sm p-8 shadow-sm"
        style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
      >
        {mode === 'login' ? (
          <Lock size={20} style={{ color: 'var(--indigo)' }} className="mb-4" />
        ) : (
          <BookOpen size={20} style={{ color: 'var(--indigo)' }} className="mb-4" />
        )}
        <h1 className="font-display text-2xl mb-1" style={{ color: 'var(--ink)' }}>
          {mode === 'login' ? 'Tu archivo personal' : 'Creá tu espacio'}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
          {mode === 'login'
            ? 'Poesías, pensamientos, notas. Todo tuyo, todo guardado.'
            : 'Un lugar propio para lo que escribís.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="font-mono text-xs uppercase tracking-wide block mb-1" style={{ color: 'var(--ink-soft)' }}>
                ¿Cómo te llamás?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-sm outline-none text-sm"
                style={inputStyle()}
                placeholder="Tu nombre"
              />
            </div>
          )}
          <div>
            <label className="font-mono text-xs uppercase tracking-wide block mb-1" style={{ color: 'var(--ink-soft)' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-sm outline-none text-sm"
              style={inputStyle()}
              placeholder="vos@email.com"
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wide block mb-1" style={{ color: 'var(--ink-soft)' }}>
              Clave
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-sm outline-none text-sm"
              style={inputStyle()}
              placeholder="Al menos 6 caracteres"
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--rust)' }}>
              {error}
            </p>
          )}
          {info && (
            <p className="text-sm" style={{ color: 'var(--indigo)' }}>
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-sm font-mono text-sm tracking-wide"
            style={{ background: 'var(--indigo)', color: 'var(--card-alt)' }}
          >
            {loading ? 'Un momento...' : mode === 'login' ? 'Entrar' : 'Crear mi espacio'}
          </button>
        </form>

        {mode === 'login' && (
          <button
            onClick={handleForgotPassword}
            className="text-xs mt-4 underline block"
            style={{ color: 'var(--ink-soft)' }}
          >
            Olvidé mi clave
          </button>
        )}

        <p className="text-sm mt-6" style={{ color: 'var(--ink-soft)' }}>
          {mode === 'login' ? (
            <>
              ¿Primera vez acá?{' '}
              <button
                onClick={() => { setMode('signup'); setError(''); setInfo(''); }}
                className="underline"
                style={{ color: 'var(--indigo)' }}
              >
                Creá tu cuenta
              </button>
            </>
          ) : (
            <>
              ¿Ya tenés cuenta?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); setInfo(''); }}
                className="underline"
                style={{ color: 'var(--indigo)' }}
              >
                Entrá
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// ---------- App principal (una vez logueado) ----------

function MainApp({ session }) {
  const user = session.user;
  const name = user.user_metadata && user.user_metadata.name ? user.user_metadata.name : user.email;

  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [showSettings, setShowSettings] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [writing, setWriting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formType, setFormType] = useState('Poesia');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');
  const [clearText, setClearText] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadEntries() {
    setLoadingEntries(true);
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setErrorMsg('No pudimos cargar tu archivo. Probá recargar la página.');
    else setEntries(data || []);
    setLoadingEntries(false);
  }

  function startNewEntry() {
    setEditingId(null);
    setFormType('Poesia');
    setFormTitle('');
    setFormContent('');
    setWriting(true);
    setExpandedId(null);
  }

  function startEdit(entry) {
    setEditingId(entry.id);
    setFormType(entry.type);
    setFormTitle(entry.title || '');
    setFormContent(entry.content);
    setWriting(true);
  }

  function cancelWriting() {
    setWriting(false);
    setEditingId(null);
  }

  async function handleSaveEntry(e) {
    e.preventDefault();
    if (!formContent.trim()) return;
    setErrorMsg('');
    if (editingId) {
      const { data, error } = await supabase
        .from('entries')
        .update({ type: formType, title: formTitle.trim(), content: formContent, updated_at: new Date().toISOString() })
        .eq('id', editingId)
        .select()
        .single();
      if (error) setErrorMsg('No se pudo guardar el cambio.');
      else setEntries(entries.map((en) => (en.id === editingId ? data : en)));
    } else {
      const { data, error } = await supabase
        .from('entries')
        .insert({ user_id: user.id, type: formType, title: formTitle.trim(), content: formContent })
        .select()
        .single();
      if (error) setErrorMsg('No se pudo guardar el escrito.');
      else setEntries([data, ...entries]);
    }
    setWriting(false);
    setEditingId(null);
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (error) setErrorMsg('No se pudo borrar.');
    else setEntries(entries.filter((en) => en.id !== id));
    setConfirmDeleteId(null);
    setExpandedId(null);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setSettingsMsg('');
    if (newPassword.length < 6) {
      setSettingsMsg('La clave nueva necesita al menos 6 caracteres.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setSettingsMsg('Las claves no coinciden.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setSettingsMsg(error.message);
    else {
      setSettingsMsg('Clave actualizada.');
      setNewPassword('');
      setNewPasswordConfirm('');
    }
  }

  async function handleClearAll() {
    if (clearText !== 'BORRAR') return;
    const { error } = await supabase.from('entries').delete().eq('user_id', user.id);
    if (error) setErrorMsg('No se pudo vaciar el archivo.');
    else setEntries([]);
    setConfirmClear(false);
    setClearText('');
    setShowSettings(false);
  }

  const filtered = entries
    .filter((en) => filterType === 'Todos' || en.type === filterType)
    .filter((en) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (en.title || '').toLowerCase().includes(q) || (en.content || '').toLowerCase().includes(q);
    });

  return (
    <div className="w-full min-h-screen p-4 sm:p-6" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={18} style={{ color: 'var(--indigo)' }} />
              <h1 className="font-display text-2xl" style={{ color: 'var(--ink)' }}>
                Archivo de {name}
              </h1>
            </div>
            <p className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
              {loadingEntries ? 'Cargando...' : `${entries.length} ${entries.length === 1 ? 'escrito guardado' : 'escritos guardados'}`}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-sm" style={{ color: 'var(--ink-soft)' }} aria-label="Configuración">
              <Settings size={18} />
            </button>
            <button onClick={() => supabase.auth.signOut()} className="p-2 rounded-sm" style={{ color: 'var(--ink-soft)' }} aria-label="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 px-4 py-2 rounded-sm text-sm" style={{ background: '#F1E3DC', color: 'var(--rust)' }}>
            {errorMsg}
          </div>
        )}

        {showSettings && (
          <div className="mb-6 rounded-sm p-5" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg" style={{ color: 'var(--ink)' }}>Configuración</h2>
              <button onClick={() => setShowSettings(false)} style={{ color: 'var(--ink-soft)' }} aria-label="Cerrar"><X size={18} /></button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 mb-6">
              <label className="font-mono text-xs uppercase tracking-wide block" style={{ color: 'var(--ink-soft)' }}>Cambiar mi clave</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Clave nueva" className="w-full px-3 py-2 rounded-sm outline-none text-sm" style={inputStyle()} />
              <input type="password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} placeholder="Repetila" className="w-full px-3 py-2 rounded-sm outline-none text-sm" style={inputStyle()} />
              {settingsMsg && (
                <p className="text-sm" style={{ color: settingsMsg === 'Clave actualizada.' ? 'var(--indigo)' : 'var(--rust)' }}>{settingsMsg}</p>
              )}
              <button type="submit" className="px-4 py-2 rounded-sm font-mono text-xs tracking-wide" style={{ background: 'var(--indigo)', color: 'var(--card-alt)' }}>
                Guardar clave nueva
              </button>
            </form>

            <div className="pt-4" style={{ borderTop: '1px solid var(--line)' }}>
              <label className="font-mono text-xs uppercase tracking-wide block mb-2" style={{ color: 'var(--rust)' }}>Vaciar el archivo</label>
              {!confirmClear ? (
                <button onClick={() => setConfirmClear(true)} className="text-sm underline" style={{ color: 'var(--rust)' }}>
                  Borrar todos los escritos
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
                    Esto borra los {entries.length} escritos guardados y no se puede deshacer. Escribí BORRAR para confirmar.
                  </p>
                  <input type="text" value={clearText} onChange={(e) => setClearText(e.target.value)} className="w-full px-3 py-2 rounded-sm outline-none text-sm" style={inputStyle()} placeholder="BORRAR" />
                  <div className="flex gap-2">
                    <button onClick={() => { setConfirmClear(false); setClearText(''); }} className="px-3 py-1.5 rounded-sm text-xs font-mono" style={{ color: 'var(--ink-soft)', border: '1px solid var(--line)' }}>Cancelar</button>
                    <button onClick={handleClearAll} disabled={clearText !== 'BORRAR'} className="px-3 py-1.5 rounded-sm text-xs font-mono" style={{ background: clearText === 'BORRAR' ? 'var(--rust)' : 'var(--line)', color: 'var(--card-alt)' }}>
                      Borrar todo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!writing ? (
          <button onClick={startNewEntry} className="w-full mb-6 flex items-center justify-center gap-2 py-3 rounded-sm font-mono text-sm tracking-wide" style={{ background: 'var(--indigo)', color: 'var(--card-alt)' }}>
            <PenLine size={16} />
            Escribir algo nuevo
          </button>
        ) : (
          <form onSubmit={handleSaveEntry} className="mb-6 rounded-sm p-5" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <h2 className="font-display text-lg mb-4" style={{ color: 'var(--ink)' }}>
              {editingId ? 'Editar escrito' : 'Escribir algo nuevo'}
            </h2>
            <div className="flex gap-2 mb-4">
              {TYPES.map((t) => (
                <button type="button" key={t.key} onClick={() => setFormType(t.key)} className="px-3 py-1.5 rounded-full text-xs font-mono tracking-wide"
                  style={{ background: formType === t.key ? t.color : 'transparent', color: formType === t.key ? 'var(--card-alt)' : t.color, border: `1px solid ${t.color}` }}>
                  {t.label}
                </button>
              ))}
            </div>
            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Título (opcional)" className="w-full px-3 py-2 mb-3 rounded-sm outline-none font-display text-lg" style={inputStyle()} />
            <textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} placeholder="Escribí acá..." rows={9} autoFocus className="w-full px-3 py-3 mb-4 rounded-sm outline-none font-write text-base leading-relaxed resize-y" style={inputStyle()} />
            <div className="flex gap-2">
              <button type="submit" className="px-5 py-2 rounded-sm font-mono text-xs tracking-wide" style={{ background: 'var(--indigo)', color: 'var(--card-alt)' }}>Guardar</button>
              <button type="button" onClick={cancelWriting} className="px-5 py-2 rounded-sm font-mono text-xs tracking-wide" style={{ color: 'var(--ink-soft)', border: '1px solid var(--line)' }}>Cancelar</button>
            </div>
          </form>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-soft)' }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar en tu archivo" className="w-full pl-9 pr-3 py-2 rounded-sm outline-none text-sm" style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }} />
          </div>
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {['Todos', ...TYPES.map((t) => t.key)].map((key) => {
            const label = key === 'Todos' ? 'Todos' : typeInfo(key).label;
            const color = key === 'Todos' ? 'var(--ink)' : typeInfo(key).color;
            const active = filterType === key;
            return (
              <button key={key} onClick={() => setFilterType(key)} className="px-3 py-1 rounded-full text-xs font-mono tracking-wide"
                style={{ background: active ? color : 'transparent', color: active ? 'var(--card-alt)' : color, border: `1px solid ${color}` }}>
                {label}
              </button>
            );
          })}
        </div>

        {loadingEntries ? (
          <p className="font-mono text-sm text-center py-10" style={{ color: 'var(--ink-soft)' }}>Cargando tu archivo...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 rounded-sm" style={{ background: 'var(--card)', border: '1px dashed var(--line)' }}>
            <p className="font-display text-lg mb-1" style={{ color: 'var(--ink)' }}>
              {entries.length === 0 ? 'Todavía no hay nada guardado.' : 'No encontré nada con esa búsqueda.'}
            </p>
            <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
              {entries.length === 0 ? 'Escribí lo primero.' : 'Probá con otra palabra.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry) => {
              const info = typeInfo(entry.type);
              const expanded = expandedId === entry.id;
              return (
                <div key={entry.id} className="rounded-sm p-4 cursor-pointer" style={{ background: 'var(--card)', border: '1px solid var(--line)' }} onClick={() => setExpandedId(expanded ? null : entry.id)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>N.º {String(entry.number || 0).padStart(3, '0')}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono" style={{ background: info.color, color: 'var(--card-alt)' }}>{info.label}</span>
                    </div>
                    <span className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>{formatDate(entry.created_at)}</span>
                  </div>
                  <h3 className="font-display text-lg mb-1" style={{ color: 'var(--ink)' }}>{displayTitle(entry)}</h3>
                  <p className={`font-write text-sm leading-relaxed whitespace-pre-wrap ${expanded ? '' : 'line-clamp-3'}`} style={{ color: 'var(--ink)' }}>{entry.content}</p>

                  {expanded && (
                    <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: '1px solid var(--line)' }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => startEdit(entry)} className="px-3 py-1.5 rounded-sm text-xs font-mono" style={{ color: 'var(--indigo)', border: '1px solid var(--indigo)' }}>Editar</button>
                      {confirmDeleteId === entry.id ? (
                        <>
                          <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>¿Borrar este escrito?</span>
                          <button onClick={() => handleDelete(entry.id)} className="px-3 py-1.5 rounded-sm text-xs font-mono" style={{ background: 'var(--rust)', color: 'var(--card-alt)' }}>Sí, borrar</button>
                          <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 rounded-sm text-xs font-mono" style={{ color: 'var(--ink-soft)', border: '1px solid var(--line)' }}>Cancelar</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(entry.id)} className="p-1.5 rounded-sm" style={{ color: 'var(--rust)' }} aria-label="Borrar"><Trash2 size={14} /></button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Componente raíz ----------

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p className="font-mono text-sm" style={{ color: 'var(--ink-soft)' }}>Abriendo tu archivo...</p>
      </div>
    );
  }

  return session ? <MainApp session={session} /> : <AuthScreen />;
}
