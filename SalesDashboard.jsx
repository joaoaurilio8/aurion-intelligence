import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, LabelList,
  LineChart, Line, CartesianGrid, Tooltip, ReferenceLine,
  FunnelChart, Funnel, LabelList as FunnelLabel,
} from "recharts";

/* ============================================================================
   DASHBOARD DE VENDAS — uso diário, monitoramento de relance (uma tela)
   Princípios embutidos: data-ink máximo (Tufte), bullet no lugar de gauge (Few),
   barra ordenada no lugar de pizza (Wilkinson), cinza padrão + 1 cor funcional
   (Knaflic), eixo no zero / integridade gráfica (Tufte), tidy data (Wickham).
   ⚠️ TODOS OS DADOS SÃO MOCK DECLARADO — plugar na fonte real (CRM/API).
   ============================================================================ */

// ---- Paleta funcional (cor = significado, não decoração) --------------------
const CINZA   = "#9aa0a6";  // padrão neutro
const TINTA   = "#3c4043";  // texto/dado principal
const ALERTA  = "#d93025";  // abaixo da meta
const OK      = "#1a73e8";  // foco positivo (acumulado no ritmo)
const TRILHO  = "#e8eaed";  // faixa de contexto / trilho
const brl  = (v) => `R$ ${(v / 1000).toFixed(0)}k`;
const brlF = (v) => `R$ ${v.toLocaleString("pt-BR")}`;

// ---- MOCK ------------------------------------------------------------------
const META_MES = 800000;
const RECEITA_MES = 847000;

const vendedores = [
  { vendedor: "Ana Souza",    receita: 182000, meta: 150000 },
  { vendedor: "Bruno Lima",   receita: 154000, meta: 150000 },
  { vendedor: "Carla Mendes", receita: 121000, meta: 150000 },
  { vendedor: "Diego Rocha",  receita: 98000,  meta: 150000 },
  { vendedor: "Eva Martins",  receita: 76000,  meta: 150000 },
].sort((a, b) => b.receita - a.receita);

// acumulado diário vs. linha de meta proporcional (tidy: 1 linha = 1 dia)
const tendencia = [
  { dia: "01", real: 32,  meta: 27 }, { dia: "05", real: 145, meta: 133 },
  { dia: "10", real: 268, meta: 267 }, { dia: "15", real: 402, meta: 400 },
  { dia: "20", real: 561, meta: 533 }, { dia: "25", real: 712, meta: 667 },
  { dia: "30", real: 847, meta: 800 },
]; // em R$ mil

const funil = [
  { etapa: "Leads",       valor: 1200, fill: CINZA },
  { etapa: "Qualificados", valor: 540, fill: CINZA },
  { etapa: "Proposta",    valor: 210,  fill: CINZA },
  { etapa: "Fechado",     valor: 86,   fill: OK   },
];

// ---- Bullet graph (Few): valor + meta + faixas. Substitui o gauge ----------
function Bullet({ valor, meta, max }) {
  const pct = (v) => `${(v / max) * 100}%`;
  const bateu = valor >= meta;
  return (
    <div style={{ position: "relative", height: 38, marginTop: 8 }}>
      {/* faixas de contexto em cinza claro (ruim→bom) */}
      <div style={{ position: "absolute", inset: 0, background: TRILHO, borderRadius: 4 }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: pct(meta * 0.75), background: "#f1f3f4", borderRadius: "4px 0 0 4px" }} />
      {/* barra do valor medida (fina, centralizada) */}
      <div style={{ position: "absolute", top: 11, bottom: 11, left: 0,
        width: pct(valor), background: bateu ? OK : ALERTA, borderRadius: 3 }} />
      {/* marcador de meta (tracinho vertical) */}
      <div style={{ position: "absolute", top: 2, bottom: 2, left: pct(meta), width: 3, background: TINTA }} />
    </div>
  );
}

// ---- Card wrapper (espaço em branco separa, sem moldura pesada) -------------
const Card = ({ title, sub, children, span = 1 }) => (
  <section style={{
    gridColumn: `span ${span}`, background: "#fff", borderRadius: 10,
    padding: "16px 18px", boxShadow: "0 1px 2px rgba(0,0,0,.06)",
  }}>
    <h3 style={{ font: "600 14px system-ui", color: TINTA, margin: 0 }}>{title}</h3>
    {sub && <p style={{ font: "12px system-ui", color: "#5f6368", margin: "2px 0 0" }}>{sub}</p>}
    {children}
  </section>
);

export default function SalesDashboard() {
  const bateuMeta = RECEITA_MES >= META_MES;
  return (
    <div style={{ background: "#f8f9fa", padding: 20, font: "system-ui",
      display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr",
      maxWidth: 980, margin: "0 auto" }}>

      <header style={{ gridColumn: "span 2", display: "flex",
        justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ font: "700 20px system-ui", color: TINTA, margin: 0 }}>Vendas — Junho/2026</h1>
        <span style={{ font: "12px system-ui", color: "#5f6368" }}>⚠️ dados mock · atualizado hoje 08:00</span>
      </header>

      {/* 1 — KPI PRINCIPAL: o que decide de relance (maior, no topo) */}
      <Card title="Receita do mês vs. meta" sub="Marcador preto = meta (R$ 800k)" span={2}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
          <strong style={{ font: "700 34px system-ui", color: bateuMeta ? OK : ALERTA }}>
            {brlF(RECEITA_MES)}
          </strong>
          <span style={{ font: "600 14px system-ui", color: bateuMeta ? OK : ALERTA }}>
            {bateuMeta ? "▲" : "▼"} {((RECEITA_MES / META_MES - 1) * 100).toFixed(1)}% vs meta
          </span>
        </div>
        <Bullet valor={RECEITA_MES} meta={META_MES} max={META_MES * 1.15} />
      </Card>

      {/* 2 — TENDÊNCIA: linha, rótulo direto, sem legenda */}
      <Card title="Acumulado do mês (R$ mil)" sub="Linha azul = real · cinza tracejada = meta no ritmo">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={tendencia} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
            <CartesianGrid stroke="#f1f3f4" vertical={false} />
            <XAxis dataKey="dia" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#5f6368" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#5f6368" }} />
            <Tooltip formatter={(v) => `R$ ${v}k`} />
            <Line dataKey="meta" stroke={CINZA} strokeDasharray="4 4" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            <Line dataKey="real" stroke={OK} dot={false} strokeWidth={2.5} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 3 — RANKING: barra horizontal ordenada, cor só no problema */}
      <Card title="Vendedores — receita do mês" sub="Vermelho = abaixo da meta (R$ 150k)">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={vendedores} layout="vertical" margin={{ left: 4, right: 48 }}>
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis type="category" dataKey="vendedor" width={92} tickLine={false}
              axisLine={false} tick={{ fontSize: 12, fill: TINTA }} />
            <Tooltip formatter={(v) => brl(v)} cursor={{ fill: "#f1f3f4" }} />
            <Bar dataKey="receita" radius={[0, 3, 3, 0]} isAnimationActive={false}>
              {vendedores.map((d) => (
                <Cell key={d.vendedor} fill={d.receita < d.meta ? ALERTA : CINZA} />
              ))}
              <LabelList dataKey="receita" position="right" formatter={brl}
                style={{ fontSize: 11, fill: TINTA }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 4 — FUNIL: onde vaza a conversão (destaque no fechado) */}
      <Card title="Funil de conversão" sub="Taxa lead→fechado: 7,2%" span={2}>
        <ResponsiveContainer width="100%" height={150}>
          <FunnelChart>
            <Tooltip />
            <Funnel dataKey="valor" data={funil} isAnimationActive={false}>
              <FunnelLabel position="right" fill={TINTA} stroke="none"
                dataKey="etapa" style={{ fontSize: 12 }} />
              <FunnelLabel position="center" fill="#fff" stroke="none"
                dataKey="valor" style={{ fontSize: 12, fontWeight: 600 }} />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
