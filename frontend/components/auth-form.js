"use client";

import { useState } from "react";

export default function AuthForm({ buttonLabel, error, fields, onSubmit }) {
  const [values, setValues] = useState(() =>
    fields.reduce((accumulator, field) => ({ ...accumulator, [field.name]: "" }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="mt-6 flex flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      {fields.map((field) => (
        <label className="flex flex-col gap-2" htmlFor={field.name} key={field.name}>
          <span className="text-sm font-semibold text-[var(--ink)]">{field.label}</span>
          <input
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
            id={field.name}
            name={field.name}
            onChange={(event) =>
              setValues((currentValues) => ({
                ...currentValues,
                [field.name]: event.target.value
              }))
            }
            type={field.type}
            value={values[field.name]}
          />
        </label>
      ))}
      {error ? <p className="rounded-2xl bg-[#ffe1d6] px-4 py-3 text-sm text-[#7a2f14]">{error}</p> : null}
      <button
        className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)] disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Working..." : buttonLabel}
      </button>
    </form>
  );
}
