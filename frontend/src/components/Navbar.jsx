import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-brand">Habit Circle</span>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/circles">Circles</Link>
      </div>
      <div className="navbar-right">
        <span>Hi, {user?.name}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;