import { parse } from "csv-parse/sync";
import { CatModel } from "../models/CatModel.js";

export class CatsImportService {
  /**
   * Parse and validate CSV buffer, return preview rows.
   * Each row: { index, raw, operation: 'create'|'update'|'skip', id, name, errors: [] }
   */
  static async previewFromCsv(buffer) {
    let records;
    try {
      records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (err) {
      throw new Error("Invalid CSV format");
    }

    const previewRows = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const index = i + 2; // account for header row
      const errors = [];

      const id = row.id ? Number(row.id) : null;
      const name = row.name?.trim();
      if (!name) {
        errors.push("Missing name");
      }

      let existing = null;
      if (id) {
        existing = await CatModel.findById(id);
        if (!existing) {
          errors.push(`No existing cat with id ${id}`);
        }
      }

      const operation = existing ? "update" : "create";

      const ageYears = row.age_years ? Number(row.age_years) : null;
      if (row.age_years && Number.isNaN(ageYears)) {
        errors.push(`Invalid age_years "${row.age_years}"`);
      }

      const bondedPairId = row.bonded_pair_id
        ? Number(row.bonded_pair_id)
        : null;
      if (row.bonded_pair_id && Number.isNaN(bondedPairId)) {
        errors.push(`Invalid bonded_pair_id "${row.bonded_pair_id}"`);
      }

      const mapped = {
        id,
        name,
        age_years: ageYears,
        sex: row.sex || "unknown",
        breed: row.breed || null,
        temperament: row.temperament || null,
        good_with_kids:
          row.good_with_kids === "1" || row.good_with_kids === "true",
        good_with_cats:
          row.good_with_cats === "1" || row.good_with_cats === "true",
        good_with_dogs:
          row.good_with_dogs === "1" || row.good_with_dogs === "true",
        medical_notes: row.medical_notes || null,
        is_special_needs:
          row.is_special_needs === "1" || row.is_special_needs === "true",
        status: row.status || (existing?.status ?? "available"),
        main_image_url: row.main_image_url || null,
        featured: row.featured === "1" || row.featured === "true",
        bonded_pair_id: bondedPairId,
      };

      previewRows.push({
        index,
        raw: row,
        operation,
        errors,
        data: mapped,
      });
    }

    return previewRows;
  }

  /**
   * Apply confirmed rows: create or update by id.
   * rows: array of { operation, data }
   */
  static async applyImport(rows) {
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
    };

    for (const row of rows) {
      if (row.errors && row.errors.length) {
        results.skipped += 1;
        continue;
      }

      if (row.operation === "update" && row.data.id) {
        await CatModel.update(row.data.id, row.data);
        results.updated += 1;
      } else if (row.operation === "create") {
        await CatModel.create(row.data);
        results.created += 1;
      } else {
        results.skipped += 1;
      }
    }

    return results;
  }
}
