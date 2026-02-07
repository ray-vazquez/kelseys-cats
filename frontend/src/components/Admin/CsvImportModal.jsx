import React, { useState } from "react";
import styled from "styled-components";
import { Button, Spinner } from "../Common/StyledComponents.js";
import http from "../../api/http.js";

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]};
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing[6]} ${theme.spacing[8]}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => `${theme.spacing[8]} ${theme.spacing[8]}`};
  overflow-y: auto;
  flex: 1;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing[6]} ${theme.spacing[8]}`};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
  background: ${({ theme }) => theme.colors.light};
`;

const FooterLeft = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const FooterRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${({ theme }) => theme.spacing[6]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  overflow: hidden;

  th,
  td {
    padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
  }

  th {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    background: ${({ theme }) => theme.colors.neutral[100]};
    color: ${({ theme }) => theme.colors.text.primary};
    position: sticky;
    top: 0;
    border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr.error {
    background-color: ${({ theme }) => theme.colors.dangerLight};
  }

  tbody tr:hover:not(.error) {
    background-color: ${({ theme }) => theme.colors.light};
  }
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing[2]};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const InfoText = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`;

const IntroText = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const CodeBlock = styled.code`
  display: block;
  background: ${({ theme }) => theme.colors.neutral[100]};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: 'Courier New', monospace;
  overflow-x: auto;
  margin: ${({ theme }) => `${theme.spacing[4]} 0 ${theme.spacing[6]}`};
  white-space: pre-wrap;
  word-break: break-word;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FileInputWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  input[type="file"] {
    padding: ${({ theme }) => theme.spacing[3]};
    border: 2px dashed ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    width: 100%;
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSizes.base};
    transition: all ${({ theme }) => theme.transitions.fast};

    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
      background-color: ${({ theme }) => theme.colors.light};
    }

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: ${({ theme }) => theme.shadows.focus};
    }
  }
`;

const SummaryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${({ theme }) => `${theme.spacing[4]} 0`};

  li {
    padding: ${({ theme }) => theme.spacing[3]};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    background: ${({ theme }) => theme.colors.light};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    border-left: 4px solid ${({ theme }) => theme.colors.primary};
    font-size: ${({ theme }) => theme.fontSizes.base};
    
    strong {
      font-weight: ${({ theme }) => theme.fontWeights.semibold};
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
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
    <Backdrop onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="csv-import-title"
        aria-busy={loading}
        aria-label="Importing, please wait"
      >
        <ModalHeader>
          <ModalTitle id="csv-import-title">Import Cats from CSV</ModalTitle>
          <Button $variant="ghost" $size="sm" onClick={handleClose}>
            Close
          </Button>
        </ModalHeader>

        <ModalBody>
          {step === "upload" && (
            <>
              <IntroText>
                Choose a CSV file with the following headers:
              </IntroText>
              <CodeBlock>
                id, name, age_years, sex, breed, temperament, good_with_kids,
                good_with_cats, good_with_dogs, medical_notes,
                is_special_needs, status, main_image_url, featured,
                bonded_pair_id
              </CodeBlock>
              <FileInputWrapper>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                />
              </FileInputWrapper>
              {error && <ErrorText>{error}</ErrorText>}
            </>
          )}

          {step === "preview" && (
            <>
              <InfoText style={{ marginBottom: '1.5rem' }}>
                Preview the rows below. Rows with errors are highlighted and
                won't be imported unless fixed in the CSV.
              </InfoText>
              {error && <ErrorText>{error}</ErrorText>}
              <Table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
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
              <IntroText>Import complete. Here's what happened:</IntroText>
              <SummaryList>
                <li><strong>Created:</strong> {summary.created} cats</li>
                <li><strong>Updated:</strong> {summary.updated} cats</li>
                <li><strong>Skipped:</strong> {summary.skipped} rows</li>
              </SummaryList>
              {error && <ErrorText>{error}</ErrorText>}
            </>
          )}
        </ModalBody>

        <ModalFooter>
          {step === "upload" && (
            <>
              <FooterLeft>
                {loading && (
                  <>
                    <Spinner $size="20px" />
                    <InfoText>Processing CSV...</InfoText>
                  </>
                )}
              </FooterLeft>
              <FooterRight>
                <Button onClick={handleUpload} disabled={loading || !file}>
                  {loading ? 'Processing...' : 'Preview Import'}
                </Button>
              </FooterRight>
            </>
          )}

          {step === "preview" && (
            <>
              <FooterLeft>
                <InfoText>
                  {preview.total} row(s) parsed. Only selected rows without errors
                  will be imported.
                </InfoText>
              </FooterLeft>
              <FooterRight>
                {loading && (
                  <>
                    <Spinner $size="20px" />
                    <InfoText>Importing...</InfoText>
                  </>
                )}
                <Button
                  $variant="outline"
                  onClick={() => {
                    setPreview({ rows: [], total: 0 });
                    setSelected({});
                    setStep("upload");
                  }}
                  disabled={loading}
                >
                  Start Over
                </Button>
                <Button onClick={handleConfirm} disabled={loading}>
                  {loading ? 'Importing...' : 'Import selected'}
                </Button>
              </FooterRight>
            </>
          )}

          {step === "summary" && (
            <>
              <FooterLeft />
              <FooterRight>
                <Button
                  $variant="outline"
                  onClick={() => {
                    setPreview({ rows: [], total: 0 });
                    setSelected({});
                    setSummary(null);
                    setStep("upload");
                  }}
                  disabled={loading}
                >
                  Import Another File
                </Button>
                <Button onClick={handleClose}>Done</Button>
              </FooterRight>
            </>
          )}
        </ModalFooter>
      </Modal>
    </Backdrop>
  );
}
