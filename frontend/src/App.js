import React, { useState, useEffect } from 'react';
import {
  Typography, Container, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Box, LinearProgress,
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip
} from '@mui/material';
import {
  Dashboard, NetworkCheck,
  Settings, Notifications, Refresh, Add,
  Warning, Speed, Dns, Visibility, Delete
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { colors } from './theme';

const API_URL = 'http://localhost:8080/api';

const EMPTY_SERVER = {
  name: '',
  ipAddress: '',
  description: '',
  location: '',
  operatingSystem: ''
};

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <Dashboard fontSize="small" /> },
  { key: 'servers', label: 'Servidores', icon: <Dns fontSize="small" /> },
  { key: 'alerts', label: 'Alertas', icon: <Notifications fontSize="small" /> },
  { key: 'monitoring', label: 'Monitoramento', icon: <NetworkCheck fontSize="small" /> },
  { key: 'settings', label: 'Configurações', icon: <Settings fontSize="small" /> }
];

const STATUS_META = {
  ONLINE: { color: colors.online, label: 'online' },
  OFFLINE: { color: colors.offline, label: 'offline' },
  DEGRADED: { color: colors.degraded, label: 'degradado' },
  MAINTENANCE: { color: colors.textSecondary, label: 'manutenção' }
};

const mono = { fontFamily: "'IBM Plex Mono', monospace" };

function StatusDot({ status }) {
  const meta = STATUS_META[status] || { color: colors.textSecondary, label: status || '—' };
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: meta.color, flexShrink: 0 }} />
      <Typography variant="body2" sx={{ ...mono, color: colors.textPrimary }}>
        {meta.label}
      </Typography>
    </Box>
  );
}

function MetricBar({ value }) {
  const v = value || 0;
  const barColor = v > 85 ? colors.offline : v > 70 ? colors.degraded : colors.accent;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ width: 72 }}>
        <LinearProgress
          variant="determinate"
          value={v}
          sx={{
            height: 4,
            borderRadius: 2,
            '& .MuiLinearProgress-bar': { backgroundColor: barColor, borderRadius: 2 }
          }}
        />
      </Box>
      <Typography variant="body2" sx={{ ...mono, color: colors.textSecondary, minWidth: 40 }}>
        {v.toFixed(1)}%
      </Typography>
    </Box>
  );
}

function App() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertCount, setAlertCount] = useState(0);
  const [activeView, setActiveView] = useState('dashboard');

  const [addOpen, setAddOpen] = useState(false);
  const [newServer, setNewServer] = useState(EMPTY_SERVER);
  const [saving, setSaving] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchServers = async () => {
    try {
      const response = await axios.get(`${API_URL}/servers`);
      setServers(response.data);
      const alerts = response.data.filter(s => s.cpuUsage > 85 || s.memoryUsage > 85);
      setAlertCount(alerts.length);
      setLoading(false);
    } catch (error) {
      toast.error('Erro ao carregar servidores. O backend está rodando em localhost:8080?');
      setLoading(false);
    }
  };

  // ---- Adicionar servidor ----
  const openAddDialog = () => {
    setNewServer(EMPTY_SERVER);
    setAddOpen(true);
  };

  const handleNewServerChange = (field) => (e) => {
    setNewServer(prev => ({ ...prev, [field]: e.target.value }));
  };

  const submitNewServer = async () => {
    if (!newServer.name.trim() || !newServer.ipAddress.trim()) {
      toast.warning('Nome e IP são obrigatórios');
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API_URL}/servers`, newServer);
      toast.success(`Servidor "${newServer.name}" adicionado`);
      setAddOpen(false);
      fetchServers();
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao adicionar servidor (nome já existe?)';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ---- Ver detalhes ----
  const viewDetails = async (server) => {
    setSelectedServer(server);
    setDetailsOpen(true);
    try {
      const response = await axios.get(`${API_URL}/servers/${server.id}`);
      setSelectedServer(response.data);
    } catch (error) {
      toast.error('Não foi possível atualizar os detalhes desse servidor');
    }
  };

  // ---- Excluir servidor ----
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/servers/${deleteTarget.id}`);
      toast.success(`Servidor "${deleteTarget.name}" removido`);
      setDeleteTarget(null);
      fetchServers();
    } catch (error) {
      toast.error('Erro ao remover servidor');
    } finally {
      setDeleting(false);
    }
  };

  const renderServerRow = (server) => (
    <TableRow key={server.id}>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Dns sx={{ fontSize: 18, color: colors.textSecondary }} />
          <Typography sx={{ fontWeight: 500 }}>{server.name}</Typography>
        </Box>
      </TableCell>
      <TableCell sx={mono}>{server.ipAddress}</TableCell>
      <TableCell><StatusDot status={server.status} /></TableCell>
      <TableCell><MetricBar value={server.cpuUsage} /></TableCell>
      <TableCell><MetricBar value={server.memoryUsage} /></TableCell>
      <TableCell sx={mono}>{(server.diskUsage || 0).toFixed(1)}%</TableCell>
      <TableCell sx={mono}>
        <Typography variant="caption" sx={mono} component="div">↓ {(server.networkIn || 0).toFixed(1)} Mbps</Typography>
        <Typography variant="caption" sx={mono} component="div">↑ {(server.networkOut || 0).toFixed(1)} Mbps</Typography>
      </TableCell>
      <TableCell sx={{ ...mono, color: colors.textSecondary }}>
        {server.lastCheck ? new Date(server.lastCheck).toLocaleTimeString() : '—'}
      </TableCell>
      <TableCell align="right">
        <Tooltip title="Ver detalhes">
          <IconButton size="small" onClick={() => viewDetails(server)}>
            <Visibility fontSize="small" sx={{ color: colors.textSecondary }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remover servidor">
          <IconButton size="small" onClick={() => setDeleteTarget(server)}>
            <Delete fontSize="small" sx={{ color: colors.textSecondary }} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );

  const renderTable = (list) => (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>servidor</TableCell>
            <TableCell>ip</TableCell>
            <TableCell>status</TableCell>
            <TableCell>cpu</TableCell>
            <TableCell>memória</TableCell>
            <TableCell>disco</TableCell>
            <TableCell>rede</TableCell>
            <TableCell>último check</TableCell>
            <TableCell align="right">ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                <CircularProgress size={24} sx={{ color: colors.accent }} />
              </TableCell>
            </TableRow>
          ) : list.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                <Typography sx={{ color: colors.textSecondary, mb: 2 }}>
                  Nenhum servidor cadastrado ainda
                </Typography>
                <Button variant="outlined" startIcon={<Add />} onClick={openAddDialog}>
                  Adicionar primeiro servidor
                </Button>
              </TableCell>
            </TableRow>
          ) : (
            list.map(renderServerRow)
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const statBlocks = [
    { label: 'Total de servidores', value: servers.length },
    { label: 'Online', value: servers.filter(s => s.status === 'ONLINE').length },
    { label: 'Em alerta', value: alertCount, highlight: alertCount > 0 },
    {
      label: 'CPU média',
      value: servers.length > 0
        ? (servers.reduce((a, b) => a + (b.cpuUsage || 0), 0) / servers.length).toFixed(1) + '%'
        : '—'
    }
  ];

  const renderStatStrip = () => (
    <Paper sx={{ display: 'flex', mb: 3 }}>
      {statBlocks.map((stat, i) => (
        <Box
          key={stat.label}
          sx={{
            flex: 1,
            p: 2.5,
            borderRight: i < statBlocks.length - 1 ? `1px solid ${colors.border}` : 'none'
          }}
        >
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
            {stat.label}
          </Typography>
          <Typography
            variant="h4"
            sx={{ ...mono, fontWeight: 600, color: stat.highlight ? colors.degraded : colors.textPrimary }}
          >
            {stat.value}
          </Typography>
        </Box>
      ))}
    </Paper>
  );

  const renderDashboard = () => (
    <>
      {renderStatStrip()}
      {renderTable(servers)}
    </>
  );

  const renderAlerts = () => {
    const alertServers = servers.filter(s => (s.cpuUsage || 0) > 85 || (s.memoryUsage || 0) > 85);
    return (
      <>
        <Typography variant="h5" sx={{ mt: 1, mb: 2 }}>
          Servidores em alerta
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
          CPU ou memória acima de 85% de uso
        </Typography>
        {!loading && alertServers.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: colors.textSecondary }}>
              Nenhum alerta no momento. Tudo dentro do esperado.
            </Typography>
          </Paper>
        ) : (
          renderTable(alertServers)
        )}
      </>
    );
  };

  const renderMonitoring = () => (
    <>
      <Typography variant="h5" sx={{ mt: 1, mb: 2 }}>
        Uso de CPU e memória por servidor
      </Typography>
      <Paper sx={{ p: 3, height: 420 }}>
        {servers.length === 0 ? (
          <Typography sx={{ color: colors.textSecondary }}>Sem dados para exibir ainda.</Typography>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={servers}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="name" stroke={colors.textSecondary} tick={{ fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
              <YAxis unit="%" stroke={colors.textSecondary} tick={{ fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
              <ChartTooltip
                contentStyle={{ backgroundColor: colors.elevated, border: `1px solid ${colors.border}`, borderRadius: 6 }}
                labelStyle={{ color: colors.textPrimary }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="cpuUsage" name="CPU %" fill={colors.accent} radius={[3, 3, 0, 0]} />
              <Bar dataKey="memoryUsage" name="Memória %" fill={colors.degraded} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </>
  );

  const renderSettings = () => (
    <Paper sx={{ p: 3, mt: 1 }}>
      <Typography variant="h6" gutterBottom>Configurações</Typography>
      <Typography sx={{ color: colors.textSecondary }}>
        Esta seção ainda não foi implementada nesta versão do projeto. As únicas
        configurações ativas hoje são fixas no código: URL da API ({API_URL}) e
        intervalo de atualização automática (30 segundos).
      </Typography>
    </Paper>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'servers': return (
        <>
          <Typography variant="h5" sx={{ mt: 1, mb: 2 }}>Gerenciar servidores</Typography>
          {renderTable(servers)}
        </>
      );
      case 'alerts': return renderAlerts();
      case 'monitoring': return renderMonitoring();
      case 'settings': return renderSettings();
      case 'dashboard':
      default: return renderDashboard();
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.bg }}>
      <ToastContainer position="top-right" theme="dark" />

      <Drawer
        variant="permanent"
        sx={{
          width: 224,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: 224, boxSizing: 'border-box', borderRight: `1px solid ${colors.border}` }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 3 }}>
          <Speed sx={{ color: colors.accent, fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
            InfraMonitor
          </Typography>
        </Box>
        <List sx={{ px: 1 }}>
          {NAV_ITEMS.map((item) => {
            const selected = activeView === item.key;
            return (
              <ListItemButton
                key={item.key}
                selected={selected}
                onClick={() => setActiveView(item.key)}
                sx={{
                  borderRadius: 1,
                  mb: 0.25,
                  pl: 1.5,
                  borderLeft: '3px solid transparent',
                  color: selected ? colors.textPrimary : colors.textSecondary,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(47,216,196,0.08)',
                    borderLeft: `3px solid ${colors.accent}`
                  },
                  '&.Mui-selected:hover': { bgcolor: 'rgba(47,216,196,0.12)' },
                  '&:hover': { bgcolor: 'rgba(231,234,242,0.04)' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: selected ? colors.accent : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: selected ? 600 : 400 }}
                />
                {item.key === 'alerts' && alertCount > 0 && (
                  <Box sx={{
                    ...mono, fontSize: '0.7rem', color: colors.degraded,
                    bgcolor: 'rgba(242,166,61,0.12)', borderRadius: 4, px: 0.75, py: 0.1
                  }}>
                    {alertCount}
                  </Box>
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 7, height: 7, borderRadius: '50%', bgcolor: colors.accent,
                boxShadow: `0 0 0 3px rgba(47,216,196,0.18)`
              }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                monitoramento ativo
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ mt: 0.5 }}>
              {servers.length} servidores monitorados
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh fontSize="small" />}
            onClick={fetchServers}
            sx={{ mr: 1.5 }}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<Add fontSize="small" />}
            onClick={openAddDialog}
          >
            Adicionar servidor
          </Button>
        </Box>

        <Container maxWidth="xl" disableGutters>
          {renderContent()}
        </Container>
      </Box>

      {/* Dialog: Adicionar servidor */}
      <Dialog open={addOpen} onClose={() => !saving && setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Adicionar servidor</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            autoFocus label="Nome" fullWidth required
            value={newServer.name} onChange={handleNewServerChange('name')}
          />
          <TextField
            label="Endereço IP" fullWidth required
            value={newServer.ipAddress} onChange={handleNewServerChange('ipAddress')}
          />
          <TextField
            label="Descrição" fullWidth
            value={newServer.description} onChange={handleNewServerChange('description')}
          />
          <TextField
            label="Localização" fullWidth
            value={newServer.location} onChange={handleNewServerChange('location')}
          />
          <TextField
            label="Sistema operacional" fullWidth
            value={newServer.operatingSystem} onChange={handleNewServerChange('operatingSystem')}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setAddOpen(false)} disabled={saving} sx={{ color: colors.textSecondary }}>
            Cancelar
          </Button>
          <Button onClick={submitNewServer} variant="contained" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Detalhes do servidor */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Detalhes do servidor</DialogTitle>
        <DialogContent>
          {selectedServer && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 0.5 }}>
              {[
                ['Nome', selectedServer.name],
                ['IP', selectedServer.ipAddress],
                ['Status', STATUS_META[selectedServer.status]?.label || selectedServer.status],
                ['Descrição', selectedServer.description || '—'],
                ['Localização', selectedServer.location || '—'],
                ['Sistema operacional', selectedServer.operatingSystem || '—'],
                ['CPU', `${(selectedServer.cpuUsage || 0).toFixed(1)}%`],
                ['Memória', `${(selectedServer.memoryUsage || 0).toFixed(1)}%`],
                ['Disco', `${(selectedServer.diskUsage || 0).toFixed(1)}%`],
                ['Último check', selectedServer.lastCheck ? new Date(selectedServer.lastCheck).toLocaleString() : '—']
              ].map(([label, value]) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>{label}</Typography>
                  <Typography variant="body2" sx={mono}>{value}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDetailsOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Confirmar exclusão */}
      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning sx={{ color: colors.degraded, fontSize: 20 }} />
          Remover servidor
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.textSecondary }}>
            Tem certeza que deseja remover <strong style={{ color: colors.textPrimary }}>{deleteTarget?.name}</strong>?
            Essa ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} sx={{ color: colors.textSecondary }}>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Removendo...' : 'Remover'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
