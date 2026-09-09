import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Grid, Card, CardContent,
  Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Chip, Box, LinearProgress, Drawer,
  List, ListItemButton, ListItemIcon, ListItemText, Badge, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Tooltip
} from '@mui/material';
import {
  Dashboard, Storage, NetworkCheck,
  Settings, Notifications, Refresh, Add,
  Warning, CheckCircle, Cancel, Speed, Dns, Visibility, Delete
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://localhost:8080/api';

const EMPTY_SERVER = {
  name: '',
  ipAddress: '',
  description: '',
  location: '',
  operatingSystem: ''
};

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
  { key: 'servers', label: 'Servidores', icon: <Dns /> },
  { key: 'alerts', label: 'Alertas', icon: <Notifications /> },
  { key: 'monitoring', label: 'Monitoramento', icon: <NetworkCheck /> },
  { key: 'settings', label: 'Configurações', icon: <Settings /> }
];

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ONLINE': return <CheckCircle color="success" />;
      case 'OFFLINE': return <Cancel color="error" />;
      case 'DEGRADED': return <Warning color="warning" />;
      default: return <CheckCircle color="disabled" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE': return 'success';
      case 'OFFLINE': return 'error';
      case 'DEGRADED': return 'warning';
      default: return 'default';
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Dns sx={{ mr: 1, color: '#1976d2' }} />
          <strong>{server.name}</strong>
        </Box>
      </TableCell>
      <TableCell>{server.ipAddress}</TableCell>
      <TableCell>
        <Chip
          icon={getStatusIcon(server.status)}
          label={server.status}
          color={getStatusColor(server.status)}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress
              variant="determinate"
              value={server.cpuUsage || 0}
              sx={{
                height: 8,
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: (server.cpuUsage || 0) > 80 ? '#d32f2f' : '#2e7d32'
                }
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {(server.cpuUsage || 0).toFixed(1)}%
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress
              variant="determinate"
              value={server.memoryUsage || 0}
              sx={{
                height: 8,
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: (server.memoryUsage || 0) > 80 ? '#d32f2f' : '#2e7d32'
                }
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {(server.memoryUsage || 0).toFixed(1)}%
          </Typography>
        </Box>
      </TableCell>
      <TableCell>{(server.diskUsage || 0).toFixed(1)}%</TableCell>
      <TableCell>
        <Box>
          <Typography variant="caption">IN: {(server.networkIn || 0).toFixed(1)} Mbps</Typography>
          <br />
          <Typography variant="caption">OUT: {(server.networkOut || 0).toFixed(1)} Mbps</Typography>
        </Box>
      </TableCell>
      <TableCell>
        {server.lastCheck ? new Date(server.lastCheck).toLocaleTimeString() : '—'}
      </TableCell>
      <TableCell>
        <Tooltip title="Ver detalhes">
          <IconButton size="small" color="primary" onClick={() => viewDetails(server)}>
            <Visibility />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remover servidor">
          <IconButton size="small" color="error" onClick={() => setDeleteTarget(server)}>
            <Delete />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );

  const renderTable = (list) => (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: '#e3f2fd' }}>
          <TableRow>
            <TableCell><strong>Servidor</strong></TableCell>
            <TableCell><strong>IP</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>CPU</strong></TableCell>
            <TableCell><strong>Memória</strong></TableCell>
            <TableCell><strong>Disco</strong></TableCell>
            <TableCell><strong>Rede</strong></TableCell>
            <TableCell><strong>Último Check</strong></TableCell>
            <TableCell><strong>Ações</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : list.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <Typography variant="h6" sx={{ py: 4 }}>
                  Nenhum servidor cadastrado
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
                  Adicionar Primeiro Servidor
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

  const renderDashboard = () => (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { title: 'Total Servidores', value: servers.length, icon: <Dns />, color: '#1976d2' },
          { title: 'Online', value: servers.filter(s => s.status === 'ONLINE').length, icon: <CheckCircle />, color: '#2e7d32' },
          { title: 'Alertas', value: alertCount, icon: <Warning />, color: '#ed6c02' },
          {
            title: 'Uso Médio CPU', value: servers.length > 0 ?
              (servers.reduce((a, b) => a + (b.cpuUsage || 0), 0) / servers.length).toFixed(1) + '%' : '0%',
            icon: <Storage />, color: '#9c27b0'
          }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{
                    p: 1, bgcolor: stat.color, color: 'white', borderRadius: 2,
                    display: 'flex', mr: 2
                  }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mt: 2, textAlign: 'center' }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {renderTable(servers)}
    </>
  );

  const renderAlerts = () => {
    const alertServers = servers.filter(s => (s.cpuUsage || 0) > 85 || (s.memoryUsage || 0) > 85);
    return (
      <>
        <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
          Servidores em alerta (CPU ou memória acima de 85%)
        </Typography>
        {!loading && alertServers.length === 0 ? (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography>Nenhum alerta no momento. Tudo dentro do esperado.</Typography>
            </CardContent>
          </Card>
        ) : (
          renderTable(alertServers)
        )}
      </>
    );
  };

  const renderMonitoring = () => (
    <>
      <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
        Uso de CPU e Memória por servidor
      </Typography>
      <Paper sx={{ p: 2, height: 400 }}>
        {servers.length === 0 ? (
          <Typography>Sem dados para exibir ainda.</Typography>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={servers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="%" />
              <ChartTooltip />
              <Legend />
              <Bar dataKey="cpuUsage" name="CPU %" fill="#1976d2" />
              <Bar dataKey="memoryUsage" name="Memória %" fill="#9c27b0" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </>
  );

  const renderSettings = () => (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Configurações</Typography>
        <Typography color="text.secondary">
          Esta seção ainda não foi implementada nesta versão do projeto. As únicas
          configurações ativas hoje são fixas no código: URL da API ({API_URL}) e
          intervalo de atualização automática (30 segundos).
        </Typography>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'servers': return (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="h5">Gerenciar Servidores</Typography>
          </Box>
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
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <ToastContainer position="top-right" theme="colored" />

      <Drawer variant="permanent" sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', bgcolor: '#1a237e' }
      }}>
        <Toolbar>
          <Speed sx={{ color: 'white', mr: 2 }} />
          <Typography variant="h6" sx={{ color: 'white' }}>
            InfraMonitor
          </Typography>
        </Toolbar>
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.key}
                selected={activeView === item.key}
                onClick={() => setActiveView(item.key)}
                sx={{
                  color: 'white',
                  '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.15)' },
                  '&.Mui-selected:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  {item.key === 'alerts'
                    ? <Badge badgeContent={alertCount} color="error">{item.icon}</Badge>
                    : item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f5f5', p: 3, overflow: 'auto' }}>
        <AppBar position="sticky" sx={{ bgcolor: '#1a237e' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {servers.length} Servidores Monitorados
            </Typography>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchServers}
              sx={{ mr: 2, bgcolor: '#283593' }}
            >
              Atualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openAddDialog}
              sx={{ bgcolor: '#283593' }}
            >
              Adicionar
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 3 }}>
          {renderContent()}
        </Container>
      </Box>

      {/* Dialog: Adicionar servidor */}
      <Dialog open={addOpen} onClose={() => !saving && setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Adicionar Servidor</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus margin="dense" label="Nome" fullWidth required
            value={newServer.name} onChange={handleNewServerChange('name')}
          />
          <TextField
            margin="dense" label="Endereço IP" fullWidth required
            value={newServer.ipAddress} onChange={handleNewServerChange('ipAddress')}
          />
          <TextField
            margin="dense" label="Descrição" fullWidth
            value={newServer.description} onChange={handleNewServerChange('description')}
          />
          <TextField
            margin="dense" label="Localização" fullWidth
            value={newServer.location} onChange={handleNewServerChange('location')}
          />
          <TextField
            margin="dense" label="Sistema Operacional" fullWidth
            value={newServer.operatingSystem} onChange={handleNewServerChange('operatingSystem')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={submitNewServer} variant="contained" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Detalhes do servidor */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Detalhes do Servidor</DialogTitle>
        <DialogContent>
          {selectedServer && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <Typography><strong>Nome:</strong> {selectedServer.name}</Typography>
              <Typography><strong>IP:</strong> {selectedServer.ipAddress}</Typography>
              <Typography><strong>Status:</strong> {selectedServer.status}</Typography>
              <Typography><strong>Descrição:</strong> {selectedServer.description || '—'}</Typography>
              <Typography><strong>Localização:</strong> {selectedServer.location || '—'}</Typography>
              <Typography><strong>Sistema Operacional:</strong> {selectedServer.operatingSystem || '—'}</Typography>
              <Typography><strong>CPU:</strong> {(selectedServer.cpuUsage || 0).toFixed(1)}%</Typography>
              <Typography><strong>Memória:</strong> {(selectedServer.memoryUsage || 0).toFixed(1)}%</Typography>
              <Typography><strong>Disco:</strong> {(selectedServer.diskUsage || 0).toFixed(1)}%</Typography>
              <Typography>
                <strong>Último check:</strong>{' '}
                {selectedServer.lastCheck ? new Date(selectedServer.lastCheck).toLocaleString() : '—'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Confirmar exclusão */}
      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>Remover servidor</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja remover "{deleteTarget?.name}"? Essa ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Removendo...' : 'Remover'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
