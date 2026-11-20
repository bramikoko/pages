"use client";

// generic crud table driven by a SectionCfg — list rows, expand to edit,
// save (upsert), delete, add new. one component runs all six sections.

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SectionCfg, FieldDef } from "./config";

type Row = Record<string, unknown>;

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
    const { data, error } = await supabase
      .from(cfg.table)
      .select("*")
      .order(cfg.orderKey, { ascending: true });
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
        value={String(v ?? "")}
        placeholder={f.placeholder}
        onChange={(e) => set(f.type === "num" ? Number(e.target.value) : e.target.value)}
      />
    );
  };

  return (
    <div className="adm-table">
      <div className="adm-table-head">
        <h2 className="adm-title">
          {cfg.title} <span className="adm-count">[{rows.length}]</span>
        </h2>
        <button className="adm-btn" type="button" onClick={openNew}>
          + add new
        </button>
      </div>

      {msg && <p className="adm-msg">{msg}</p>}

      <ul className="adm-list">
        {rows.map((r) => (
          <li key={String(r.id)} className={editing && r.id === editing.id ? "open" : ""}>
            <button
              className="adm-row"
              type="button"
              onClick={() => {
                setEditing(editing && r.id === editing.id ? null : { ...r });
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
              </span>
            </button>

            {editing && r.id === editing.id && (
              <div className="adm-editor">
                {cfg.fields.map((f) => (
                  <div className={`adm-field adm-${f.type}`} key={f.key}>
                    {f.type !== "check" && <label>{f.label}</label>}
                    {field(f)}
                    {f.hint && <small>{f.hint}</small>}
                  </div>
                ))}
                <div className="adm-actions">
                  <button className="adm-btn solid" type="button" disabled={busy} onClick={save}>
                    {busy ? "saving..." : "save"}
                  </button>
                  <button className="adm-btn" type="button" onClick={() => setEditing(null)}>
                    cancel
                  </button>
                  {!isNew && (
                    <button
                      className="adm-btn danger"
                      type="button"
                      disabled={busy}
                      onClick={() => remove(r.id)}
                    >
                      delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
        {rows.length === 0 && <li className="adm-empty">nothing here yet — add the first one.</li>}
      </ul>

      {isNew && editing && (
        <div className="adm-editor new">
          <p className="adm-new-head">new {cfg.title} row</p>
          {cfg.fields.map((f) => (
            <div className={`adm-field adm-${f.type}`} key={f.key}>
              {f.type !== "check" && <label>{f.label}</label>}
              {field(f)}
              {f.hint && <small>{f.hint}</small>}
            </div>
          ))}
          <div className="adm-actions">
            <button className="adm-btn solid" type="button" disabled={busy} onClick={save}>
              {busy ? "saving..." : "create"}
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
          </div>
        </div>
      )}
    </div>
  );
}
