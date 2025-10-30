import React from "react";
import { Loader2 } from "lucide-react";
import styles from "../../styles/common/LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message = "Cargando...",
}) => {
  return (
    <div className={styles.loadingContainer}>
      <Loader2 size={size} className={styles.spinner} />
      {message && <p className={styles.loadingMessage}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
