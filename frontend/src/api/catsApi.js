// frontend/src/api/catsApi.js
import http from "./http.js";

export function fetchCats(params) {
  return http.get("/cats", { params }).then((res) => res.data);
}

export function fetchCatById(id) {
  return http.get(`/cats/${id}`).then((res) => res.data);
}

export function createCat(data) {
  return http.post("/cats", data).then((res) => res.data);
}

export function updateCat(id, data) {
  return http.put(`/cats/${id}`, data).then((res) => res.data);
}

export function deleteCat(id) {
  return http.delete(`/cats/${id}`).then((res) => res.data);
}

export function hardDeleteCat(id) {
  return http.delete(`/cats/${id}/permanent`).then((res) => res.data);
}

export function restoreCat(id) {
  return http.post(`/cats/${id}/restore`).then((res) => res.data);
}

export function adoptCat(id, data) {
  return http.post(`/cats/${id}/adopt`, data).then((res) => res.data);
}

export function fetchDeletedCats() {
  return http.get("/cats/deleted/list").then((res) => res.data);
}

export function fetchAllAvailableCats(params) {
  return http.get("/cats/all-available", { params }).then((res) => res.data);
}

export function scrapePartnerFosters() {
  return http.post("/cats/scrape-partner-fosters").then((res) => res.data);
}

export function fetchPartnerFostersInfo() {
  return http.get("/cats/partner-fosters-info").then((res) => res.data);
}
