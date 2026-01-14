import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type EmbeddedWalletNotice = {
  id: string;
  node: ReactNode;
};

type EmbeddedWalletNoticesState = Record<string, ReactNode>;

type EmbeddedWalletNoticesContextValue = {
  notices: EmbeddedWalletNotice[];
  setNotice: (id: string, node: ReactNode) => void;
  removeNotice: (id: string) => void;
};

const EmbeddedWalletNoticesContext = createContext<EmbeddedWalletNoticesContextValue | undefined>(
  undefined,
);

type EmbeddedWalletNoticesProviderProps = {
  children: ReactNode;
};

export const EmbeddedWalletNoticesProvider = ({ children }: EmbeddedWalletNoticesProviderProps) => {
  const [noticesById, setNoticesById] = useState<EmbeddedWalletNoticesState>({});

  const setNotice = useCallback((id: string, node: ReactNode) => {
    setNoticesById((prev) => ({
      ...prev,
      [id]: node,
    }));
  }, []);

  const removeNotice = useCallback((id: string) => {
    setNoticesById((prev) => {
      if (!(id in prev)) {
        return prev;
      }

      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const notices = useMemo(
    () =>
      Object.entries(noticesById).map(([id, node]) => ({
        id,
        node,
      })),
    [noticesById],
  );

  const value = useMemo(
    () => ({
      notices,
      setNotice,
      removeNotice,
    }),
    [notices, removeNotice, setNotice],
  );

  return (
    <EmbeddedWalletNoticesContext.Provider value={value}>
      {children}
    </EmbeddedWalletNoticesContext.Provider>
  );
};

export const useEmbeddedWalletNotices = () => {
  const context = useContext(EmbeddedWalletNoticesContext);
  if (!context) {
    throw new Error("useEmbeddedWalletNotices must be used within EmbeddedWalletNoticesProvider");
  }

  return context;
};

export const useEmbeddedWalletNotice = (id: string, node: ReactNode | null) => {
  const { setNotice, removeNotice } = useEmbeddedWalletNotices();

  useEffect(() => {
    if (!node) {
      removeNotice(id);
      return;
    }

    setNotice(id, node);
    return () => {
      removeNotice(id);
    };
  }, [id, node, removeNotice, setNotice]);
};
