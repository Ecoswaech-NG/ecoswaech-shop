import { z } from "zod";

// ─── Helpers (Zod-version safe) ──────────────────────────

const numberFromString = (field: string) =>
  z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      const num = Number(val);
      return isNaN(num) ? val : num;
    }
    return val;
  }, z.number().refine((v) => !isNaN(v), `${field} must be a number`));

const intFromString = (field: string) =>
  z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      const num = parseInt(val);
      return isNaN(num) ? val : num;
    }
    return val;
  }, z.number().int().refine((v) => !isNaN(v), `${field} must be an integer`));