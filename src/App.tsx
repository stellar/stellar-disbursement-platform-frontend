console.log("[DisbursementStudio] src/App.tsx execution started");

import React, { useState, useEffect } from "react";

import Papa from "papaparse";

// TypeScript definitions matching SAPCONE DisburseFlow schema
interface Recipient {
  phone: string; // receivers.phone (external ID) - Contact channel for SMS
  id: string; // id - SAPCONE's own identifier for participant
  amount: string; // payments.amount - Value to be paid
  verification: string; // verification - Date of birth (DOB) checked during SEP-24
  paymentID: string; // paymentID - SAPCONE-side reference for reconciliation
  status: "Pending" | "Verified" | "Rejected";
  errors: {
    phone?: string;
    id?: string;
    amount?: string;
    verification?: string;
    paymentID?: string;
  };
}

interface DisbursementHistoryItem {
  id: string;
  timestamp: string;
  fileName: string;
  totalReceivers: number;
  totalAmount: string;
  asset: "USDC" | "XLM";
  txHash: string;
  status: "Completed";
}

// Pre-defined SAPCONE sample batch from Section 7.1 of PDF
const SAPCONE_SAMPLE_BATCH: Recipient[] = [
  {
    phone: "16042424000",
    id: "4ba1",
    amount: "520",
    verification: "01/12/1987",
    paymentID: "PAY_01",
    status: "Pending",
    errors: {},
  },
  {
    phone: "16034568000",
    id: "3ce2",
    amount: "600",
    verification: "04/06/1967",
    paymentID: "PAY_02",
    status: "Pending",
    errors: {},
  },
  {
    phone: "16045638000",
    id: "4dq1",
    amount: "800",
    verification: "09/08/1997",
    paymentID: "PAY_03",
    status: "Pending",
    errors: {},
  },
  {
    phone: "16022348000",
    id: "7re8",
    amount: "700",
    verification: "09/08/1990",
    paymentID: "PAY_04",
    status: "Pending",
    errors: {},
  },
];

const MOCK_HISTORY: DisbursementHistoryItem[] = [
  {
    id: "DISB-SAPCONE-001",
    timestamp: "2026-07-13 11:24:05",
    fileName: "marsabit_emergency_payouts.csv",
    totalReceivers: 4,
    totalAmount: "2620.00",
    asset: "XLM",
    txHash: "4b9e4a3b8d6f...a8c2d9e0f1a2",
    status: "Completed",
  },
];

const DIST_PUBLIC_KEY = "GCKNDFSWRE63L7YMXUPXVD3LNZN2Y2J2ZJQ4ZMXH6KNL5XW4P6X5X5J3";

// Try-catch safe localStorage helpers placed outside components to avoid ReferenceError hoisting issues
const getSafeLocalStorageBalance = (): number => {
  try {
    const saved = localStorage.getItem("studio_distribution_balance");
    return saved ? parseFloat(saved) : 150000.0;
  } catch {
    return 150000.0;
  }
};

const getSafeLocalStorageHistory = (): DisbursementHistoryItem[] => {
  try {
    const saved = localStorage.getItem("studio_disbursement_history");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore parse failure
  }
  return MOCK_HISTORY;
};

// Error Boundary to prevent blank screens in browser
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 bg-slate-900 text-slate-100 font-sans min-h-screen flex flex-col justify-center items-center">
          <div className="max-w-2xl w-full p-8 bg-red-950/20 border border-red-500/30 rounded-2xl">
            <h2 className="text-red-500 text-xl font-bold mt-0 mb-2">
              Something went wrong in the UI
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              The application crashed at runtime. Details below:
            </p>
            <pre className="bg-slate-950 p-4 rounded-xl text-red-400 overflow-x-auto text-xs font-mono mb-4">
              {this.state.error?.stack || this.state.error?.message}
            </pre>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white border-none rounded-lg cursor-pointer font-semibold transition-all"
            >
              Clear Storage & Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent = () => {
  console.log("[DisbursementStudio] AppContent rendering...");
  useEffect(() => {
    console.log("[DisbursementStudio] AppContent component mounted successfully!");
  }, []);

  // State Management
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [assetType, setAssetType] = useState<"USDC" | "XLM">("USDC");

  const [distBalance, setDistBalance] = useState<number>(getSafeLocalStorageBalance);
  const [xlmBalance, setXlmBalance] = useState<number>(2620.0); // Section 7.3.1 (2,620 XLM starting)

  const [disbursementProgress, setDisbursementProgress] = useState<number>(0);
  const [progressLogs, setProgressLogs] = useState<string[]>([]);
  const [txHash, setTxHash] = useState("");
  const [disbursementHistory, setDisbursementHistory] = useState<DisbursementHistoryItem[]>(
    getSafeLocalStorageHistory,
  );

  // Persist storage updates safely
  useEffect(() => {
    try {
      localStorage.setItem("studio_distribution_balance", distBalance.toString());
    } catch (e) {
      console.error(e);
    }
  }, [distBalance]);

  useEffect(() => {
    try {
      localStorage.setItem("studio_disbursement_history", JSON.stringify(disbursementHistory));
    } catch (e) {
      console.error(e);
    }
  }, [disbursementHistory]);

  // Validation function matching Section 7.2 of PDF mapping
  const validateRecipientRow = (
    row: Partial<Recipient>,
    allRows: Partial<Recipient>[],
  ): Recipient["errors"] => {
    const errors: Recipient["errors"] = {};

    // Validate Phone (receivers.phone)
    if (!row.phone || row.phone.trim() === "") {
      errors.phone = "Phone number is required";
    } else {
      const phoneClean = row.phone.replace(/[\s\-()]/g, "");
      const phoneRegex = /^\+?[1-9]\d{6,14}$/;
      if (!phoneRegex.test(phoneClean)) {
        errors.phone = "Invalid format. E.g. +254701234567 or 16042424000";
      }
    }

    // Validate ID (external reference)
    if (!row.id || row.id.trim() === "") {
      errors.id = "External reference ID is required";
    } else {
      const duplicate = allRows.filter((r) => r.id === row.id).length > 1;
      if (duplicate) {
        errors.id = "Duplicate reference ID found";
      }
    }

    // Validate Amount (payments.amount)
    if (!row.amount || row.amount.trim() === "") {
      errors.amount = "Amount is required";
    } else {
      const amt = parseFloat(row.amount);
      if (isNaN(amt) || amt <= 0) {
        errors.amount = "Must be a positive number";
      }
    }

    // Validate Verification (DOB)
    if (!row.verification || row.verification.trim() === "") {
      errors.verification = "Verification DOB (DD/MM/YYYY) is required";
    } else {
      const dobRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dobRegex.test(row.verification.trim())) {
        errors.verification = "Format must be DD/MM/YYYY (e.g. 01/12/1987)";
      }
    }

    // Validate Payment ID
    if (!row.paymentID || row.paymentID.trim() === "") {
      errors.paymentID = "Internal paymentID reference is required";
    } else {
      const duplicate = allRows.filter((r) => r.paymentID === row.paymentID).length > 1;
      if (duplicate) {
        errors.paymentID = "Duplicate paymentID found";
      }
    }

    return errors;
  };

  // Pre-load SAPCONE Sample Payout Batch
  const handleLoadSampleBatch = () => {
    const validated = SAPCONE_SAMPLE_BATCH.map((rec) => {
      const errors = validateRecipientRow(rec, SAPCONE_SAMPLE_BATCH);
      return { ...rec, errors };
    });
    setRecipients(validated);
    setUploadedFileName("sapcone_simulation_sample.csv");
  };

  // CSV Parsing handler supporting the added paymentID column
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawRows = results.data as any[];

        const parsed: Recipient[] = rawRows.map((row) => {
          const phone = (row.phone || row.phone_number || "").toString().trim();
          const id = (row.id || row.external_id || "").toString().trim();
          const amount = (row.amount || row.value || "").toString().trim();
          const verification = (row.verification || row.dob || row.date_of_birth || "")
            .toString()
            .trim();
          const paymentID = (row.paymentID || row.payment_id || "").toString().trim();

          return {
            phone,
            id,
            amount,
            verification,
            paymentID,
            status: "Pending",
            errors: {},
          };
        });

        const validated = parsed.map((rec) => {
          const errors = validateRecipientRow(rec, parsed);
          return { ...rec, errors };
        });

        setRecipients(validated);
        setIsUploading(false);
      },
      error: () => {
        alert("Failed to parse CSV file.");
        setIsUploading(false);
      },
    });
  };

  // Cell change updates and revalidates live
  const handleCellChange = (
    index: number,
    field: keyof Omit<Recipient, "errors" | "status">,
    value: string,
  ) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };

    const revalidated = updated.map((rec) => {
      const errors = validateRecipientRow(rec, updated);
      return { ...rec, errors };
    });

    setRecipients(revalidated);
  };

  // Row operations
  const handleAddRow = () => {
    const newRow: Recipient = {
      phone: "+",
      id: `EXT-${Date.now().toString().slice(-4)}`,
      amount: "100",
      verification: "01/01/1990",
      paymentID: `PAY_${Date.now().toString().slice(-4)}`,
      status: "Pending",
      errors: {
        phone: "Phone number required",
        verification: "Verification DOB required",
      },
    };
    setRecipients([...recipients, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    const updated = recipients.filter((_, idx) => idx !== index);
    const revalidated = updated.map((rec) => {
      const errors = validateRecipientRow(rec, updated);
      return { ...rec, errors };
    });
    setRecipients(revalidated);
  };

  const downloadTemplate = () => {
    const csvContent =
      "phone,id,amount,verification,paymentID\n16042424000,4ba1,520,01/12/1987,PAY_01\n16034568000,3ce2,600,04/06/1967,PAY_02\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sapcone_disburseflow_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasErrors = recipients.some((r) => Object.keys(r.errors).length > 0);
  const totalPayout = recipients.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  // Approval/Verification
  const toggleVerify = (index: number) => {
    const updated = [...recipients];
    const current = updated[index].status;
    updated[index].status =
      current === "Verified" ? "Rejected" : current === "Rejected" ? "Pending" : "Verified";
    setRecipients(updated);
  };

  const handleVerifyAll = () => {
    setRecipients(recipients.map((r) => ({ ...r, status: "Verified" })));
  };

  const verifiedRecipients = recipients.filter((r) => r.status === "Verified");
  const approvedPayoutAmount = verifiedRecipients.reduce(
    (sum, r) => sum + (parseFloat(r.amount) || 0),
    0,
  );

  // Execute Payout Simulation tracking exact Section 7.3 PDF Steps
  const executeDisbursement = () => {
    if (verifiedRecipients.length === 0) {
      alert("Please approve at least one beneficiary.");
      return;
    }

    setDisbursementProgress(1);
    setProgressLogs([]);

    // Add logs step-by-step
    const addLog = (msg: string, delay: number) => {
      setTimeout(() => {
        setProgressLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
      }, delay);
    };

    // Step 1: Upload & validation checks
    addLog(
      `[sdp-api] INFO: Upload & Validation: Commencing check on ${verifiedRecipients.length} approved beneficiaries.`,
      200,
    );
    addLog(
      `[sdp-api] SUCCESS: All validated accounts checked. Active distribution balance confirmed: $${distBalance} USDC / ${xlmBalance} XLM.`,
      800,
    );

    // Step 2: SMS invitation (dry-run)
    setTimeout(() => setDisbursementProgress(2), 1500);
    addLog(
      `[sdp-api] INFO: SMS invitation dry-run active. Messaging service logging invitations to console...`,
      1700,
    );
    verifiedRecipients.forEach((rec, idx) => {
      addLog(
        `[sdp-api] LOG: SMS sent to +${rec.phone} -> "You have been sent ${rec.amount} ${assetType}. Access Demo Wallet to claim: http://testanchor.stellar.org/sep24/deposit?ref=${rec.paymentID}"`,
        2000 + idx * 300,
      );
    });

    // Step 3: SEP-24 registration (dry-run)
    setTimeout(() => setDisbursementProgress(3), 3500);
    addLog(`[sdp-api] INFO: Beneficiary authentication handshake initiated via SEP-10...`, 3800);
    verifiedRecipients.forEach((rec, idx) => {
      const mockOtp = Math.floor(100000 + Math.random() * 900000);
      addLog(
        `[sdp-api] LOG: Generated OTP ${mockOtp} for phone +${rec.phone}. KYC verification DOB matched: ${rec.verification}.`,
        4100 + idx * 400,
      );
    });

    // Step 4: Verification & settlement via TSS
    setTimeout(() => setDisbursementProgress(4), 5500);
    addLog(
      `[TSS] INFO: TSS database queue polling triggered. Processing payment records for batch.`,
      5800,
    );
    verifiedRecipients.forEach((rec, idx) => {
      addLog(
        `[TSS] INFO: Preparing payment transaction for reference ${rec.paymentID} (${rec.amount} ${assetType})`,
        6100 + idx * 300,
      );
    });

    // Step 5: Confirmed settlement on-chain
    setTimeout(() => setDisbursementProgress(5), 7500);
    addLog(`[Horizon] INFO: Submitting signed transaction envelope to Horizon network...`, 7800);

    setTimeout(() => {
      const finalHash = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join("");
      addLog(`[Horizon] SUCCESS: Ledger closed successfully! Transaction Hash: ${finalHash}`, 8600);
      addLog(`[sdp-api] SUCCESS: All payments transitioned from 'Ready' to 'Success'.`, 9000);

      setTimeout(() => {
        // Complete execution state updates
        if (assetType === "USDC") {
          setDistBalance((prev) => Math.max(prev - approvedPayoutAmount, 0));
        } else {
          setXlmBalance((prev) => Math.max(prev - approvedPayoutAmount, 0));
        }

        const newHistItem: DisbursementHistoryItem = {
          id: `DISB-${new Date().toISOString().slice(0, 10)}-${Math.floor(10 + Math.random() * 90)}`,
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          fileName: uploadedFileName || "Manual_Entry",
          totalReceivers: verifiedRecipients.length,
          totalAmount: approvedPayoutAmount.toFixed(2),
          asset: assetType,
          txHash: finalHash.slice(0, 12) + "..." + finalHash.slice(-12),
          status: "Completed",
        };

        setTxHash(finalHash);
        setDisbursementHistory((prev) => [newHistItem, ...prev]);
        setDisbursementProgress(6);
      }, 9300);
    }, 8000);
  };

  const handleResetWizard = () => {
    setPhase(1);
    setRecipients([]);
    setUploadedFileName("");
    setDisbursementProgress(0);
    setProgressLogs([]);
    setTxHash("");
  };

  const handleClearLocalStorage = () => {
    try {
      localStorage.clear();
      setDistBalance(150000.0);
      setXlmBalance(2620.0);
      setDisbursementHistory(MOCK_HISTORY);
      alert("Local storage cleared successfully!");
      handleResetWizard();
    } catch {
      alert("Error clearing local storage.");
    }
  };

  const filteredRecipients = recipients.filter(
    (r) =>
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      r.paymentID.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-wider text-slate-900">SAPCONE</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center bg-slate-100 py-2.5 px-4 rounded-xl border border-slate-200">
          <div className="text-xs">
            <span className="text-slate-500 font-medium block">Distribution Account:</span>
            <div
              className="font-mono text-xs text-blue-600 cursor-pointer font-semibold hover:underline mt-0.5"
              onClick={() => {
                navigator.clipboard.writeText(DIST_PUBLIC_KEY);
                alert("Copied Stellar address!");
              }}
            >
              {DIST_PUBLIC_KEY.slice(0, 8)}...{DIST_PUBLIC_KEY.slice(-8)}
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-500 font-medium block">USDC Vault</span>
            <span className="font-bold text-emerald-600 block">
              ${distBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
            </span>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-500 font-medium block">XLM Vault</span>
            <span className="font-bold text-blue-600 block">
              {xlmBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} XLM
            </span>
          </div>
        </div>
      </header>

      {/* Main container */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 pb-16 w-full flex-1">
        {/* Wizard Steps */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0 relative mb-10 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="hidden sm:block absolute top-[44px] left-[12%] right-[12%] h-[2px] bg-slate-200 -z-0"></div>

          <div className="flex flex-col items-center z-10 w-full sm:w-1/4 relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${phase > 1 ? "bg-emerald-600 border-emerald-600 text-white" : "bg-blue-600 border-blue-600 text-white scale-105 shadow-md"}`}
            >
              {phase > 1 ? "✓" : "1"}
            </div>
            <div className="mt-3 text-xs font-bold text-slate-800 text-center">
              Phase 1: Populate CSV
              <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                Load & validate schema
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center z-10 w-full sm:w-1/4 relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${phase > 2 ? "bg-emerald-600 border-emerald-600 text-white" : phase === 2 ? "bg-blue-600 border-blue-600 text-white scale-105 shadow-md" : "bg-slate-100 border-slate-300 text-slate-500"}`}
            >
              {phase > 2 ? "✓" : "2"}
            </div>
            <div
              className={`mt-3 text-xs font-bold text-center ${phase >= 2 ? "text-slate-800" : "text-slate-400"}`}
            >
              Phase 2: Verify & Approve
              <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                KYC DOB validation checks
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center z-10 w-full sm:w-1/4 relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${phase === 3 ? "bg-blue-600 border-blue-600 text-white scale-105 shadow-md" : "bg-slate-100 border-slate-300 text-slate-500"}`}
            >
              3
            </div>
            <div
              className={`mt-3 text-xs font-bold text-center ${phase === 3 ? "text-slate-800" : "text-slate-400"}`}
            >
              Phase 3: Disbursement
              <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                Execute on Stellar TSS
              </span>
            </div>
          </div>
        </div>

        {/* Phase 1 Pane */}
        {phase === 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-200 pb-5 mb-6 gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Phase 1: Populating the CSV
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Upload a beneficiary file, load the SAPCONE simulation batch, or manually insert
                  records.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg border border-slate-200 transition-all text-xs"
                  onClick={handleLoadSampleBatch}
                >
                  Load SAPCONE Sample Batch
                </button>
                <button
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg border border-slate-200 transition-all text-xs"
                  onClick={downloadTemplate}
                >
                  Download Template
                </button>
                <button
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg border border-slate-200 transition-all text-xs"
                  onClick={handleAddRow}
                >
                  Add Row
                </button>
              </div>
            </div>

            {recipients.length === 0 ? (
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50 cursor-pointer hover:border-blue-500 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center gap-3"
                onClick={() => document.getElementById("csv-file-input")?.click()}
              >
                <input
                  type="file"
                  id="csv-file-input"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  style={{ display: "none" }}
                />
                <div className="text-2xl text-slate-400 font-bold border border-slate-300 rounded px-3 py-1 bg-white">
                  CSV
                </div>
                <div className="text-sm font-semibold text-slate-700">
                  {isUploading
                    ? "Uploading files..."
                    : "Click to select and upload a beneficiary CSV"}
                </div>
                <div className="text-xs text-slate-400">
                  Required Schema: phone, id, amount, verification, paymentID
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      Loaded Records
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      {recipients.length}
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      Total Draft Payout
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      ${totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
                      {assetType}
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      Asset Selection
                    </div>
                    <div className="mt-1">
                      <select
                        className="bg-white border border-slate-300 text-slate-900 py-1.5 px-3 rounded-md text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-full sm:w-auto"
                        value={assetType}
                        onChange={(e) => setAssetType(e.target.value as "USDC" | "XLM")}
                      >
                        <option value="USDC">USDC (Circle)</option>
                        <option value="XLM">XLM (Native)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm mt-6">
                  <table className="w-full border-collapse text-left text-sm text-slate-700">
                    <thead>
                      <tr>
                        <th className="bg-slate-50 text-slate-600 font-semibold py-3 px-4 border-b border-slate-200 text-xs uppercase tracking-wider">
                          paymentID
                        </th>
                        <th className="bg-slate-50 text-slate-600 font-semibold py-3 px-4 border-b border-slate-200 text-xs uppercase tracking-wider">
                          phone (receivers.phone)
                        </th>
                        <th className="bg-slate-50 text-slate-600 font-semibold py-3 px-4 border-b border-slate-200 text-xs uppercase tracking-wider">
                          id (SAPCONE ref)
                        </th>
                        <th className="bg-slate-50 text-slate-600 font-semibold py-3 px-4 border-b border-slate-200 text-xs uppercase tracking-wider">
                          amount ({assetType})
                        </th>
                        <th className="bg-slate-50 text-slate-600 font-semibold py-3 px-4 border-b border-slate-200 text-xs uppercase tracking-wider">
                          verification (DOB)
                        </th>
                        <th className="bg-slate-50 text-slate-600 font-semibold py-3 px-4 border-b border-slate-200 text-xs uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipients.map((rec, index) => (
                        <tr
                          key={index}
                          className={`hover:bg-slate-50/50 transition-colors duration-150 ${Object.keys(rec.errors).length > 0 ? "bg-red-50/50 hover:bg-red-50" : ""}`}
                        >
                          <td className="py-3.5 px-4 border-b border-slate-200 align-middle">
                            <input
                              type="text"
                              value={rec.paymentID}
                              className={`w-full bg-white border text-slate-900 py-1.5 px-3 rounded-md text-sm focus:outline-none focus:ring-2 ${rec.errors.paymentID ? "border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"}`}
                              onChange={(e) => handleCellChange(index, "paymentID", e.target.value)}
                            />
                            {rec.errors.paymentID && (
                              <span className="text-xs text-red-600 mt-1 block font-medium">
                                {rec.errors.paymentID}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 border-b border-slate-200 align-middle">
                            <input
                              type="text"
                              value={rec.phone}
                              className={`w-full bg-white border text-slate-900 py-1.5 px-3 rounded-md text-sm focus:outline-none focus:ring-2 ${rec.errors.phone ? "border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"}`}
                              onChange={(e) => handleCellChange(index, "phone", e.target.value)}
                            />
                            {rec.errors.phone && (
                              <span className="text-xs text-red-600 mt-1 block font-medium">
                                {rec.errors.phone}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 border-b border-slate-200 align-middle">
                            <input
                              type="text"
                              value={rec.id}
                              className={`w-full bg-white border text-slate-900 py-1.5 px-3 rounded-md text-sm focus:outline-none focus:ring-2 ${rec.errors.id ? "border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"}`}
                              onChange={(e) => handleCellChange(index, "id", e.target.value)}
                            />
                            {rec.errors.id && (
                              <span className="text-xs text-red-600 mt-1 block font-medium">
                                {rec.errors.id}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 border-b border-slate-200 align-middle">
                            <input
                              type="text"
                              value={rec.amount}
                              className={`w-full bg-white border text-slate-900 py-1.5 px-3 rounded-md text-sm focus:outline-none focus:ring-2 ${rec.errors.amount ? "border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"}`}
                              onChange={(e) => handleCellChange(index, "amount", e.target.value)}
                            />
                            {rec.errors.amount && (
                              <span className="text-xs text-red-600 mt-1 block font-medium">
                                {rec.errors.amount}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 border-b border-slate-200 align-middle">
                            <input
                              type="text"
                              value={rec.verification}
                              placeholder="DD/MM/YYYY"
                              className={`w-full bg-white border text-slate-900 py-1.5 px-3 rounded-md text-sm focus:outline-none focus:ring-2 ${rec.errors.verification ? "border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"}`}
                              onChange={(e) =>
                                handleCellChange(index, "verification", e.target.value)
                              }
                            />
                            {rec.errors.verification && (
                              <span className="text-xs text-red-600 mt-1 block font-medium">
                                {rec.errors.verification}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 border-b border-slate-200 align-middle">
                            <button
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-2.5 rounded-md text-xs transition-all"
                              onClick={() => handleDeleteRow(index)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg border border-slate-200 transition-all text-sm"
                    onClick={handleResetWizard}
                  >
                    Clear List
                  </button>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    disabled={hasErrors || recipients.length === 0}
                    onClick={() => setPhase(2)}
                  >
                    Proceed to Verification & Approval →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 2 Pane */}
        {phase === 2 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-200 pb-5 mb-6 gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Phase 2: Approval & Verification
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Approve beneficiaries in this batch. Verified beneficiaries will be processed for
                  Stellar TSS disbursement.
                </p>
              </div>
              <div>
                <button
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg border border-slate-200 transition-all text-xs"
                  onClick={handleVerifyAll}
                >
                  Verify & Approve All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  Total Verified
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {verifiedRecipients.length} / {recipients.length}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  Approved Outflow
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  ${approvedPayoutAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
                  {assetType}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  Pending Approval
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {recipients.length - verifiedRecipients.length} Records
                </div>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by paymentID, external ID, or Phone..."
                className="w-full sm:w-[350px] bg-white border border-slate-300 text-slate-900 py-1.5 px-3 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm mt-6">
              <table className="w-full border-collapse text-left text-sm text-slate-700">
                <thead>
                  <tr>
                    <th className="bg-slate-50 text-slate-600 font-semibold py-3 px-4 border-b border-slate-200 text-xs uppercase tracking-wider">
                      paymentID
                    </th>
                    <th className="bg-slate-50 text-slate-600 font-semibold py-3 px-4 border-b border-slate-200 text-xs uppercase tracking-wider">
                      phone (receivers.phone)
                    </th>
                    <th className="bg-slate-50 text-slate-600 font-semibold py-3 px-4 border-b border-slate-200 text-xs uppercase tracking-wider">
                      id (SAPCONE ref)
                    </th>
                    <th className="bg-slate-50 text-slate-600 font-semibold py-3 px-4 border-b border-slate-200 text-xs uppercase tracking-wider">
                      amount ({assetType})
                    </th>
                    <th className="bg-slate-50 text-slate-600 font-semibold py-3 px-4 border-b border-slate-200 text-xs uppercase tracking-wider">
                      verification (DOB)
                    </th>
                    <th className="bg-slate-50 text-slate-600 font-semibold py-3 px-4 border-b border-slate-200 text-xs uppercase tracking-wider">
                      KYC Status
                    </th>
                    <th className="bg-slate-50 text-slate-600 font-semibold py-3 px-4 border-b border-slate-200 text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipients.map((rec, index) => {
                    const originalIndex = recipients.findIndex(
                      (r) => r.paymentID === rec.paymentID,
                    );
                    return (
                      <tr
                        key={index}
                        className="hover:bg-slate-50/50 transition-colors duration-150"
                      >
                        <td className="py-3.5 px-4 border-b border-slate-200 align-middle font-medium">
                          {rec.paymentID}
                        </td>
                        <td className="py-3.5 px-4 border-b border-slate-200 align-middle">
                          {rec.phone}
                        </td>
                        <td className="py-3.5 px-4 border-b border-slate-200 align-middle">
                          {rec.id}
                        </td>
                        <td className="py-3.5 px-4 border-b border-slate-200 align-middle font-semibold">
                          {parseFloat(rec.amount).toFixed(2)} {assetType}
                        </td>
                        <td className="py-3.5 px-4 border-b border-slate-200 align-middle">
                          <code className="bg-slate-100 py-0.5 px-1.5 rounded-sm text-xs font-mono">
                            {rec.verification}
                          </code>
                        </td>
                        <td className="py-3.5 px-4 border-b border-slate-200 align-middle">
                          <span
                            className={`inline-flex items-center text-xs font-semibold py-1 px-2.5 rounded-full border ${rec.status === "Verified" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : rec.status === "Rejected" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 border-b border-slate-200 align-middle">
                          <button
                            className={`w-[130px] font-semibold py-1.5 px-2.5 rounded-md text-xs transition-all ${rec.status === "Verified" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                            onClick={() => toggleVerify(originalIndex)}
                          >
                            {rec.status === "Verified" ? "Revoke / Reject" : "Verify & Approve"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg border border-slate-200 transition-all text-sm"
                onClick={() => setPhase(1)}
              >
                Back to CSV Editor
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                disabled={verifiedRecipients.length === 0}
                onClick={() => setPhase(3)}
              >
                Proceed to Payout Stage →
              </button>
            </div>
          </div>
        )}

        {/* Phase 3 Pane */}
        {phase === 3 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
            <div className="border-b border-slate-200 pb-5 mb-6">
              <h2 className="text-xl font-extrabold text-slate-900">
                Phase 3: Disbursement Execution Panel
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Run simulated live deployment and trace transactions on Stellar Testnet.
              </p>
            </div>

            {disbursementProgress === 0 ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                  <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-xl">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      Approved Beneficiaries count
                    </div>
                    <div className="text-2xl font-bold text-blue-700 mt-1">
                      {verifiedRecipients.length} Accounts
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-xl">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      Approved Disbursement Amount
                    </div>
                    <div className="text-2xl font-bold text-emerald-700 mt-1">
                      $
                      {approvedPayoutAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
                      {assetType}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg border border-slate-200 transition-all text-sm"
                    onClick={() => setPhase(2)}
                  >
                    Back to Approval
                  </button>
                  <button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-all text-sm"
                    onClick={executeDisbursement}
                  >
                    Run DisburseFlow Simulation
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-4 my-6">
                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${disbursementProgress === 1 ? "bg-blue-50 border-blue-200" : disbursementProgress > 1 ? "bg-emerald-50/30 border-emerald-100" : "bg-slate-50 border-slate-200"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${disbursementProgress > 1 ? "bg-emerald-600 text-white" : "bg-blue-600 text-white shadow-xs"}`}
                    >
                      {disbursementProgress > 1 ? "✓" : "1"}
                    </div>
                    <div>
                      <div
                        className={`font-bold text-sm ${disbursementProgress === 1 ? "text-blue-700" : "text-slate-800"}`}
                      >
                        Step 1: Upload and Validation
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        All beneficiary rows checked and validation holds active.
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${disbursementProgress === 2 ? "bg-blue-50 border-blue-200" : disbursementProgress > 2 ? "bg-emerald-50/30 border-emerald-100" : "bg-slate-50 border-slate-200"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${disbursementProgress > 2 ? "bg-emerald-600 text-white" : "bg-blue-600 text-white shadow-xs"}`}
                    >
                      {disbursementProgress > 2 ? "✓" : "2"}
                    </div>
                    <div>
                      <div
                        className={`font-bold text-sm ${disbursementProgress === 2 ? "text-blue-700" : "text-slate-800"}`}
                      >
                        Step 2: SMS Invitation (Dry-Run Logs)
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Generating secure deep links logged in SDP API container.
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${disbursementProgress === 3 ? "bg-blue-50 border-blue-200" : disbursementProgress > 3 ? "bg-emerald-50/30 border-emerald-100" : "bg-slate-50 border-slate-200"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${disbursementProgress > 3 ? "bg-emerald-600 text-white" : "bg-blue-600 text-white shadow-xs"}`}
                    >
                      {disbursementProgress > 3 ? "✓" : "3"}
                    </div>
                    <div>
                      <div
                        className={`font-bold text-sm ${disbursementProgress === 3 ? "text-blue-700" : "text-slate-800"}`}
                      >
                        Step 3: SEP-24 Wallet Verification
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Receiver authentication handshake via SEP-10 & OTP verification.
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${disbursementProgress === 4 ? "bg-blue-50 border-blue-200" : disbursementProgress > 4 ? "bg-emerald-50/30 border-emerald-100" : "bg-slate-50 border-slate-200"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${disbursementProgress > 4 ? "bg-emerald-600 text-white" : "bg-blue-600 text-white shadow-xs"}`}
                    >
                      {disbursementProgress > 4 ? "✓" : "4"}
                    </div>
                    <div>
                      <div
                        className={`font-bold text-sm ${disbursementProgress === 4 ? "text-blue-700" : "text-slate-800"}`}
                      >
                        Step 4: TSS queue processing & Horizon Broadcast
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Transaction Submission Service batching payouts and signing envelope.
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${disbursementProgress === 5 ? "bg-blue-50 border-blue-200" : disbursementProgress > 5 ? "bg-emerald-50/30 border-emerald-100" : "bg-slate-50 border-slate-200"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${disbursementProgress > 5 ? "bg-emerald-600 text-white" : "bg-blue-600 text-white shadow-xs"}`}
                    >
                      {disbursementProgress > 5 ? "✓" : "5"}
                    </div>
                    <div>
                      <div
                        className={`font-bold text-sm ${disbursementProgress === 5 ? "text-blue-700" : "text-slate-800"}`}
                      >
                        Step 5: Confirmed Outcome Settlement
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Final on-chain confirmation of transaction records.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Container Logs */}
                <div className="mt-8 p-5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 max-h-[250px] overflow-y-auto shadow-inner">
                  <div className="text-slate-400 border-b border-slate-800 pb-2 mb-3 font-bold flex items-center justify-between">
                    Container Service Log (sdp-api & tss)
                  </div>
                  <div className="space-y-1.5">
                    {progressLogs.map((log, i) => (
                      <div key={i} className="leading-relaxed">
                        {log}
                      </div>
                    ))}
                    {disbursementProgress > 0 && disbursementProgress < 6 && (
                      <div className="text-blue-400 animate-pulse">&gt; Polling queue...</div>
                    )}
                  </div>
                </div>

                {disbursementProgress === 6 && (
                  <div className="mt-8 p-6 bg-emerald-50/50 rounded-xl border border-emerald-200">
                    <h3 className="text-emerald-700 text-base font-bold mb-2">
                      SAPCONE Batch Settled
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Disbursement finalized. Verified receivers balance updated.
                    </p>

                    <div className="text-xs text-slate-700 space-y-1.5 font-sans">
                      <div>
                        <strong>Horizon Transaction Hash:</strong>{" "}
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-blue-600 hover:underline"
                        >
                          {txHash}
                        </a>
                      </div>
                      <div>
                        <strong>Funds Disbursed:</strong> {approvedPayoutAmount.toFixed(2)}{" "}
                        {assetType}
                      </div>
                      <div>
                        <strong>Receivers Paid:</strong> {verifiedRecipients.length}
                      </div>
                    </div>

                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-all text-sm mt-5"
                      onClick={handleResetWizard}
                    >
                      Initiate New Session
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* History Log */}
        {phase === 1 && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900">Simulation History Log</h3>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-3 rounded-md text-xs transition-all"
                onClick={handleClearLocalStorage}
              >
                Clear Saved Data
              </button>
            </div>
            <div className="space-y-3">
              {disbursementHistory.map((item) => (
                <div
                  className="flex justify-between items-center bg-white border border-slate-200 p-5 rounded-xl shadow-xs hover:shadow-md transition-all duration-200"
                  key={item.id}
                >
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{item.fileName}</div>
                    <div className="text-xs text-slate-500 mt-1 flex gap-3 items-center">
                      <span>ID: {item.id}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">
                        {item.totalReceivers} Payouts ({item.asset})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="font-extrabold text-sm text-emerald-600">
                      $
                      {parseFloat(item.totalAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}{" "}
                      {item.asset}
                    </div>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-blue-600 font-semibold hover:underline"
                    >
                      View Tx
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export const App = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};
