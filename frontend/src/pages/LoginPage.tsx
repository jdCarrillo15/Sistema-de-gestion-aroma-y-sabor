import React, { useState } from "react";
import LoginForm from "../components/LoginForm.tsx";
import "../styles/LoginPage.css";

const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
