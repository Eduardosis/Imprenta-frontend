import { Routes, Route } from 'react-router-dom';
import RegistroVenta from './pages/RegistroVenta';
import ListaVentas from './pages/Ventas';
import RegistroCampos from './pages/RegistroCampos'
import Navbar from './routes/Navbar';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<RegistroVenta />} />
        <Route path="/ventas" element={<ListaVentas />} />
        <Route path="/RegistroC" element={<RegistroCampos />} />
      </Routes>
    </>
  );
}

export default App;
