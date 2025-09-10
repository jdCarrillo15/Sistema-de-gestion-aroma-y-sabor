// Ejemplo para src/App.tsx (si usas React Router)
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import LoginPage from "./pages/LoginPage";

// function App() {
//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/" element={<LoginPage />} />
//           {/* Otras rutas aquí */}
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

// O si prefieres usar el componente directamente sin rutas:
import React from "react";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <div className="App">
      <LoginPage />
    </div>
  );
}

export default App;
