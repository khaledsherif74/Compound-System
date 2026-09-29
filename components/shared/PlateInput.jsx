"use client";

import { useRef } from "react";

import {
  DISALLOWED_PLATE_LETTERS,
} from "./rollerRegOwnerData";

export default function PlateInput({
  plateLetters,
  plateNumbers,
  onLettersChange,
  onNumbersChange,
}) {
  const letterRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const digitsRef =
    useRef(null);

  const handleLetterChange = (
    index,
    event,
  ) => {
    const arabicLetters =
      event.target.value.match(
        /[\u0621-\u063A\u0641-\u064A]/g,
      ) || [];

    const allowedLetters =
      arabicLetters.filter(
        (char) =>
          !DISALLOWED_PLATE_LETTERS.has(
            char,
          ),
      );

    const newChar =
      allowedLetters
        .join("")
        .slice(-1);

    onLettersChange(
      index,
      newChar,
    );

    if (newChar) {
      if (index > 0) {
        requestAnimationFrame(() => {
          letterRefs[
            index - 1
          ].current?.focus();

          letterRefs[
            index - 1
          ].current?.select();
        });
      } else {
        requestAnimationFrame(() => {
          digitsRef.current?.focus();

          digitsRef.current?.select();
        });
      }
    }
  };

  const handleLetterKeyDown = (
    index,
    event,
  ) => {
    if (
      event.key === "Backspace" &&
      plateLetters[index] === "" &&
      index < 2
    ) {
      event.preventDefault();

      requestAnimationFrame(() => {
        letterRefs[
          index + 1
        ].current?.focus();

        letterRefs[
          index + 1
        ].current?.select();
      });

      return;
    }

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      event.preventDefault();

      letterRefs[
        index - 1
      ].current?.focus();

      return;
    }

    if (
      event.key === "ArrowRight" &&
      index < 2
    ) {
      event.preventDefault();

      letterRefs[
        index + 1
      ].current?.focus();
    }
  };

  const handleDigitsChange = (
    event,
  ) => {
    const converted =
      event.target.value.replace(
        /[0-9]/g,
        (char) =>
          String.fromCharCode(
            char.charCodeAt(0) +
              1584,
          ),
      );

    const digits = (
      converted.match(
        /[\u0660-\u0669]/g,
      ) || []
    )
      .join("")
      .slice(0, 4);

    onNumbersChange(digits);
  };

  const handleDigitsKeyDown = (
    event,
  ) => {
    if (
      event.key === "Backspace" &&
      plateNumbers === ""
    ) {
      event.preventDefault();

      requestAnimationFrame(() => {
        letterRefs[0].current?.focus();

        letterRefs[0].current?.select();
      });
    }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Plate Number
      </label>

      <div
        className="flex gap-2"
        dir="ltr"
      >
        <input
          ref={digitsRef}
          type="text"
          value={plateNumbers}
          onChange={
            handleDigitsChange
          }
          onKeyDown={
            handleDigitsKeyDown
          }
          placeholder="١٢٣٤"
          maxLength={4}
          inputMode="numeric"
          dir="rtl"
          className="w-24 rounded-xl border border-gray-300 bg-white px-2 py-3 text-center text-lg font-bold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {[0, 1, 2].map(
          (index) => (
            <input
              key={index}
              ref={
                letterRefs[index]
              }
              type="text"
              value={
                plateLetters[index]
              }
              onChange={(event) =>
                handleLetterChange(
                  index,
                  event,
                )
              }
              onKeyDown={(event) =>
                handleLetterKeyDown(
                  index,
                  event,
                )
              }
              placeholder="ح"
              maxLength={1}
              inputMode="text"
              lang="ar"
              dir="rtl"
              className="w-14 rounded-xl border border-gray-300 bg-white px-2 py-3 text-center text-lg font-bold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          ),
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Enter the plate letters from
        right to left.
      </p>

      <p className="mt-1 text-xs text-gray-400">
        Not allowed: ت ث ح خ ذ ز ش ض ظ غ ك
      </p>
    </div>
  );
}