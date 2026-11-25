"use client";

// generic crud table driven by a SectionCfg — list rows, expand to edit,
// save (upsert), delete, add new. one component runs all six sections.

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SectionCfg, FieldDef } from "./config";

type Row = Record<string, unknown>;

// tell the public site to drop its cache and re-read the database —
// changes made here show up on "/" within a second or two
const revalidateSite = () => {
  fetch("/api/revalidate", { method: "POST" }).catch(() => {});
};

export default function AdminTable({
  cfg,
  supabase,
}: {
  cfg: SectionCfg;
  supabase: SupabaseClient;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    let query = supabase.from(cfg.table).select("*");
    if (cfg.filter) {
      for (const [k, v] of Object.entries(cfg.filter)) {
        query = query.eq(k, v);
      }
    }
    const { data, error } = await query.order(cfg.orderKey, { ascending: true });
    if (error) {
      setMsg(`// load failed: ${error.message}`);
      return;
    }
    setRows((data ?? []) as Row[]);
  }, [cfg, supabase]);

  useEffect(() => {
    setMsg("");
    setEditing(null);
    load();
  }, [load]);

  const openNew = () => {
    setEditing({ ...cfg.defaults });
    setIsNew(true);
    setMsg("");
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    setMsg("");
    const payload = { ...editing };
    delete payload.created_at;
    const { error } = await supabase.from(cfg.table).upsert(payload);
    setBusy(false);
    if (error) {
      setMsg(`// save failed: ${error.message}`);
      return;
    }
    setEditing(null);
    setIsNew(false);
    load();
    revalidateSite();
  };

  const remove = async (id: unknown) => {
    if (!confirm("delete this row for good?")) return;
    setBusy(true);
    const { error } = await supabase.from(cfg.table).delete().eq("id", id);
    setBusy(false);
    if (error) {
      setMsg(`// delete failed: ${error.message}`);
      return;
    }
    setEditing(null);
    load();
    revalidateSite();
  };

  const field = (f: FieldDef) => {
    const v = editing?.[f.key];
    const set = (val: unknown) => setEditing((e) => ({ ...e!, [f.key]: val }));
    if (f.type === "area")
      return (
        <textarea
          className="adm-input"
          rows={f.key === "body" ? 10 : 3}
          value={String(v ?? "")}
          placeholder={f.placeholder}
          onChange={(e) => set(e.target.value)}
        />
      );
    if (f.type === "check")
      return (
        <label className="adm-check">
          <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(e.target.checked)} />
          <span>{f.label}</span>
        </label>
      );
    if (f.type === "select")
      return (
        <select className="adm-input" value={String(v ?? "")} onChange={(e) => set(e.target.value)}>
          {(f.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    if (f.type === "tags")
      return (
        <input
          className="adm-input"
          value={Array.isArray(v) ? (v as string[]).join(", ") : String(v ?? "")}
          placeholder={f.placeholder}
          onChange={(e) =>
            set(
              e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            )
          }
        />
      );
    return (
      <input
        className="adm-input"
        type={f.type === "num" ? "number" : "text"}
        inputMode={f.type === "num" ? "numeric" : undefined}
        value={String(v ?? "")}
        placeholder={f.placeholder}
        onChange={(e) => {
          if (f.type !== "num") return set(e.target.value);
          const raw = e.target.value;
          set(raw === "" && cfg.defaults[f.key] === null ? null : Number(raw));
        }}
      />
    );
  };

  const renderEditor = (rowId?: unknown) => (
    <div className={`adm-editor${isNew ? " new" : ""}`}>
      {isNew && <p className="adm-new-head">new {cfg.title} row</p>}
      {cfg.fields.map((f) => (
        <div className={`adm-field adm-${f.type}`} key={f.key}>
          {f.type !== "check" && <label>{f.label}</label>}
          {field(f)}
          {f.hint && <small>{f.hint}</small>}
        </div>
      ))}
      <div className="adm-actions">
        <button className="adm-btn solid" type="button" disabled={busy} onClick={save}>
          {busy ? "saving..." : isNew ? "create" : "save"}
        </button>
        <button
          className="adm-btn"
          type="button"
          onClick={() => {
            setEditing(null);
            setIsNew(false);
          }}
        >
          cancel
        </button>
        {!isNew && rowId !== undefined && (
          <button
            className="adm-btn danger"
            type="button"
            disabled={busy}
            onClick={() => remove(rowId)}
          >
            delete
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="adm-table">
      <div className="adm-table-head">
        <h2 className="adm-title">
          {cfg.title} <span className="adm-count">[{rows.length}]</span>
        </h2>
        <button
          className="adm-btn"
          type="button"
          onClick={() => {
            if (isNew) {
              setEditing(null);
              setIsNew(false);
            } else {
              openNew();
            }
          }}
        >
          {isNew ? "− close" : "+ add new"}
        </button>
      </div>

      {msg && <p className="adm-msg">{msg}</p>}

      {isNew && editing && renderEditor()}

      <ul className="adm-list">
        {rows.map((r) => {
          const isOpen = !isNew && editing && r.id === editing.id;
          return (
            <li key={String(r.id)} className={isOpen ? "open" : ""}>
              <button
                className="adm-row"
                type="button"
                aria-expanded={Boolean(isOpen)}
                onClick={() => {
                  setEditing(isOpen ? null : { ...r });
                  setIsNew(false);
                }}
              >
                <span className="adm-row-label">{String(r[cfg.labelKey] ?? "—")}</span>
                <span className="adm-row-meta">
                  {cfg.orderKey === "created_at" && r.approved === false ? (
                    <b className="adm-flag">pending</b>
                  ) : (
                    `#${String(r[cfg.orderKey] ?? "")}`
                  )}
                  <span className="adm-row-toggle">{isOpen ? "−" : "+"}</span>
                </span>
              </button>

              {isOpen && renderEditor(r.id)}
            </li>
          );
        })}
        {rows.length === 0 && <li className="adm-empty">nothing here yet — add the first one.</li>}
      </ul>
    </div>
  );
}
