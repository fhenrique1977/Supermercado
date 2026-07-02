import { useState, useEffect } from "react";

// ── Supabase client (troque pela sua URL e chave anon) ──────────────────────
const SUPABASE_URL = https://mivrvnarzjcefcqsgcwp.supabase.co/rest/v1/;
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pdnJ2bmFyempjZWZjcXNnY3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MzgzODMsImV4cCI6MjA5ODUxNDM4M30.7DJNLgf4rEGzEq95m_J6tfK9mdulpW0uSz1jRqCEfCQ;

async function supabase(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
}

const CATEGORIAS = [
  "Todos",
  "Hortifruti",
  "Laticínios",
  "Carnes",
  "Padaria",
  "Bebidas",
  "Limpeza",
  "Higiene",
  "Outros",
];

export default function App() {
  const [itens, setItens] = useState([]);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [categoria, setCategoria] = useState("Outros");
  const [filtro, setFiltro] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // ── Carregar itens ──────────────────────────────────────────────────────
  useEffect(() => {
    supabase("GET", "itens?order=criado_em.asc")
      .then(setItens)
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Adicionar item ──────────────────────────────────────────────────────
  async function adicionar() {
    const n = nome.trim();
    if (!n) return;
    try {
      const [novo] = await supabase("POST", "itens", {
        nome: n,
        quantidade: Number(quantidade) || 1,
        categoria,
        comprado: false,
      });
      setItens((prev) => [...prev, novo]);
      setNome("");
      setQuantidade("1");
    } catch (e) {
      setErro(e.message);
    }
  }

  // ── Marcar como comprado ────────────────────────────────────────────────
  async function toggleComprado(item) {
    try {
      await supabase("PATCH", `itens?id=eq.${item.id}`, {
        comprado: !item.comprado,
      });
      setItens((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, comprado: !i.comprado } : i
        )
      );
    } catch (e) {
      setErro(e.message);
    }
  }

  // ── Remover item ────────────────────────────────────────────────────────
  async function remover(id) {
    try {
      await supabase("DELETE", `itens?id=eq.${id}`);
      setItens((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      setErro(e.message);
    }
  }

  // ── Limpar comprados ────────────────────────────────────────────────────
  async function limparComprados() {
    const ids = itens.filter((i) => i.comprado).map((i) => i.id);
    if (!ids.length) return;
    try {
      await supabase("DELETE", `itens?id=in.(${ids.join(",")})`);
      setItens((prev) => prev.filter((i) => !i.comprado));
    } catch (e) {
      setErro(e.message);
    }
  }

  const itensFiltrados =
    filtro === "Todos" ? itens : itens.filter((i) => i.categoria === filtro);
  const totalComprados = itens.filter((i) => i.comprado).length;

  return (
    <div style={estilos.app}>
      <header style={estilos.header}>
        <h1 style={estilos.titulo}>🛒 Lista de Mercado</h1>
        <span style={estilos.badge}>
          {totalComprados}/{itens.length} itens
        </span>
      </header>

      {/* ── Formulário ── */}
      <div style={estilos.card}>
        <div style={estilos.row}>
          <input
            style={estilos.input}
            placeholder="Nome do item"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionar()}
          />
          <input
            style={{ ...estilos.input, width: 64 }}
            type="number"
            min="1"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />
        </div>
        <div style={estilos.row}>
          <select
            style={estilos.select}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {CATEGORIAS.filter((c) => c !== "Todos").map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button style={estilos.btnAdd} onClick={adicionar}>
            + Adicionar
          </button>
        </div>
      </div>

      {/* ── Filtro por categoria ── */}
      <div style={estilos.filtroRow}>
        {CATEGORIAS.map((c) => (
          <button
            key={c}
            style={{
              ...estilos.chip,
              ...(filtro === c ? estilos.chipAtivo : {}),
            }}
            onClick={() => setFiltro(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Lista ── */}
      {loading && <p style={estilos.msg}>Carregando...</p>}
      {erro && <p style={{ ...estilos.msg, color: "#e53e3e" }}>Erro: {erro}</p>}

      <ul style={estilos.lista}>
        {itensFiltrados.map((item) => (
          <li key={item.id} style={estilos.itemLi}>
            <button
              style={{
                ...estilos.check,
                ...(item.comprado ? estilos.checkFeito : {}),
              }}
              onClick={() => toggleComprado(item)}
            >
              {item.comprado ? "✓" : ""}
            </button>
            <div style={estilos.itemInfo}>
              <span
                style={{
                  ...estilos.itemNome,
                  ...(item.comprado ? estilos.riscado : {}),
                }}
              >
                {item.nome}
              </span>
              <span style={estilos.itemMeta}>
                {item.quantidade}× · {item.categoria}
              </span>
            </div>
            <button style={estilos.btnRemover} onClick={() => remover(item.id)}>
              ✕
            </button>
          </li>
        ))}
        {!loading && itensFiltrados.length === 0 && (
          <p style={estilos.msg}>Nenhum item ainda. Adicione acima!</p>
        )}
      </ul>

      {/* ── Rodapé ── */}
      {totalComprados > 0 && (
        <div style={estilos.footer}>
          <button style={estilos.btnLimpar} onClick={limparComprados}>
            Remover {totalComprados} comprado{totalComprados > 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const estilos = {
  app: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "16px 12px 80px",
    fontFamily: "'Inter', system-ui, sans-serif",
    backgroundColor: "#f7f8fa",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  titulo: { margin: 0, fontSize: 22, fontWeight: 700, color: "#1a202c" },
  badge: {
    background: "#e2e8f0",
    borderRadius: 99,
    padding: "4px 12px",
    fontSize: 13,
    color: "#4a5568",
    fontWeight: 600,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  row: { display: "flex", gap: 8 },
  input: {
    flex: 1,
    padding: "10px 12px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 15,
    outline: "none",
    background: "#f7f8fa",
  },
  select: {
    flex: 1,
    padding: "10px 12px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    background: "#f7f8fa",
  },
  btnAdd: {
    background: "#2f855a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  filtroRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  chip: {
    background: "#e2e8f0",
    border: "none",
    borderRadius: 99,
    padding: "5px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 500,
    color: "#4a5568",
  },
  chipAtivo: { background: "#2f855a", color: "#fff" },
  lista: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 },
  itemLi: {
    background: "#fff",
    borderRadius: 10,
    padding: "12px 10px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 6,
    border: "2px solid #cbd5e0",
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkFeito: { background: "#2f855a", border: "2px solid #2f855a" },
  itemInfo: { flex: 1, display: "flex", flexDirection: "column", gap: 2 },
  itemNome: { fontSize: 15, fontWeight: 500, color: "#2d3748" },
  riscado: { textDecoration: "line-through", color: "#a0aec0" },
  itemMeta: { fontSize: 12, color: "#718096" },
  btnRemover: {
    background: "none",
    border: "none",
    color: "#cbd5e0",
    fontSize: 16,
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1,
  },
  msg: { textAlign: "center", color: "#718096", padding: "24px 0", fontSize: 14 },
  footer: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "12px 16px",
    background: "#fff",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "center",
  },
  btnLimpar: {
    background: "#fff5f5",
    color: "#e53e3e",
    border: "1.5px solid #fc8181",
    borderRadius: 8,
    padding: "10px 20px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
};
