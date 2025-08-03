import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-link">Registrar venta</NavLink>
      <NavLink to="/ventas" className="nav-link">Ver ventas</NavLink>
      <NavLink to="/RegistroC" className="nav-link">Agregar campos</NavLink>
    </nav>
  );
}

export default Navbar;
