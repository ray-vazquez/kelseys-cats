// frontend/src/pages/AdminScraperPage.jsx
// Admin page for controlling and monitoring the Adopt-a-Pet scraper

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Container, Section } from '../components/Common/StyledComponents.js';
import SectionHero from '../components/Common/SectionHero.jsx';
import http from '../api/http.js';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ControlPanel = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  background: ${({ theme, variant }) => 
    variant === 'danger' ? theme.colors.error?.main || '#dc2626' :
    variant === 'secondary' ? theme.colors.background.tertiary :
    theme.colors.primary.main};
  color: ${({ theme, variant }) => 
    variant === 'secondary' ? theme.colors.text.primary : 
    variant === 'primary' ? '#1e293b' : // Dark text for primary button
    'white'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.2s;
  font-size: ${({ theme }) => theme.fontSizes.base};
  
  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusCard = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  border: 2px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const StatBox = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: center;
  
  .label {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
  }
  
  .value {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const LogContainer = styled.div`
  background: #1e1e1e;
  color: #d4d4d4;
  padding: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  max-height: 500px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  
  .log-line {
    margin-bottom: 4px;
    
    &.success { color: #4ade80; }
    &.error { color: #f87171; }
    &.warning { color: #fbbf24; }
    &.info { color: #60a5fa; }
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  background: ${({ status, theme }) => 
    status === 'running' ? '#dbeafe' :
    status === 'success' ? '#d1fae5' :
    status === 'error' ? '#fee2e2' :
    theme.colors.background.tertiary};
  color: ${({ status }) => 
    status === 'running' ? '#1e40af' :
    status === 'success' ? '#065f46' :
    status === 'error' ? '#991b1b' :
    '#4b5563'};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export default function AdminScraperPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);
  const logContainerRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Fetch initial status
  useEffect(() => {
    fetchStatus();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await http.get('/admin/scrape/status');
      setStatus(response.data);
    } catch (err) {
      console.error('Error fetching scraper status:', err);
    }
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message: `[${timestamp}] ${message}`, type }]);
  };

  const simulateScrapingLogs = () => {
    // Simulate progressive scraping updates
    const logMessages = [
      { msg: '⏳ Loading shelter page...', delay: 1000 },
      { msg: '⏳ Waiting for page to render...', delay: 8000 },
      { msg: '🔍 Scraping page 1...', delay: 2000 },
      { msg: '   📋 Found pets on page...', delay: 3000 },
      { msg: '      🔍 Fetching pet details...', delay: 2000 },
    ];

    let delay = 0;
    logMessages.forEach(({ msg, delay: msgDelay }) => {
      delay += msgDelay;
      setTimeout(() => {
        if (loading) { // Only add if still loading
          addLog(msg, 'info');
        }
      }, delay);
    });
  };

  const runFullScrape = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);
    addLog('🚀 Starting full scrape cycle...', 'info');
    
    // Simulate progressive logs
    simulateScrapingLogs();
    
    try {
      const response = await http.post('/admin/scrape/full');
      setLastResult(response.data);
      
      // Clear simulated logs and show real results
      setLogs([]);
      addLog('🚀 Starting full scrape cycle...', 'info');
      addLog('✅ Scrape completed successfully!', 'success');
      addLog(`📦 Total cats scraped: ${response.data.scrape.total}`, 'info');
      addLog(`➕ Added: ${response.data.scrape.added}`, 'success');
      addLog(`✏️ Updated: ${response.data.scrape.updated}`, 'info');
      addLog(`⏭️ Skipped: ${response.data.scrape.skipped}`, 'info');
      if (response.data.scrape.errors > 0) {
        addLog(`❌ Errors: ${response.data.scrape.errors}`, 'error');
      }
      addLog(`🗑️ Cleaned up: ${response.data.cleanup.deleted} old entries`, 'info');
      addLog('✅ Full scrape cycle complete!', 'success');
      
      await fetchStatus();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      addLog(`❌ Error: ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const runScrapeOnly = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);
    addLog('🤖 Starting Adopt-a-Pet scrape...', 'info');
    
    simulateScrapingLogs();
    
    try {
      const response = await http.post('/admin/scrape/adoptapet');
      setLastResult(response.data);
      
      setLogs([]);
      addLog('🤖 Starting Adopt-a-Pet scrape...', 'info');
      addLog('✅ Scrape completed!', 'success');
      addLog(`📦 Total cats scraped: ${response.data.total}`, 'info');
      addLog(`➕ Added: ${response.data.added}`, 'success');
      addLog(`✏️ Updated: ${response.data.updated}`, 'info');
      addLog(`⏭️ Skipped: ${response.data.skipped}`, 'info');
      if (response.data.errors > 0) {
        addLog(`❌ Errors: ${response.data.errors}`, 'error');
      }
      
      await fetchStatus();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      addLog(`❌ Error: ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const runCleanup = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);
    addLog('🧹 Running cleanup...', 'info');
    
    try {
      const response = await http.post('/admin/scrape/cleanup', { daysOld: 7 });
      addLog('✅ Cleanup completed!', 'success');
      addLog(`🗑️ Deleted ${response.data.deleted} old entries`, 'info');
      
      await fetchStatus();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      addLog(`❌ Error: ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SectionHero
        variant="gradient"
        size="sm"
        title="Scraper Control Panel"
        subtitle="Manage Voice for the Voiceless cat imports from Adopt-a-Pet"
      />

      <Section $padding="lg">
        <Container>
          <PageContainer>
            {/* Control Panel */}
            <ControlPanel>
              <Title>🎛️ Scraper Controls</Title>
              <ButtonGroup>
                <Button 
                  variant="primary"
                  onClick={runFullScrape} 
                  disabled={loading}
                >
                  {loading ? '⏳ Running...' : '🚀 Run Full Scrape'}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={runScrapeOnly} 
                  disabled={loading}
                >
                  🤖 Scrape Only
                </Button>
                <Button 
                  variant="secondary"
                  onClick={runCleanup} 
                  disabled={loading}
                >
                  🧹 Cleanup Only
                </Button>
                <Button 
                  variant="secondary"
                  onClick={fetchStatus}
                  disabled={loading}
                >
                  🔄 Refresh Status
                </Button>
              </ButtonGroup>

              {error && (
                <StatusCard style={{ background: '#fee2e2', borderColor: '#f87171' }}>
                  <div style={{ color: '#991b1b', fontWeight: 600 }}>
                    ❌ Error: {error}
                  </div>
                </StatusCard>
              )}
            </ControlPanel>

            {/* Current Status */}
            {status && (
              <StatusCard>
                <Title>📊 Current Status</Title>
                <StatusGrid>
                  <StatBox>
                    <div className="label">Total Partner Cats</div>
                    <div className="value">{status.totalPartnerCats || 0}</div>
                  </StatBox>
                  <StatBox>
                    <div className="label">In Kelsey's Care</div>
                    <div className="value">{status.catsInKelseysCare || 0}</div>
                  </StatBox>
                  <StatBox>
                    <div className="label">Last Scrape</div>
                    <div className="value" style={{ fontSize: '14px' }}>
                      {status.lastScrapeTime || 'Never'}
                    </div>
                  </StatBox>
                  <StatBox>
                    <div className="label">Status</div>
                    <div className="value">
                      <Badge status={loading ? 'running' : 'idle'}>
                        {loading ? 'Running' : 'Idle'}
                      </Badge>
                    </div>
                  </StatBox>
                </StatusGrid>
              </StatusCard>
            )}

            {/* Last Result */}
            {lastResult && (
              <StatusCard>
                <Title>📈 Last Scrape Results</Title>
                <StatusGrid>
                  <StatBox>
                    <div className="label">Added</div>
                    <div className="value" style={{ color: '#059669' }}>
                      {lastResult.scrape?.added || lastResult.added || 0}
                    </div>
                  </StatBox>
                  <StatBox>
                    <div className="label">Updated</div>
                    <div className="value" style={{ color: '#0284c7' }}>
                      {lastResult.scrape?.updated || lastResult.updated || 0}
                    </div>
                  </StatBox>
                  <StatBox>
                    <div className="label">Skipped</div>
                    <div className="value" style={{ color: '#6b7280' }}>
                      {lastResult.scrape?.skipped || lastResult.skipped || 0}
                    </div>
                  </StatBox>
                  {lastResult.cleanup && (
                    <StatBox>
                      <div className="label">Cleaned Up</div>
                      <div className="value" style={{ color: '#dc2626' }}>
                        {lastResult.cleanup.deleted || 0}
                      </div>
                    </StatBox>
                  )}
                </StatusGrid>
              </StatusCard>
            )}

            {/* Logs */}
            {logs.length > 0 && (
              <StatusCard>
                <Title>📋 Operation Logs</Title>
                <LogContainer ref={logContainerRef}>
                  {logs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`log-line ${log.type}`}
                    >
                      {log.message}
                    </div>
                  ))}
                  {loading && (
                    <div className="log-line info">
                      <span style={{ animation: 'pulse 1.5s infinite' }}>⏳ Processing...</span>
                    </div>
                  )}
                </LogContainer>
              </StatusCard>
            )}

            {/* Info */}
            <StatusCard style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
              <Title>ℹ️ About the Scraper</Title>
              <div style={{ color: '#0c4a6e', lineHeight: '1.7' }}>
                <p><strong>Full Scrape:</strong> Scrapes all VFV cats from Adopt-a-Pet, saves to database, and removes old entries (7+ days)</p>
                <p><strong>Scrape Only:</strong> Only fetches and updates cat data without cleanup</p>
                <p><strong>Cleanup Only:</strong> Removes partner foster cats not updated in 7+ days</p>
                <p style={{ marginTop: '1rem', fontSize: '14px' }}>
                  ⏰ <strong>Automatic scraping runs daily at 3:00 AM EST</strong>
                </p>
              </div>
            </StatusCard>
          </PageContainer>
        </Container>
      </Section>
    </>
  );
}
