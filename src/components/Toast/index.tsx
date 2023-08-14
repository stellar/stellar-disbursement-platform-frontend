import { useEffect } from "react";
import "./styles.scss";

interface ToastProps {
  children: React.ReactNode;
  isVisible: boolean;
  setIsVisible: (state: boolean) => void;
  delay?: number;
}

export const Toast: React.FC<ToastProps> = ({
  children,
  isVisible,
  setIsVisible,
  delay = 3000,
}: ToastProps) => {
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    if (isVisible) {
      t = setTimeout(() => {
        setIsVisible(false);
        clearTimeout(t);
      }, delay);
    }

    return () => {
      clearTimeout(t);
    };
  }, [delay, isVisible, setIsVisible]);

  return (
    <div className="Toast" style={{ opacity: isVisible ? 1 : 0 }}>
      {children}
    </div>
  );
};
