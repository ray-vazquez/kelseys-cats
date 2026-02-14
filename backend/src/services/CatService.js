// backend/src/services/CatService.js
import { CatModel } from "../models/CatModel.js";
import { TagModel } from "../models/TagModel.js";
import { stringify } from "csv-stringify/sync";

export class CatService {
  /**
   * List cats with optional filters and pagination.
   * filters:
   *  - status: 'available'|'pending'|'hold'|'alumni'
   *  - featured: boolean
   *  - senior: boolean (uses is_senior column)
   *  - tags: string[]
   *  - page: number
   *  - limit: number
   */
  static async listCats(filters = {}) {
    const { page = 1, limit = 12, status, featured, senior, tags } = filters;

    // Base paginated list from the model
    const { items, total } = await CatModel.findAllPaginated({
      status,
      featured,
      senior,
      page,
      limit,
    });

    let finalItems = items;

    // Preserve existing behavior: if tags are present, filter down by tag join
    if (tags && tags.length) {
      const taggedCats = await TagModel.findCatsByTags(tags);
      const taggedIds = new Set(taggedCats.map((c) => c.id));
      finalItems = items.filter((c) => taggedIds.has(c.id));
    }

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single cat with its tags.
   */
  static async getCatWithTags(id) {
    const cat = await CatModel.findById(id);
    if (!cat) return null;

    const tags = await TagModel.findTagsForCat(id);

    return {
      ...cat,
      tags: tags.map((t) => t.name),
    };
  }

  /**
   * List all soft-deleted cats.
   */
  static async listDeletedCats() {
    const deletedCats = await CatModel.findDeleted();
    
    // Attach tags to each deleted cat
    const catsWithTags = await Promise.all(
      deletedCats.map(async (cat) => {
        const tags = await TagModel.findTagsForCat(cat.id);
        return {
          ...cat,
          tags: tags.map((t) => t.name),
        };
      })
    );

    return catsWithTags;
  }

  /**
   * Restore a soft-deleted cat.
   */
  static async restoreCat(id) {
    const restored = await CatModel.restore(id);
    if (!restored) return null;

    return this.getCatWithTags(id);
  }

  /**
   * Create a cat and set tags (if provided).
   * Accepts payload with camelCase keys from controllers:
   *  - ageyears, goodwithkids, goodwithcats, goodwithdogs,
   *    medicalnotes, isspecialneeds, issenior, mainimageurl, bondedpairid, etc.
   */
  static async createCat(payload) {
    const catData = this._mapPayloadToModel(payload);
    const cat = await CatModel.create(catData);

    if (payload.tags && payload.tags.length) {
      await TagModel.setTagsForCat(cat.id, payload.tags);
    }

    return this.getCatWithTags(cat.id);
  }

  /**
   * Update a cat and its tags.
   */
  static async updateCat(id, payload) {
    const catData = this._mapPayloadToModel(payload);
    const updated = await CatModel.update(id, catData);
    if (!updated) return null;

    if (payload.tags) {
      await TagModel.setTagsForCat(id, payload.tags);
    }

    return this.getCatWithTags(id);
  }

  /**
   * Soft-delete a cat.
   */
  static async deleteCat(id) {
    await CatModel.softDelete(id);
  }

  /**
   * Permanently delete a cat and all its associations.
   * This removes the cat record completely and cascades to:
   * - cat_tags (via FK constraint)
   * - cat_images (via FK constraint)
   */
  static async hardDeleteCat(id) {
    const deleted = await CatModel.hardDelete(id);
    return deleted;
  }

  /**
   * Mark a cat as adopted and move to alumni.
   */
  static async markAdopted(id, adoptiondate, adoptionstory) {
    const data = {
      status: "alumni",
      adoption_date: adoptiondate ? new Date(adoptiondate) : new Date(),
      adoption_story: adoptionstory ?? null,
    };
    return CatModel.update(id, data);
  }

  /**
   * Internal helper to normalize controller payload into model fields.
   * Converts camelCase (used in API) into snake_case (used in DB).
   */
  static _mapPayloadToModel(payload) {
    if (!payload) return {};

    const mapped = {
      name: payload.name,
      age_years: payload.age_years ?? payload.ageyears ?? null,
      sex: payload.sex,
      breed: payload.breed,
      temperament: payload.temperament,
      good_with_kids: payload.good_with_kids ?? (payload.goodwithkids ? 1 : 0),
      good_with_cats: payload.good_with_cats ?? (payload.goodwithcats ? 1 : 0),
      good_with_dogs: payload.good_with_dogs ?? (payload.goodwithdogs ? 1 : 0),
      medical_notes: payload.medical_notes ?? payload.medicalnotes,
      is_special_needs:
        payload.is_special_needs ?? (payload.isspecialneeds ? 1 : 0),
      is_senior:
        payload.is_senior !== undefined ? (payload.is_senior ? 1 : 0) : 
        (payload.issenior !== undefined ? (payload.issenior ? 1 : 0) : undefined),
      status: payload.status,
      main_image_url: payload.main_image_url ?? payload.mainimageurl,
      featured:
        payload.featured !== undefined ? (payload.featured ? 1 : 0) : undefined,
      bonded_pair_id: payload.bonded_pair_id ?? payload.bondedpairid,
      adoption_date: payload.adoption_date ?? payload.adoptiondate,
      adoption_story: payload.adoption_story ?? payload.adoptionstory,
    };

    // Handle additional_images - preserve the value as-is (string or array)
    // Don't default to empty array if not provided
    if (payload.additional_images !== undefined) {
      mapped.additional_images = payload.additional_images;
    } else if (payload.additionalimages !== undefined) {
      mapped.additional_images = payload.additionalimages;
    }

    return mapped;
  }

  static async exportAllCatsToCsv() {
    // Get all non-deleted cats, including alumni
    const cats = await CatModel.findAll({
      status: null,
      featured: undefined,
      senior: undefined,
    });

    // Optional: fetch tags per cat and join as a comma-separated string
    const rows = [];
    for (const cat of cats) {
      const tags = await TagModel.findTagsForCat(cat.id);
      const tagNames = tags.map((t) => t.name).join("|");

      rows.push({
        id: cat.id,
        name: cat.name,
        age_years: cat.age_years,
        sex: cat.sex,
        breed: cat.breed,
        temperament: cat.temperament,
        good_with_kids: cat.good_with_kids ? 1 : 0,
        good_with_cats: cat.good_with_cats ? 1 : 0,
        good_with_dogs: cat.good_with_dogs ? 1 : 0,
        medical_notes: cat.medical_notes,
        is_special_needs: cat.is_special_needs ? 1 : 0,
        is_senior: cat.is_senior ? 1 : 0,
        status: cat.status,
        main_image_url: cat.main_image_url,
        featured: cat.featured ? 1 : 0,
        bonded_pair_id: cat.bonded_pair_id,
        adoption_date: cat.adoption_date,
        adoption_story: cat.adoption_story,
        tags: tagNames,
      });
    }

    const csv = stringify(rows, {
      header: true,
      columns: [
        "id",
        "name",
        "age_years",
        "sex",
        "breed",
        "temperament",
        "good_with_kids",
        "good_with_cats",
        "good_with_dogs",
        "medical_notes",
        "is_special_needs",
        "is_senior",
        "status",
        "main_image_url",
        "featured",
        "bonded_pair_id",
        "adoption_date",
        "adoption_story",
        "tags",
      ],
    });

    return csv;
  }
}
