import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Container, Grid, Card, CardContent, 
  Button, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, IconButton, Chip, Box, LinearProgress, Drawer,
  List, ListItem, ListItemIcon, ListItemText, Badge, CircularProgress
} from '@mui/material';
import {
  Dashboard, Storage, Memory, NetworkCheck,
  Security, Settings, Notifications, Refresh, Add,
  Warning, CheckCircle, Cancel, Speed, Dns, Visibility
} from '@mui/icons-material';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://localhost:8080/api';

function App() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertCount, setAlertCount] = useState(0);

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
      toast.error('Erro ao carregar servidores');
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'ONLINE': return <CheckCircle color="success" />;
      case 'OFFLINE': return <Cancel color="error" />;
      case 'DEGRADED': return <Warning color="warning" />;
      default: return <CheckCircle color="disabled" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ONLINE': return 'success';
      case 'OFFLINE': return 'error';
      case 'DEGRADED': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Router>
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
              {['Dashboard', 'Servidores', 'Alertas', 'Monitoramento', 'Configurações'].map((text, index) => (
                <ListItem key={text} sx={{ color: 'white' }}>
                  <ListItemIcon sx={{ color: 'white' }}>
                    {index === 0 && <Dashboard />}
                    {index === 1 && <Dns />}
                    {index === 2 && <Badge badgeContent={alertCount} color="error"><Notifications /></Badge>}
                    {index === 3 && <NetworkCheck />}
                    {index === 4 && <Settings />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f5f5', p: 3 }}>
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
                onClick={() => toast.info('Função de adicionar servidor')}
                sx={{ bgcolor: '#283593' }}
              >
                Adicionar
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="xl" sx={{ mt: 3 }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {[
                { title: 'Total Servidores', value: servers.length, icon: <Dns />, color: '#1976d2' },
                { title: 'Online', value: servers.filter(s => s.status === 'ONLINE').length, icon: <CheckCircle />, color: '#2e7d32' },
                { title: 'Alertas', value: alertCount, icon: <Warning />, color: '#ed6c02' },
                { title: 'Uso Médio CPU', value: servers.length > 0 ? 
                  (servers.reduce((a, b) => a + (b.cpuUsage || 0), 0) / servers.length).toFixed(1) + '%' : '0%', 
                  icon: <Storage />, color: '#9c27b0' }
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ 
                          p: 1, 
                          bgcolor: stat.color, 
                          color: 'white', 
                          borderRadius: 2,
                          display: 'flex',
                          mr: 2
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
                  ) : servers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="h6" sx={{ py: 4 }}>
                          Nenhum servidor cadastrado
                        </Typography>
                        <Button variant="contained" startIcon={<Add />}>
                          Adicionar Primeiro Servidor
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    servers.map((server) => (
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
                        <TableCell>
                          {(server.diskUsage || 0).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="caption">IN: {(server.networkIn || 0).toFixed(1)} Mbps</Typography>
                            <br />
                            <Typography variant="caption">OUT: {(server.networkOut || 0).toFixed(1)} Mbps</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(server.lastCheck).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary" onClick={() => toast.info('Ver detalhes')}>
                            <Visibility />
                          </IconButton>
                          <IconButton size="small" color="success" onClick={() => toast.success('Teste de conectividade')}>
                            <NetworkCheck />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
