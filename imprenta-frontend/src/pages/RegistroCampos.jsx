import { useEffect, useState } from 'react';
import { API_URL } from '../config';
import {
  Tabs, Tab, TextField, Button, Box,
  Table, TableHead, TableRow, TableCell,
  TableBody, Paper, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const entidades = [
  { label: 'Clientes', key: 'clientes' },
  { label: 'Vendedores', key: 'vendedores' },
  { label: 'Sucursales', key: 'sucursales' },
  { label: 'Productos', key: 'productos' }
];

function RegistroCampos() {
  const [tabIndex, setTabIndex] = useState(0);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [datos, setDatos] = useState({
    clientes: [],
    vendedores: [],
    sucursales: [],
    productos: []
  });

  const entidadActual = entidades[tabIndex];

  useEffect(() => {
    setBusqueda('');
    cargarDatos(entidadActual.key);
  }, [tabIndex]);

  const cargarDatos = async (key) => {
    try {
      const res = await fetch(`${API_URL}/datos/${key}`);
      const json = await res.json();
      setDatos(prev => ({ ...prev, [key]: json }));
    } catch (err) {
      console.error(`Error al cargar ${key}:`, err);
    }
  };

  const agregarRegistro = async () => {
    if (!nuevoNombre.trim()) return alert('El nombre no puede estar vacío');
    try {
      const res = await fetch(`${API_URL}/datos/${entidadActual.key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoNombre })
      });
      if (!res.ok) throw new Error('Error al guardar');
      setNuevoNombre('');
      cargarDatos(entidadActual.key);
    } catch (err) {
      console.error('Error al agregar:', err);
      alert('Hubo un error al guardar el nombre');
    }
  };

  const eliminarRegistro = async (id) => {
    try {
      const res = await fetch(`${API_URL}/datos/${entidadActual.key}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar');
      cargarDatos(entidadActual.key);
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Hubo un error al eliminar el registro');
    }
  };

  const getId = (obj) => {
    return obj.id_cliente || obj.id_vendedor || obj.id_sucursal || obj.id_producto;
  };

  const getNombre = (obj) => {
    return obj.nombre || obj.nombre_producto;
  };

  // Filtrado según el valor de búsqueda
  const datosFiltrados = (datos[entidadActual.key] || []).filter(item =>
    getNombre(item).toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Box p={3}>
      <h2>Administrar registros</h2>

      <Tabs value={tabIndex} onChange={(e, i) => setTabIndex(i)} sx={{ mb: 2 }}>
        {entidades.map(ent => (
          <Tab key={ent.key} label={ent.label} />
        ))}
      </Tabs>

      <Box display="flex" gap={1} mb={2}>
        <TextField
          label={`Nuevo ${entidadActual.label.slice(0, -1)}`}
          value={nuevoNombre}
          onChange={e => setNuevoNombre(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={agregarRegistro}>Agregar</Button>
      </Box>

      <TextField
        label={`Buscar ${entidadActual.label.toLowerCase()}`}
        variant="outlined"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Paper sx={{ maxWidth: 600, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell align="right"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datosFiltrados.map(item => (
              <TableRow key={getId(item)}>
                <TableCell>{getNombre(item)}</TableCell>
                <TableCell align="right">
                  <IconButton color="error" onClick={() => eliminarRegistro(getId(item))}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {datosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center">No se encontraron resultados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default RegistroCampos;
