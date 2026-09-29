"use client";

import { useEffect, useRef } from "react";

const DISALLOWED_PLATE_LETTERS =
  new Set([
    "ت",
    "ث",
    "ح",
    "خ",
    "ذ",
    "ز",
    "ش",
    "ض",
    "ظ",
    "غ",
    "ك",
  ]);

const ARABIC_DIGITS =
  "١٢٣٤٥٦٧٨٩";

/* =========================================================
   CONVERT ENGLISH NUMBERS TO ARABIC-INDIC DIGITS
========================================================= */

function toArabicDigits(value) {
  return String(value || "").replace(
    /[1-9]/g,
    (digit) =>
      ARABIC_DIGITS[
        Number(digit) - 1
      ]
  );
}

/* =========================================================
   NORMALIZE ARABIC-INDIC / PERSIAN DIGITS
========================================================= */

function normalizeDigits(value) {
  return String(value || "")
    .replace(
      /[١-٩]/g,
      (digit) =>
        String(
          ARABIC_DIGITS.indexOf(
            digit
          ) + 1
        )
    )
    .replace(
      /[۱-۹]/g,
      (digit) =>
        String(
          "۱۲۳۴۵۶۷۸۹".indexOf(
            digit
          ) + 1
        )
    );
}

/* =========================================================
   GET VALID PLATE CHARACTER
========================================================= */

function getPlateCharacter(value) {
  if (!value) {
    return "";
  }

  const normalized =
    normalizeDigits(value);

  const character =
    normalized.charAt(
      normalized.length - 1
    );

  if (!character) {
    return "";
  }

  /* =======================================================
     NUMBER
  ======================================================= */

  if (/^[1-9]$/.test(character)) {
    return toArabicDigits(
      character
    );
  }

  /* =======================================================
     ARABIC LETTER
  ======================================================= */

  if (
    /^[\u0600-\u06FF]$/.test(
      character
    )
  ) {
    if (
      DISALLOWED_PLATE_LETTERS.has(
        character
      )
    ) {
      return "";
    }

    return character;
  }

  return "";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function PlateInput({
  letters = ["", "", ""],
  numbers = "",
  onLettersChange,
  onNumbersChange,
}) {
  const letterRefs = useRef([]);

  /* =======================================================
     FIRST FOCUS
  ======================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      letterRefs.current[2]?.focus();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  /* =======================================================
     LETTER CHANGE
  ======================================================= */

  function handleLetterChange(
    index,
    event
  ) {
    const character =
      getPlateCharacter(
        event.target.value
      );

    const nextLetters = [
      ...letters,
    ];

    nextLetters[index] =
      character;

    onLettersChange(nextLetters);

    if (
      character &&
      index > 0
    ) {
      requestAnimationFrame(() => {
        letterRefs.current[
          index - 1
        ]?.focus();

        letterRefs.current[
          index - 1
        ]?.select();
      });
    }
  }

  /* =======================================================
     BACKSPACE
  ======================================================= */

  function handleLetterKeyDown(
    index,
    event
  ) {
    if (
      event.key === "Backspace" &&
      !letters[index] &&
      index < 2
    ) {
      requestAnimationFrame(() => {
        letterRefs.current[
          index + 1
        ]?.focus();

        letterRefs.current[
          index + 1
        ]?.select();
      });
    }
  }

  /* =======================================================
     PLATE NUMBERS
  ======================================================= */

  function handleNumberChange(event) {
    const normalized =
      normalizeDigits(
        event.target.value
      );

    const digitsOnly =
      normalized
        .replace(/[^1-9]/g, "")
        .slice(0, 4);

    onNumbersChange(
      digitsOnly
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      {/* =================================================
          TITLE
      ================================================= */}

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">
          Vehicle Plate
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_minmax(0,1fr)]">

        {/* =================================================
            NUMBERS
        ================================================= */}

        <div>
          <input
            type="text"
            inputMode="numeric"
            dir="rtl"
            value={toArabicDigits(
              numbers
            )}
            onChange={
              handleNumberChange
            }
            placeholder="١ ١ ١ ١"
            minLength={1}
            maxLength={4}
            className="
              h-14
              w-full
              rounded-xl
              border
              border-slate-300
              bg-white
              px-3
              text-center
              text-lg
              font-semibold
              tracking-[0.2em]
              outline-none
              transition
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
          />
        </div>

        {/* =================================================
            LETTERS
        ================================================= */}

        <div>
          <div className="flex w-full gap-3">

            {/* [ أ ] */}

            <input
              ref={(element) => {
                letterRefs.current[0] =
                  element;
              }}
              type="text"
              inputMode="text"
              dir="rtl"
              value={
                letters[0] || ""
              }
              onChange={(event) =>
                handleLetterChange(
                  0,
                  event
                )
              }
              onKeyDown={(event) =>
                handleLetterKeyDown(
                  0,
                  event
                )
              }
              onFocus={(event) =>
                event.target.select()
              }
              placeholder="أ"
              maxLength={1}
              required={false}
              aria-label="أ"
              className="
                h-14
                w-14
                rounded-xl
                border
                border-slate-300
                bg-white
                px-4
                text-center
                text-lg
                font-semibold
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
              "
            />

            {/* [ ب ] */}

            <input
              ref={(element) => {
                letterRefs.current[1] =
                  element;
              }}
              type="text"
              inputMode="text"
              dir="rtl"
              value={
                letters[1] || ""
              }
              onChange={(event) =>
                handleLetterChange(
                  1,
                  event
                )
              }
              onKeyDown={(event) =>
                handleLetterKeyDown(
                  1,
                  event
                )
              }
              onFocus={(event) =>
                event.target.select()
              }
              placeholder="ب"
              maxLength={1}
              required={false}
              aria-label="ب"
              className="
                h-14
                w-14
                rounded-xl
                border
                border-slate-300
                bg-white
                px-4
                text-center
                text-lg
                font-semibold
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
              "
            />

            {/* [ ج ] */}

            <input
              ref={(element) => {
                letterRefs.current[2] =
                  element;
              }}
              type="text"
              inputMode="text"
              dir="rtl"
              value={
                letters[2] || ""
              }
              onChange={(event) =>
                handleLetterChange(
                  2,
                  event
                )
              }
              onKeyDown={(event) =>
                handleLetterKeyDown(
                  2,
                  event
                )
              }
              onFocus={(event) =>
                event.target.select()
              }
              placeholder="ج"
              maxLength={1}
              required
              aria-label="ج"
              className="
                h-14
                w-14
                rounded-xl
                border
                border-slate-300
                bg-white
                text-center
                text-lg
                font-semibold
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
}