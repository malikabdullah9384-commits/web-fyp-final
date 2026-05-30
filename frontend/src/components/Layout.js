import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

function Layout({ role }) {
  return (
    <div className="layout">
      <Sidebar role={role} />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
