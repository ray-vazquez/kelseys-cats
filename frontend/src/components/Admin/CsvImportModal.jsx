import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "../Common/StyledComponents.js";
import http from "../../api/http.js";

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  max-width: 900px;
  width: 100%;
  max-height: 80vh;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ModalTitle = styled.h2`
  margin: 0;
`;

const ModalBody = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  th,
  td {
    padding: ${({ theme }) => theme.spacing.xs};
    border-bottom: 1px solid ${({ theme }) => theme.colors.light};
    text-align: left;
  }

  th {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
  }

  tbody tr.error {
    background-color: #fff5f5;
  }
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

export default function CsvImportModal({ onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState({
    rows: [],
    total: 0,
  });
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("upload"); // 'upload' | 'preview' | 'summary'
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setError(null);
  }

  async function handleUpload() {
    if (!file) {
      setError("Please choose a CSV file.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await http.post("/cats/import/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const body = res.data;
      setPreview({
        rows: body.rows || [],
        total: body.total ?? (body.rows ? body.rows.length : 0),
      });

      // Initially select all rows without errors
      const initialSelected = {};
      (body.rows || []).forEach((row, idx) => {
        initialSelected[idx] = !row.errors || row.errors.length === 0;
      });
      setSelected(initialSelected);

      setStep("preview");
    } catch (err) {
      console.error("Preview import failed", err);
      setError(err.response?.data?.error || "Failed to parse CSV.");
    } finally {
      setLoading(false);
    }
  }

  function toggleRow(idx) {
    setSelected((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  }

  async function handleConfirm() {
    const rowsToSend = preview.rows
      .map((row, idx) => ({ row, idx }))
      .filter(
        ({ row, idx }) =>
          selected[idx] && (!row.errors || row.errors.length === 0),
      )
      .map(({ row }) => ({
        operation: row.operation,
        errors: row.errors,
        data: row.data,
      }));

    if (!rowsToSend.length) {
      setError("No valid rows selected to import.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await http.post("/cats/import/confirm", {
        rows: rowsToSend,
      });

      setSummary(res.data); // { created, updated, skipped }
      setStep("summary");

      if (onImported) {
        onImported();
      }
    } catch (err) {
      console.error("Confirm import failed", err);
      setError(err.response?.data?.error || "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    onClose();
  }

  return (
    <Backdrop>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="csv-import-title"
        aria-busy={loading}
        aria-label="Importing, please wait"
      >
        <ModalHeader>
          <ModalTitle id="csv-import-title">Import Cats from CSV</ModalTitle>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </ModalHeader>

        <ModalBody>
          {step === "upload" && (
            <>
              <p>
                Choose a CSV file with headers like:&nbsp;
                <code>
                  id, name, age_years, sex, breed, temperament, good_with_kids,
                  good_with_cats, good_with_dogs, medical_notes,
                  is_special_needs, status, main_image_url, featured,
                  bonded_pair_id
                </code>
              </p>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
              />
              {error && <ErrorText>{error}</ErrorText>}
            </>
          )}

          {step === "preview" && (
            <>
              <p>
                Preview the rows below. Rows with errors are highlighted and
                won&apos;t be imported unless fixed in the CSV.
              </p>
              {error && <ErrorText>{error}</ErrorText>}
              <Table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all"
                        checked={
                          preview.rows.length > 0 &&
                          preview.rows.every(
                            (row, idx) =>
                              (!row.errors || row.errors.length === 0) &&
                              selected[idx],
                          )
                        }
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const next = {};
                          preview.rows.forEach((row, idx) => {
                            next[idx] =
                              (!row.errors || row.errors.length === 0) &&
                              checked;
                          });
                          setSelected(next);
                        }}
                      />
                    </th>
                    <th>Row</th>
                    <th>Operation</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={row.errors && row.errors.length ? "error" : ""}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={!!selected[idx]}
                          disabled={row.errors && row.errors.length > 0}
                          onChange={() => toggleRow(idx)}
                        />
                      </td>
                      <td>{row.index}</td>
                      <td>{row.operation}</td>
                      <td>{row.data?.name}</td>
                      <td>{row.data?.status}</td>
                      <td>
                        {row.errors && row.errors.length > 0
                          ? row.errors.map((errMsg, i) => (
                              <ErrorText key={i}>{errMsg}</ErrorText>
                            ))
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}

          {step === "summary" && summary && (
            <>
              <p>Import complete. Here&apos;s what happened:</p>
              <ul>
                <li>Created: {summary.created}</li>
                <li>Updated: {summary.updated}</li>
                <li>Skipped: {summary.skipped}</li>
              </ul>
              {error && <ErrorText>{error}</ErrorText>}
            </>
          )}
        </ModalBody>

        <ModalFooter>
          {step === "upload" && (
            <>
              <span />
              {loading && (
                <CenteredSpinner>
                  <Spinner aria-label="Loading cats" />
                </CenteredSpinner>
              )}
            </>
          )}

          {step === "preview" && (
            <>
              <ErrorText>
                {preview.total} row(s) parsed. Only selected rows without errors
                will be imported.
              </ErrorText>
              <div>
                <Button
                  variant="secondary"
                  style={{ marginRight: "0.5rem" }}
                  onClick={() => {
                    setPreview({ rows: [], total: 0 });
                    setSelected({});
                    setStep("upload");
                  }}
                  disabled={loading}
                >
                  Start Over
                </Button>
                {loading && (
                  <CenteredSpinner>
                    <Spinner aria-label="Loading cats" />
                  </CenteredSpinner>
                )}
              </div>
            </>
          )}

          {step === "summary" && (
            <>
              <span />
              <div>
                <Button
                  variant="secondary"
                  style={{ marginRight: "0.5rem" }}
                  onClick={() => {
                    setPreview({ rows: [], total: 0 });
                    setSelected({});
                    setSummary(null);
                    setStep("upload");
                  }}
                  disabled={loading}
                >
                  Import another file
                </Button>
                <Button onClick={handleClose}>Done</Button>
              </div>
            </>
          )}
        </ModalFooter>
      </Modal>
    </Backdrop>
  );
}
