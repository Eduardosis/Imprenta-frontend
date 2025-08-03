// src/modal/EditarVentaModal.jsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid, IconButton, Checkbox, FormControlLabel 
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { API_URL } from '../config';
import Autocomplete from '@mui/material/Autocomplete';

function EditarVentaModal({ open, onClose, venta, onSave }) {
  const [sucursales, setSucursales] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);

  const tallasSugeridas = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const coloresSugeridos = ['blanco', 'negro', 'azul', 'rojo', 'verde'];
  const tipotallasSugeridas = ['Bebe','Niño', 'Juvenil', 'Adulto'];

  useEffect(() => {
    if (!open) return;

    const fetchDatos = async () => {
      try {
        const [sRes, vRes, cRes, pRes] = await Promise.all([
          fetch(`${API_URL}/datos/sucursales`).then(res => res.json()),
          fetch(`${API_URL}/datos/vendedores`).then(res => res.json()),
          fetch(`${API_URL}/datos/clientes`).then(res => res.json()),
          fetch(`${API_URL}/datos/productos`).then(res => res.json())
        ]);

        setSucursales(sRes);
        setVendedores(vRes);
        setClientes(cRes);
        setProductosDisponibles(pRes);
      } catch (err) {
        console.error('Error cargando datos del modal:', err);
      }
    };

    fetchDatos();
  }, [open]);

  if (!venta) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    onSave(prev => ({ ...prev, [name]: value }));
  };

  const actualizarProducto = (index, campo, valor) => {
    const nuevos = [...venta.productos];
    nuevos[index][campo] = valor;
    onSave(prev => ({ ...prev, productos: nuevos }));
  };

  const agregarProducto = () => {
    const nuevo = {
      uid: Date.now() + Math.random(),
      id_producto: '',
      talla: '',
      tipo_talla: '',
      color: '',
      categoria: '',
      cantidad: 1,
      precio_unitario: '',
      cantidad_comprada: 0,
      costo_unitario: ''
    };
    onSave(prev => ({ ...prev, productos: [...prev.productos, nuevo] }));
  };

  const eliminarProducto = (index) => {
    const nuevos = [...venta.productos];
    nuevos.splice(index, 1);
    onSave(prev => ({ ...prev, productos: nuevos }));
  };

  const validarVenta = () => {
    if (!venta.id_sucursal) return 'Debe seleccionar una sucursal';
    if (!venta.id_vendedor) return 'Debe seleccionar un vendedor';
    if (!venta.id_cliente) return 'Debe seleccionar un cliente';
    if (!Array.isArray(venta.productos) || venta.productos.length === 0) return 'Debe haber al menos un producto';

    for (let i = 0; i < venta.productos.length; i++) {
      const p = venta.productos[i];
      if (!p.id_producto) return `Seleccione un producto en la fila ${i + 1}`;
      if (!p.cantidad || parseInt(p.cantidad) <= 0) return `Cantidad inválida en la fila ${i + 1}`;
      if (!p.precio_unitario || parseFloat(p.precio_unitario) <= 0) return `Precio unitario inválido en la fila ${i + 1}`;
    }

    return null;
  };

  const handleGuardar = () => {
    const error = validarVenta();
    if (error) {
      alert(error);
      return;
    }
    onClose(true);
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
      <DialogTitle>Editar venta #{venta.id_venta}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Sucursal" name="id_sucursal" value={venta.id_sucursal || ''} onChange={handleChange}>
              {sucursales.map((s) => <MenuItem key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Autocomplete
              options={vendedores}
              getOptionLabel={(option) => option.nombre}
              value={vendedores.find(v => v.id_vendedor === venta.id_vendedor) || null}
              onChange={(e, newValue) => {
                if (newValue) {
                  onSave(prev => ({ ...prev, id_vendedor: newValue.id_vendedor, vendedor: newValue.nombre }));
                } else {
                  onSave(prev => ({ ...prev, id_vendedor: null, vendedor: '' }));
                }
              }}
              renderInput={(params) => <TextField {...params} label="Vendedor" fullWidth />}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Autocomplete
              options={clientes}
              getOptionLabel={(option) => option.nombre}
              value={clientes.find(c => c.id_cliente === venta.id_cliente) || null}
              onChange={(e, newValue) => {
                if (newValue) {
                  onSave(prev => ({ ...prev, id_cliente: newValue.id_cliente, cliente: newValue.nombre }));
                } else {
                  onSave(prev => ({ ...prev, id_cliente: null, cliente: '' }));
                }
              }}
              renderInput={(params) => <TextField {...params} label="Cliente" fullWidth />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Descripción" name="descripcion" value={venta.descripcion || ''} onChange={handleChange} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Tipo de pago" name="tipo_pago" value={venta.tipo_pago || ''} onChange={handleChange}>
              <MenuItem value="efectivo">Efectivo</MenuItem>
              <MenuItem value="transferencia">Transferencia</MenuItem>
              <MenuItem value="otro">Otro</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Estado" name="estado" value={venta.estado || ''} onChange={handleChange}>
              <MenuItem value="en progreso">En progreso</MenuItem>
              <MenuItem value="completada">Completada</MenuItem>
              <MenuItem value="cancelada">Cancelada</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField type="number" fullWidth label="Monto pagado" name="monto_pagado" value={venta.monto_pagado || ''} onChange={handleChange} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField type="date" fullWidth label="Fecha de pago" name="fecha_pago_completo" InputLabelProps={{ shrink: true }} value={venta.fecha_pago_completo ? new Date(venta.fecha_pago_completo).toISOString().split('T')[0] : ''} onChange={handleChange} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={venta.facturacion || false}
                  onChange={(e) => onSave(prev => ({ ...prev, facturacion: e.target.checked }))}
                />
              }
              label="¿Requiere facturación? (8% IVA)"
            />
          </Grid>

          <Grid item xs={12}><strong></strong></Grid>
          {venta.productos?.map((p, i) => (
            <Grid container spacing={2} key={p.uid || i} sx={{ mb: 2, pl: 2 }}>
              <Grid item xs={12} sm={3}>
                <TextField select fullWidth label="Producto" value={p.id_producto} onChange={e => actualizarProducto(i, 'id_producto', e.target.value)}>
                  {productosDisponibles.map(prod => (
                    <MenuItem key={prod.id_producto} value={prod.id_producto}>
                      {prod.nombre_producto}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={1.5}>
                <Autocomplete
                  freeSolo
                  options={tallasSugeridas}
                  value={p.talla || ''}
                  onInputChange={(e, value) => actualizarProducto(i, 'talla', value)}
                  renderInput={(params) => <TextField {...params} label="Talla" fullWidth />}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <Autocomplete
                  freeSolo
                  options={coloresSugeridos}
                  value={p.color || ''}
                  onInputChange={(e, value) => actualizarProducto(i, 'color', value)}
                  renderInput={(params) => <TextField {...params} label="Color" fullWidth />}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <Autocomplete
                  freeSolo
                  options={tipotallasSugeridas}
                  value={p.tipo_talla || ''}
                  onInputChange={(e, value) => actualizarProducto(i, 'tipo_talla', value)}
                  renderInput={(params) => <TextField {...params} label="Tipo talla" fullWidth />}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField fullWidth label="Categoría" value={p.categoria || ''} onChange={e => actualizarProducto(i, 'categoria', e.target.value)} />
              </Grid>
              <Grid item xs={6} sm={1.5}>
                <TextField type="number" label="Cantidad" fullWidth value={p.cantidad} onChange={e => actualizarProducto(i, 'cantidad', e.target.value)} />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField type="number" label="Precio U." fullWidth value={p.precio_unitario} onChange={e => actualizarProducto(i, 'precio_unitario', e.target.value)} />
              </Grid>
              <Grid item xs={6} sm={1.5}>
                <TextField type="number" label="Comprado" fullWidth value={p.cantidad_comprada} onChange={e => actualizarProducto(i, 'cantidad_comprada', e.target.value)} />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField type="number" label="Costo U." fullWidth value={p.costo_unitario} onChange={e => actualizarProducto(i, 'costo_unitario', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={1}>
                <IconButton onClick={() => eliminarProducto(i)}><Delete /></IconButton>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="outlined" startIcon={<Add />} onClick={agregarProducto}>Agregar producto</Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancelar</Button>
        <Button variant="contained" onClick={handleGuardar}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditarVentaModal;
