import { useEffect, useState } from 'react';
import './Ventas.css';
import EditarVentaModal from '../modal/EditarVentaModal';
import { API_URL } from '../config';
import {
  TextField,
  Autocomplete,
  Button,
  Grid,
  Box,
  MenuItem,
  Pagination
} from '@mui/material';

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pagina, setPagina] = useState(1);
  const porPagina = 20;

  const [filtros, setFiltros] = useState({
    vendedor: '',
    cliente: '',
    tipo_pago: '',
    facturacion: '',
    estado: '',
    producto: '',
    mes: '',
    anio: ''
  });

  const mesesTexto = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    fetch(`${API_URL}/ventas`)
      .then((res) => res.json())
      .then((data) => {
        const ordenadas = [...data].sort((a, b) => b.id_venta - a.id_venta);
        setVentas(ordenadas);
      })
      .catch((err) => console.error(err));
  }, []);

  const eliminarVenta = async (id) => {
    const confirmacion = window.confirm('¿Estás seguro de eliminar esta venta?');
    if (!confirmacion) return;

    const res = await fetch(`${API_URL}/ventas/${id}`, { method: 'DELETE' });

    if (res.ok) {
      alert('Venta eliminada con éxito');
      setVentas(ventas.filter((v) => v.id_venta !== id));
    } else {
      alert('Error al eliminar la venta');
    }
  };

  const abrirModal = (venta) => {
    fetch(`${API_URL}/ventas/${venta.id_venta}`)
      .then(res => res.json())
      .then(data => {
        setVentaSeleccionada({ ...data.venta, productos: data.productos });
        setModalAbierto(true);
      })
      .catch(err => console.error('Error al obtener detalles de venta', err));
  };

  const cerrarModal = async (guardado) => {
    setModalAbierto(false);
    if (guardado && ventaSeleccionada) {
      const res = await fetch(`${API_URL}/ventas/${ventaSeleccionada.id_venta}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaSeleccionada),
      });

      if (res.ok) {
        alert('Venta actualizada correctamente');

        const nuevaVentaRes = await fetch(`${API_URL}/ventas/${ventaSeleccionada.id_venta}`);
        const data = await nuevaVentaRes.json();

        const actualizadas = ventas.map(v =>
          v.id_venta === ventaSeleccionada.id_venta
            ? {
                ...data.venta,
                productos: data.productos,
                sucursal: v.sucursal,
                vendedor: v.vendedor,
                cliente: v.cliente,
                total_venta: data.productos.reduce(
                  (sum, p) => sum + p.cantidad * parseFloat(p.precio_unitario),
                  0
                ) * (data.venta.facturacion ? 1.08 : 1),
              }
            : v
        );

        setVentas(actualizadas);
      } else {
        alert('Error al actualizar la venta');
      }
    }
    setVentaSeleccionada(null);
  };

  const resumen = ventas.reduce(
    (acc, venta) => {
      const totalBase = venta.productos.reduce(
        (suma, p) => suma + p.cantidad * parseFloat(p.precio_unitario),
        0
      );
      const totalConIVA = venta.facturacion ? totalBase * 1.08 : totalBase;

      const totalCompra = venta.productos.reduce((suma, p) => {
        const cantidad = parseFloat(p.cantidad_comprada || 0);
        const costo = parseFloat(p.costo_unitario || 0);
        return suma + cantidad * costo;
      }, 0);

      const ganancia = totalConIVA - totalCompra;

      return {
        totalVentas: acc.totalVentas + totalConIVA,
        totalGanancia: acc.totalGanancia + ganancia,
      };
    },
    { totalVentas: 0, totalGanancia: 0 }
  );

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setFiltros({
      vendedor: '',
      cliente: '',
      tipo_pago: '',
      facturacion: '',
      estado: '',
      producto: '',
      mes: '',
      anio: ''
    });
    setPagina(1);
  };  

  const ventasFiltradas = ventas.filter((venta) => {
    const fecha = new Date(venta.fecha);
    const mesVenta = fecha.getMonth();
    const anioVenta = fecha.getFullYear();

    return (
      (!filtros.vendedor || venta.vendedor?.toLowerCase().includes(filtros.vendedor.toLowerCase())) &&
      (!filtros.cliente || venta.cliente?.toLowerCase().includes(filtros.cliente.toLowerCase())) &&
      (!filtros.tipo_pago || venta.tipo_pago?.toLowerCase() === filtros.tipo_pago.toLowerCase()) &&
      (filtros.facturacion === '' || venta.facturacion === (filtros.facturacion === 'sí')) &&
      (!filtros.estado || venta.estado?.toLowerCase().includes(filtros.estado.toLowerCase())) &&
      (!filtros.producto || venta.productos.some(p =>
        p.producto?.toLowerCase().includes(filtros.producto.toLowerCase())
      )) &&
      (!filtros.mes || mesVenta === mesesTexto.indexOf(filtros.mes)) &&
      (!filtros.anio || anioVenta === parseInt(filtros.anio))
    );
  });

    const resumenFiltrado = ventasFiltradas.reduce((acc, venta) => {
    const totalBase = venta.productos.reduce(
      (suma, p) => suma + p.cantidad * parseFloat(p.precio_unitario),
      0
    );
    const totalConIVA = venta.facturacion ? totalBase * 1.08 : totalBase;

    const totalCompra = venta.productos.reduce((suma, p) => {
      const cantidad = parseFloat(p.cantidad_comprada || 0);
      const costo = parseFloat(p.costo_unitario || 0);
      return suma + cantidad * costo;
    }, 0);

    const ganancia = totalConIVA - totalCompra;

    return {
      totalVentas: acc.totalVentas + totalConIVA,
      totalGanancia: acc.totalGanancia + ganancia,
    };
  }, { totalVentas: 0, totalGanancia: 0 });

  const totalPaginas = Math.ceil(ventasFiltradas.length / porPagina);
  const ventasPaginadas = ventasFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div className="ventas-container">
      <h1>Ventas registradas</h1>

        <Box className="cards-resumen">
           <div className="resumen-card">
            <h2>Totales con filtros:</h2>
            <p><strong>Ventas: ${resumenFiltrado.totalVentas.toFixed(2)}</strong></p>
            <p><strong>Ganancia: ${resumenFiltrado.totalGanancia.toFixed(2)}</strong></p>
          </div>
          <div className="resumen-card">
            <h2>Total acumulado de ventas:</h2>
            <p><strong>${resumen.totalVentas.toFixed(2)}</strong></p>
          </div>
          <div className="resumen-card">
            <h2>Ganancia total acumulada:</h2>
            <p><strong>${resumen.totalGanancia.toFixed(2)}</strong></p>
          </div>
         
        </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={2}>
          <Autocomplete
            freeSolo
            options={[...new Set(ventas.map(v => v.vendedor))].filter(Boolean)}
            value={filtros.vendedor}
            onInputChange={(e, newValue) => handleFiltroChange('vendedor', newValue)}
            renderInput={(params) => <TextField {...params} label="Filtrar por vendedor" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Autocomplete
            freeSolo
            options={[...new Set(ventas.map(v => v.cliente))].filter(Boolean)}
            value={filtros.cliente}
            onInputChange={(e, newValue) => handleFiltroChange('cliente', newValue)}
            renderInput={(params) => <TextField {...params} label="Filtrar por cliente" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            label="Tipo de pago"
            fullWidth
            select
            value={filtros.tipo_pago}
            onChange={(e) => handleFiltroChange('tipo_pago', e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="efectivo">Efectivo</MenuItem>
            <MenuItem value="transferencia">Transferencia</MenuItem>
            <MenuItem value="otro">Otro</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            label="Facturación"
            fullWidth
            select
            value={filtros.facturacion}
            onChange={(e) => handleFiltroChange('facturacion', e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="sí">Sí</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Autocomplete
            freeSolo
            options={['en progreso', 'completada', 'cancelada']}
            value={filtros.estado}
            onInputChange={(e, newValue) => handleFiltroChange('estado', newValue)}
            renderInput={(params) => <TextField {...params} label="Estado" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Autocomplete
            freeSolo
            options={[...new Set(ventas.flatMap(v => v.productos.map(p => p.producto)))].filter(Boolean)}
            value={filtros.producto}
            onInputChange={(e, newValue) => handleFiltroChange('producto', newValue)}
            renderInput={(params) => <TextField {...params} label="Producto" fullWidth />}
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <TextField
            label="Mes"
            select
            fullWidth
            value={filtros.mes}
            onChange={(e) => handleFiltroChange('mes', e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {mesesTexto.map((mes, i) => (
              <MenuItem key={i} value={mes}>{mes}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6} sm={2}>
          <TextField
            label="Año"
            fullWidth
            type="number"
            value={filtros.anio}
            onChange={(e) => handleFiltroChange('anio', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="outlined" color="error" onClick={limpiarFiltros}>Limpiar filtros</Button>
        </Grid>
      </Grid>

      <table className="ventas-tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Sucursal</th>
            <th>Vendedor</th>
            <th>Cliente</th>
            <th>Descripción</th>
            <th>Pago</th>
            <th>Estado</th>
            <th>Facturación</th>
            <th>Monto pagado</th>
            <th>Fecha de pago</th>
            <th>Total</th>
            <th>Ganancia</th>
            <th>Productos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventasPaginadas.map((venta) => {
            const totalBase = venta.productos.reduce(
              (sum, p) => sum + p.cantidad * parseFloat(p.precio_unitario),
              0
            );
            const totalConIVA = venta.facturacion ? totalBase * 1.08 : totalBase;

            const totalCompra = venta.productos.reduce((sum, p) => {
              const cantidad = parseFloat(p.cantidad_comprada || 0);
              const costo = parseFloat(p.costo_unitario || 0);
              return sum + cantidad * costo;
            }, 0);

            const ganancia = totalConIVA - totalCompra;

            return (
              <tr key={venta.id_venta}>
                <td>{venta.id_venta}</td>
                <td>{new Date(venta.fecha).toLocaleDateString()}</td>
                <td>{venta.sucursal}</td>
                <td>{venta.vendedor}</td>
                <td>{venta.cliente}</td>
                <td>{venta.descripcion || '—'}</td>
                <td>{venta.tipo_pago || '—'}</td>
                <td>{venta.estado}</td>
                <td>{venta.facturacion ? 'Sí' : 'No'}</td>
                <td>${venta.monto_pagado}</td>
                <td>{venta.fecha_pago_completo ? new Date(venta.fecha_pago_completo).toLocaleDateString() : '—'}</td>
                <td>${totalConIVA.toFixed(2)}</td>
                <td>${ganancia.toFixed(2)}</td>
                <td>
                  <ul>
                    {venta.productos.map((p, i) => (
                      <li key={i}>
                        {p.cantidad} × {p.producto}
                        {p.color && ` - Color: ${p.color}`}
                        {p.talla && ` - Talla: ${p.talla}`}
                        {p.tipo_talla && ` - Tipo talla: ${p.tipo_talla}`}
                        {p.categoria && ` - Categoría: ${p.categoria}`}
                        <br />(${p.precio_unitario} c/u)
                        {p.cantidad_comprada !== undefined && (
                          <>
                            <br />
                            <small>Compró: {p.cantidad_comprada} × ${p.costo_unitario || 0} c/u</small>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <button className="btn editar" onClick={() => abrirModal(venta)}>Editar</button>
                  <button className="btn eliminar" onClick={() => eliminarVenta(venta.id_venta)}>Eliminar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Box display="flex" justifyContent="center" my={3}>
        <Pagination
          count={totalPaginas}
          page={pagina}
          onChange={(e, value) => setPagina(value)}
          color="primary"
        />
      </Box>

      <EditarVentaModal
        open={modalAbierto}
        venta={ventaSeleccionada}
        onClose={cerrarModal}
        onSave={setVentaSeleccionada}
      />
    </div>
  );
}

export default Ventas;
