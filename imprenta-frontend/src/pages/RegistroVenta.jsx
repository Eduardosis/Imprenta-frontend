import { useEffect, useState } from 'react';
import { API_URL } from '../config';
import './RegistroVenta.css';

function RegistroVenta() {
  const [sucursales, setSucursales] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [tallas, setTallas] = useState(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
  const [colores, setColores] = useState([]);
  const [tiposTalla, setTiposTalla] = useState([]);
  const [categoriasProducto, setCategoriasProducto] = useState([]);

  const [form, setForm] = useState({
    id_sucursal: '',
    descripcion: '',
    tipo_pago: '',
    productos: [],
    monto_pagado: 0,
    estado: 'en progreso',
    fecha_pago_completo: '',
    vendedor: '',
    cliente: '',
    facturacion: false  
  });

  useEffect(() => {
    fetch(`${API_URL}/datos/sucursales`).then(res => res.json()).then(setSucursales);
    fetch(`${API_URL}/datos/vendedores`).then(res => res.json()).then(setVendedores);
    fetch(`${API_URL}/datos/clientes`).then(res => res.json()).then(setClientes);
    fetch(`${API_URL}/datos/productos`).then(res => res.json()).then(setProductosDisponibles);
    fetch(`${API_URL}/datos/colores`).then(res => res.json()).then(setColores);
    fetch(`${API_URL}/datos/tipos-talla`).then(res => res.json()).then(setTiposTalla);
  fetch(`${API_URL}/datos/categorias-producto`).then(res => res.json()).then(setCategoriasProducto);
  }, []);

  const agregarProducto = () => {
    setForm(prev => ({
      ...prev,
      productos: [...prev.productos, {
        uid: Date.now() + Math.random(),
        id_producto: '',
        talla: '',
        tipo_talla: '',
        color: '',
        categoria: '',
        cantidad: 1,
        precio_unitario: '',
        cantidad_comprada: '',
        costo_unitario: ''
      }]
    }));
  };

  const actualizarProducto = (index, campo, valor) => {
    const nuevos = [...form.productos];
    nuevos[index][campo] = valor;
    setForm({ ...form, productos: nuevos });
  };

  const eliminarProducto = (index) => {
    const nuevos = [...form.productos];
    nuevos.splice(index, 1);
    setForm({ ...form, productos: nuevos });
  };

  const handleVendedorChange = (value) => {
    const match = vendedores.find(v => v.nombre.toLowerCase() === value.toLowerCase());
    setForm(prev => ({ ...prev, vendedor: match ? match.nombre : value }));
  };

  const handleClienteChange = (value) => {
    const match = clientes.find(c => c.nombre.toLowerCase() === value.toLowerCase());
    setForm(prev => ({ ...prev, cliente: match ? match.nombre : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_sucursal) return alert('Debe seleccionar una sucursal');
    if (!form.vendedor.trim()) return alert('Debe seleccionar o ingresar un vendedor');
    if (!form.cliente.trim()) return alert('Debe seleccionar o ingresar un cliente');
    if (form.productos.length === 0) return alert('Debe agregar al menos un producto');

    for (const [i, p] of form.productos.entries()) {
      if (!p.id_producto) return alert(`Debe seleccionar un producto en la fila ${i + 1}`);
      if (!p.cantidad || parseInt(p.cantidad) <= 0) return alert(`Cantidad inválida en la fila ${i + 1}`);
      if (!p.precio_unitario || parseFloat(p.precio_unitario) <= 0) return alert(`Precio unitario inválido en la fila ${i + 1}`);
      if (p.cantidad_comprada !== '' && parseInt(p.cantidad_comprada) < 0) return alert(`Cantidad comprada inválida en la fila ${i + 1}`);
      if (p.costo_unitario !== '' && parseFloat(p.costo_unitario) < 0) return alert(`Costo unitario inválido en la fila ${i + 1}`);
    }

    const productosValidos = form.productos.map(p => ({
      id_producto: parseInt(p.id_producto),
      talla: p.talla || null,
      tipo_talla: p.tipo_talla || null,
      color: p.color || null,
      categoria: p.categoria || null,
      cantidad: parseInt(p.cantidad),
      precio_unitario: parseFloat(p.precio_unitario),
      cantidad_comprada: parseInt(p.cantidad_comprada) || 0,
      costo_unitario: parseFloat(p.costo_unitario) || 0
    }));

    const payload = {
      id_sucursal: parseInt(form.id_sucursal),
      nuevo_vendedor: form.vendedor.trim(),
      nuevo_cliente: form.cliente.trim(),
      descripcion: form.descripcion.trim() || null,
      tipo_pago: form.tipo_pago || null,
      monto_pagado: parseFloat(form.monto_pagado),
      estado: form.estado,
      fecha_pago_completo: form.estado === 'completada' ? form.fecha_pago_completo || null : null,
      facturacion: form.facturacion, 
      productos: productosValidos
    };

    const res = await fetch(`${API_URL}/ventas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('Venta registrada con éxito');
      window.location.reload();
    } else {
      const errorData = await res.json();
      alert('Error al registrar la venta: ' + (errorData.error || ''));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="registro-form">
      <h2>Registrar nueva venta</h2>

      <label>Sucursal:
        <select value={form.id_sucursal} onChange={e => setForm({ ...form, id_sucursal: e.target.value })}>
          <option value="">Seleccione una sucursal</option>
          {sucursales.map(s => (
            <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
          ))}
        </select>
      </label>

      <label>Vendedor (buscar o escribir):
        <input list="lista-vendedores" value={form.vendedor} onChange={e => handleVendedorChange(e.target.value)} />
        <datalist id="lista-vendedores">
          {vendedores.map(v => (
            <option key={v.id_vendedor} value={v.nombre} />
          ))}
        </datalist>
      </label>

      <label>Cliente (buscar o escribir):
        <input list="lista-clientes" value={form.cliente} onChange={e => handleClienteChange(e.target.value)} />
        <datalist id="lista-clientes">
          {clientes.map(c => (
            <option key={c.id_cliente} value={c.nombre} />
          ))}
        </datalist>
      </label>

      <label>Descripción de la venta:
        <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={3} />
      </label>

      <label>Tipo de pago:
        <select value={form.tipo_pago} onChange={e => setForm({ ...form, tipo_pago: e.target.value })}>
          <option value="">Seleccione un tipo</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="otro">Otro</option>
        </select>
      </label>

      <h3>Productos</h3>
      {form.productos.map((p, index) => (
        <div key={p.uid} className="producto-item">
          <div className="producto-header">
            <strong>Producto #{index + 1}</strong>
            <button type="button" className="btn btn-eliminar" onClick={() => eliminarProducto(index)}>Eliminar</button>
          </div>

          <div className="campo">
            <label>Producto:</label>
            <select value={p.id_producto} onChange={e => actualizarProducto(index, 'id_producto', e.target.value)}>
              <option value="">Seleccione un producto</option>
              {productosDisponibles.map(prod => (
                <option key={prod.id_producto} value={prod.id_producto}>
                  {prod.nombre_producto}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label>Talla:</label>
            <select value={p.talla} onChange={e => actualizarProducto(index, 'talla', e.target.value)}>
              <option value="">Seleccione talla</option>
              {tallas.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="campo">
            <label>Tipo de talla (niño, juvenil, adulto, otro):</label>
            <input
              list={`lista-tipo-talla-${p.uid}`}
              value={p.tipo_talla}
              onChange={e => actualizarProducto(index, 'tipo_talla', e.target.value)}
            />
            <datalist id={`lista-tipo-talla-${p.uid}`}>
              {tiposTalla.map((tipo, idx) => (
                <option key={idx} value={tipo} />
              ))}
            </datalist>
          </div>

          <div className="campo">
            <label>Color:</label>
            <input list="lista-colores" value={p.color} onChange={e => actualizarProducto(index, 'color', e.target.value)} />
            <datalist id="lista-colores">
              {colores.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="campo">
            <label>Categoría del producto:</label>
            <input
              list={`lista-categoria-${p.uid}`}
              value={p.categoria}
              onChange={e => actualizarProducto(index, 'categoria', e.target.value)}
            />
            <datalist id={`lista-categoria-${p.uid}`}>
              {categoriasProducto.map((cat, idx) => (
                <option key={idx} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="campo">
            <label>Precio unitario:</label>
            <input type="number" value={p.precio_unitario} onChange={e => actualizarProducto(index, 'precio_unitario', e.target.value)} min={1} required />
          </div>

          <div className="campo">
            <label>Cantidad:</label>
            <input type="number" value={p.cantidad} onChange={e => actualizarProducto(index, 'cantidad', e.target.value)} min={1} />
          </div>

          <div className="campo">
            <label>Cantidad comprada:</label>
            <input type="number" value={p.cantidad_comprada} onChange={e => actualizarProducto(index, 'cantidad_comprada', e.target.value)} min={0} />
          </div>

          <div className="campo">
            <label>Costo unitario:</label>
            <input type="number" value={p.costo_unitario} onChange={e => actualizarProducto(index, 'costo_unitario', e.target.value)} min={0} step="0.01" />
          </div>
        </div>
      ))}

      <button type="button" onClick={agregarProducto}>Agregar producto</button>

      <label>Estado de la venta:
        <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
          <option value="en progreso">En progreso</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </label>

      {form.estado === 'completada' && (
        <label>Fecha de pago completo:
          <input type="date" value={form.fecha_pago_completo} onChange={e => setForm({ ...form, fecha_pago_completo: e.target.value })} />
        </label>
      )}

      <label>Anticipo pagado:
        <input type="number" value={form.monto_pagado} onChange={e => setForm({ ...form, monto_pagado: e.target.value })} min={0} />
      </label>

      <div className="checkbox-horizontal">
        <input
          type="checkbox"
          checked={form.facturacion}
          onChange={e => setForm({ ...form, facturacion: e.target.checked })}
        />
        <span>¿Requiere facturación? (8% IVA)</span>
      </div>
      
      <br /><br />
      <button type="submit">Registrar venta</button>
    </form>
  );
}

export default RegistroVenta;
