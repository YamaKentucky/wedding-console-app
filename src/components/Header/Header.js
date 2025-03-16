import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isSettings = location.pathname === '/settings';

  return (
    <header className="App-header">
      <div className="header-content">
        <h1>謎解きチャレンジ抽選会</h1>
        <nav className="main-navigation">
          <ul>
            <li className={isHome ? 'active' : ''}>
              <Link to="/">抽選画面</Link>
            </li>
            <li className={isSettings ? 'active' : ''}>
              <Link to="/settings">設定・履歴</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;