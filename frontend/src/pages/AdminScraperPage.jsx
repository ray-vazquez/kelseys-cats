import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Container, Button } from '../components/Common/StyledComponents.js';
import http from '../api/http.js';

const PageShell = styled.div`
  padding: ${({ theme }) => theme.spacing[5]} 0 ${({ theme }) => theme.spacing[8]};
`;

const PageHeader = styled.header`
  margin-bottom: ${({ theme }) => theme.spacing[3]};

  h1 {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
    margin: 0 0 ${({ theme }) => theme.spacing[1]};
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.white};
`;

const PanelTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin: 0 0 ${({ theme }) => theme.spacing[2]};
`;

const ControlRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    & > * {
      flex: 1 1 150px;
    }
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing[2]};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const Stat = styled.div`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};

  .label {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  .value {
    margin-top: 2px;
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    overflow-wrap: anywhere;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 2px ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  background: ${({ $status }) => $status === 'running' ? '#dbeafe' : '#e5e7eb'};
  color: ${({ $status }) => $status === 'running' ? '#1e40af' : '#374151'};
`;

const ErrorBox = styled.div`
  margin-top: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerLight};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const LogContainer = styled.div`
  background: #1e1e1e;
  color: #d4d4d4;
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.45;
  max-height: 320px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;

  .log-line + .log-line { margin-top: 3px; }
  .success { color: #4ade80; }
  .error { color: #f87171; }
  .warning { color: #fbbf24; }
  .info { color: #60a5fa; }
`;

const Details = styled.details`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing[3]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  summary {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
  }

  p { margin: ${({ theme }) => theme.spacing[2]} 0 0; }
`;

export default function AdminScraperPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => { fetchStatus(); }, []);

  const fetchStatus = async () => {
    try {
      const response = await http.get('/admin/scrape/status');
      setStatus(response.data);
    } catch (err) {
      console.error('Error fetching scraper status:', err);
      setError('Unable to refresh scraper status.');
    }
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message: `[${timestamp}] ${message}`, type }]);
  };

  const runFullScrape = async () => {
    setLoading(true); setError(null); setLogs([]);
    addLog('Starting full scrape cycle...');
    try {
      const response = await http.post('/admin/scrape/full');
      setLastResult(response.data);
      const scrapeData = response.data.data?.scrape || response.data.scrape;
      const cleanupData = response.data.data?.cleanup || response.data.cleanup;
      addLog('Scrape completed successfully.', 'success');
      addLog(`Total: ${scrapeData?.total || 0}; added: ${scrapeData?.added || 0}; updated: ${scrapeData?.updated || 0}; skipped: ${scrapeData?.skipped || 0}`, 'info');
      if (scrapeData?.errors > 0) addLog(`Errors: ${scrapeData.errors}`, 'error');
      if (scrapeData?.validation) {
        const val = scrapeData.validation;
        addLog(`Validation: ${val.valid}/${val.total} valid`, val.withWarnings > 0 ? 'warning' : 'info');
      }
      addLog(`Cleaned up: ${cleanupData?.deleted || 0} old entries`, 'info');
      await fetchStatus();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg); addLog(`Error: ${errorMsg}`, 'error');
    } finally { setLoading(false); }
  };

  const runScrapeOnly = async () => {
    setLoading(true); setError(null); setLogs([]);
    addLog('Starting Adopt-a-Pet scrape...');
    try {
      const response = await http.post('/admin/scrape/adoptapet');
      setLastResult(response.data);
      const scrapeData = response.data.data || response.data;
      addLog('Scrape completed.', 'success');
      addLog(`Total: ${scrapeData?.total || 0}; added: ${scrapeData?.added || 0}; updated: ${scrapeData?.updated || 0}; skipped: ${scrapeData?.skipped || 0}`, 'info');
      if (scrapeData?.errors > 0) addLog(`Errors: ${scrapeData.errors}`, 'error');
      await fetchStatus();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg); addLog(`Error: ${errorMsg}`, 'error');
    } finally { setLoading(false); }
  };

  const runCleanup = async () => {
    setLoading(true); setError(null); setLogs([]);
    addLog('Running cleanup...');
    try {
      const response = await http.post('/admin/scrape/cleanup', { daysOld: 7 });
      addLog(`Cleanup completed. Deleted ${response.data.deleted || 0} old entries.`, 'success');
      await fetchStatus();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg); addLog(`Error: ${errorMsg}`, 'error');
    } finally { setLoading(false); }
  };

  const stopScraper = async () => {
    try {
      addLog('Stop requested...', 'warning');
      await http.post('/admin/scrape/stop');
      addLog('Scraper will stop after the current operation.', 'warning');
      setLoading(false);
    } catch (err) {
      addLog(`Could not stop scraper: ${err.message}`, 'error');
    }
  };

  const result = lastResult?.data?.scrape || lastResult?.scrape || lastResult?.data || lastResult;

  return (
    <PageShell>
      <Container $density="compact">
        <PageHeader>
          <h1>Scraper</h1>
          <p>Monitor and run Voice for the Voiceless imports from Adopt-a-Pet.</p>
        </PageHeader>

        <Panel aria-labelledby="scraper-status-title">
          <PanelTitle id="scraper-status-title">Current status</PanelTitle>
          <StatusGrid>
            <Stat><div className="label">State</div><div className="value"><Badge $status={loading ? 'running' : 'idle'}>{loading ? 'Running' : 'Idle'}</Badge></div></Stat>
            <Stat><div className="label">Total partner cats</div><div className="value">{status?.totalPartnerCats ?? '—'}</div></Stat>
            <Stat><div className="label">In Kelsey’s care</div><div className="value">{status?.catsInKelseysCare ?? '—'}</div></Stat>
            <Stat><div className="label">Last scrape</div><div className="value" style={{fontSize:'0.875rem'}}>{status?.lastScrapeTime || 'Never'}</div></Stat>
          </StatusGrid>
        </Panel>

        <Panel aria-labelledby="scraper-controls-title">
          <PanelTitle id="scraper-controls-title">Controls</PanelTitle>
          <ControlRow>
            <Button $size="sm" onClick={runFullScrape} disabled={loading}>{loading ? 'Running…' : 'Run Full Scrape'}</Button>
            <Button $size="sm" $variant="outline" onClick={runScrapeOnly} disabled={loading}>Scrape Only</Button>
            <Button $size="sm" $variant="outline" onClick={runCleanup} disabled={loading}>Cleanup Only</Button>
            <Button $size="sm" $variant="danger" onClick={stopScraper} disabled={!loading}>Stop</Button>
            <Button $size="sm" $variant="outline" onClick={fetchStatus} disabled={loading}>Refresh Status</Button>
          </ControlRow>
          {error && <ErrorBox role="alert">{error}</ErrorBox>}
        </Panel>

        {lastResult && (
          <Panel aria-labelledby="scraper-results-title">
            <PanelTitle id="scraper-results-title">Last results</PanelTitle>
            <StatusGrid>
              <Stat><div className="label">Added</div><div className="value">{result?.added || 0}</div></Stat>
              <Stat><div className="label">Updated</div><div className="value">{result?.updated || 0}</div></Stat>
              <Stat><div className="label">Skipped</div><div className="value">{result?.skipped || 0}</div></Stat>
              <Stat><div className="label">Cleaned up</div><div className="value">{lastResult.cleanup?.deleted || lastResult.data?.cleanup?.deleted || 0}</div></Stat>
            </StatusGrid>
          </Panel>
        )}

        {logs.length > 0 && (
          <Panel aria-labelledby="scraper-logs-title">
            <PanelTitle id="scraper-logs-title">Operation log</PanelTitle>
            <LogContainer ref={logContainerRef} role="log" aria-live="polite">
              {logs.map((log, index) => <div key={index} className={`log-line ${log.type}`}>{log.message}</div>)}
              {loading && <div className="log-line info">Processing…</div>}
            </LogContainer>
          </Panel>
        )}

        <Panel>
          <Details>
            <summary>How the scraper works</summary>
            <p><strong>Full Scrape:</strong> imports all VFV cats and removes entries not updated for 7+ days.</p>
            <p><strong>Scrape Only:</strong> fetches and updates cat data without cleanup.</p>
            <p><strong>Cleanup Only:</strong> removes partner foster cats not updated in 7+ days.</p>
            <p><strong>Schedule:</strong> automatic scraping runs daily at 3:00 AM EST.</p>
          </Details>
        </Panel>
      </Container>
    </PageShell>
  );
}
