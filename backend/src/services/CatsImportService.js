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
      throw new Error("Invalid CSV format: " + err.message);
    }

    if (!records || records.length === 0) {
      throw new Error("CSV file is empty or has no valid rows");
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

      // Improved bonded_pair_id parsing: handle empty strings, whitespace, non-positive
      const rawBonded = (row.bonded_pair_id || "").trim();
      let bondedPairId = null;
      if (rawBonded) {
        const parsed = Number(rawBonded);
        if (Number.isNaN(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
          errors.push(`Invalid bonded_pair_id "${row.bonded_pair_id}"`);
        } else {
          bondedPairId = parsed;
        }
      }

      // Support both 'sex' and 'sex' columns for backwards compatibility
      const sex = row.sex || row.sex || "unknown";

      const mapped = {
        id,
        name,
        age_years: ageYears,
        sex: sex, // UPDATED: use sex field
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
        is_senior:
          row.is_senior === "1" || row.is_senior === "true" || ageYears >= 10,
        status: row.status || (existing?.status ?? "available"),
        main_image_url: row.main_image_url || null,
        featured: row.featured === "1" || row.featured === "true",
        bonded_pair_id: bondedPairId,
        adoptapet_url: row.adoptapet_url || null,
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
   * IMPORTANT: Soft-deletes any existing cats NOT present in the CSV.
   * rows: array of { operation, data }
   * 
   * Three-pass strategy to handle bonded_pair_id FK constraints:
   * 1. Create/update all cats WITHOUT bonded_pair_id
   * 2. Update bonded_pair_id after all cats exist in DB
   * 3. Soft-delete cats not in CSV
   */
  static async applyImport(rows) {
    const results = {
      created: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
    };

    // Track IDs present in CSV and bonded pairs to apply later
    const csvIds = new Set();
    const bondedPairsToUpdate = [];

    // PASS 1: Create/update cats WITHOUT bonded_pair_id
    for (const row of rows) {
      if (row.errors && row.errors.length) {
        results.skipped += 1;
        continue;
      }

      // Clone data and remove bonded_pair_id for now
      const dataWithoutBonded = { ...row.data };
      const bondedPairId = dataWithoutBonded.bonded_pair_id;
      delete dataWithoutBonded.bonded_pair_id;

      if (row.operation === "update" && row.data.id) {
        csvIds.add(row.data.id);
        await CatModel.update(row.data.id, dataWithoutBonded);
        results.updated += 1;

        // Queue bonded pair update if present
        if (bondedPairId) {
          bondedPairsToUpdate.push({
            catId: row.data.id,
            bondedPairId,
          });
        }
      } else if (row.operation === "create") {
        const created = await CatModel.create(dataWithoutBonded);
        if (created && created.id) {
          csvIds.add(created.id);

          // Queue bonded pair update if present
          if (bondedPairId) {
            bondedPairsToUpdate.push({
              catId: created.id,
              bondedPairId,
            });
          }
        }
        results.created += 1;
      } else {
        results.skipped += 1;
      }
    }

    // PASS 2: Update bonded_pair_id now that all cats exist
    for (const { catId, bondedPairId } of bondedPairsToUpdate) {
      // Verify the bonded pair cat exists and is in the CSV
      if (csvIds.has(bondedPairId)) {
        await CatModel.update(catId, { bonded_pair_id: bondedPairId });
      } else {
        // Log warning but don't fail — bonded pair not in import
        console.warn(
          `Warning: Cat ${catId} has bonded_pair_id ${bondedPairId} but that cat is not in the import. Skipping bonded pair assignment.`
        );
      }
    }

    // PASS 3: Soft-delete cats not in CSV
    const allCats = await CatModel.findAll({
      status: null, // Get all statuses
      featured: undefined,
      senior: undefined,
    });

    for (const cat of allCats) {
      if (!csvIds.has(cat.id)) {
        await CatModel.softDelete(cat.id);
        results.deleted += 1;
      }
    }

    return results;
  }
}
