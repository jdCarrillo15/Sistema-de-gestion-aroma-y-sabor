import React  from "react";
import LoginForm from "../../components/login/LoginForm.tsx";
import "../../styles/login/LoginPage.css";

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
