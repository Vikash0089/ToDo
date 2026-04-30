import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import TodoList from './components/TodoList';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/todos" element={
            <PrivateRoute>
              <TodoList />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/todos" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;