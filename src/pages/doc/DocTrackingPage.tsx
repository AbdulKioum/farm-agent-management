import React, { useEffect, useState, useRef } from "react";
import XLSX from "xlsx-js-style";
import { supabase } from "../../lib/supabase";
import {
  FaFileUpload,
  FaFileExcel,
  FaChartPie,
  FaPlus,
  FaTrash,
  FaTimes,
  FaSpinner,

} from "react-icons/fa";

const FEED_COMPANIES = [
  "Nourish",
  "CP",
  "Kazi",
  "Alal 71",
  "Paragon",
  "Amana",
  "Astha",
];

interface DocAgent {
  id: string;
  doc_id: string;
  agent_name: string;
  proprietor: string;
  mobile: string;
  district: string;
  upazila: string;
}

interface DocSupply {
  id: string;
  h_date: string;
  doc_id: string;
  agent_name: string;
  pcd: string;
  ag_b: string;
  qty: number;
  b_qty: number;
  rmk: string;
}

interface DocTracking {
  id: string;
  supply_id?: string | null;
  doc_id: string;
  h_date: string;
  pcd: string;
  farmer_name: string;
  address: string;
  mobile: string;
  qty: number;
  feed_company: string;
  remark: string;
}

export default function DocTrackingPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // User Role & Assigned Upazilas
  const [userRole, setUserRole] = useState("officer");
  const [assignedUpazilas, setAssignedUpazilas] = useState<string[]>([]);

  // Data States
  const [agents, setAgents] = useState<DocAgent[]>([]);
  const [supplies, setSupplies] = useState<DocSupply[]>([]);
  const [trackings, setTrackings] = useState<DocTracking[]>([]);

  // Top Filters
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(""); // blank = all dates or auto-set to latest H.Date
  const [pcdFilter, setPcdFilter] = useState<string>("");
  const [searchAgent, setSearchAgent] = useState<string>("");

  // Add Tracking Modal State
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [activeTarget, setActiveTarget] = useState<{
    doc_id: string;
    agent_name: string;
    pcd: string;
    h_date: string;
    supply_id?: string;
    remainingQty: number;
  } | null>(null);

  const [trackForm, setTrackForm] = useState({
    farmer_name: "",
    address: "",
    mobile: "",
    qty: "",
    feed_company: "Nourish",
    remark: "",
  });

  // Tracked Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportFromDate, setReportFromDate] = useState("");
  const [reportToDate, setReportToDate] = useState("");
  const [reportPcdFilter, setReportPcdFilter] = useState("");

  useEffect(() => {
    initTrackingPage();
  }, []);

  function parseArray(field: any): string[] {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return field
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    return [];
  }

  async function initTrackingPage() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let role = "officer";
      let uUpazilas: string[] = [];

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role, upazilas")
          .eq("id", user.id)
          .single();

        if (profile) {
          role = profile.role || "officer";
          uUpazilas = parseArray(profile.upazilas);
        }
      }

      setUserRole(role);
      setAssignedUpazilas(uUpazilas);

      await loadAllData(role, uUpazilas);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to initialize page.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAllData(role = userRole, uUpazilas = assignedUpazilas) {
    // 1. Load DOC Agents for user's assigned upazilas
    let agentQuery = supabase.from("doc_agents").select("*").order("doc_id");
    if (role !== "super_admin") {
      if (uUpazilas.length > 0) {
        agentQuery = agentQuery.in("upazila", uUpazilas);
      } else {
        setAgents([]);
        setSupplies([]);
        setTrackings([]);
        return;
      }
    }

    const { data: agentData, error: agentErr } = await agentQuery;
    if (agentErr) throw agentErr;

    const loadedAgents: DocAgent[] = agentData || [];
    setAgents(loadedAgents);

    const allowedDocIds = loadedAgents.map((a) => a.doc_id);
    if (allowedDocIds.length === 0) {
      setSupplies([]);
      setTrackings([]);
      return;
    }

    // 2. Load Supplies & Trackings matching those DOC.IDs
    const [{ data: supData, error: supErr }, { data: trkData, error: trkErr }] =
      await Promise.all([
        supabase
          .from("doc_supplies")
          .select("*")
          .in("doc_id", allowedDocIds)
          .order("h_date", { ascending: false }),
        supabase
          .from("doc_trackings")
          .select("*")
          .in("doc_id", allowedDocIds)
          .order("created_at", { ascending: true }),
      ]);

    if (supErr) throw supErr;
    if (trkErr) throw trkErr;

    const loadedSupplies = supData || [];
    setSupplies(loadedSupplies);
    setTrackings(trkData || []);

    // Set default date filters if not set yet
    if (loadedSupplies.length > 0 && !selectedDate) {
      const latestDate = loadedSupplies[0].h_date;
      setSelectedDate(latestDate);
      setReportFromDate(latestDate);
      setReportToDate(latestDate);
    } else if (!reportFromDate) {
      setReportFromDate(todayStr);
      setReportToDate(todayStr);
    }
  }

  // ==================================================
  // EXCEL HELPERS: HTML STRIP & DATE FORMATTER
  // ==================================================

  function extractCleanDocId(rawVal: any): string {
    if (rawVal === null || rawVal === undefined) return "";
    const str = String(rawVal);
    // Strip any HTML tags like <div class="green-background no-parent-padding">1059</div>
    const withoutTags = str.replace(/<[^>]*>/g, "").trim();
    return withoutTags;
  }

  function parseExcelDate(rawDate: any): string {
    if (!rawDate) return todayStr;

    // Excel serial number (e.g. 46023)
    if (typeof rawDate === "number") {
      const utcDays = Math.floor(rawDate - 25569);
      const dateObj = new Date(utcDays * 86400 * 1000);
      return dateObj.toISOString().split("T")[0];
    }

    const str = String(rawDate).replace(/<[^>]*>/g, "").trim();

    // Check DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, "0");
      const month = dmyMatch[2].padStart(2, "0");
      let year = dmyMatch[3];
      if (year.length === 2) year = "20" + year;
      return `${year}-${month}-${day}`;
    }

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }

    return todayStr;
  }

  // ==================================================
  // IMPORT EXCEL (Only Super Admin & Manager)
  // ==================================================

  const canImportExcel = userRole === "super_admin" || userRole === "manager";

  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (rows.length === 0) {
        throw new Error("The selected Excel file is empty.");
      }

      // Map rows & ignore Region, Disctrict, TP
      const groupedMap = new Map<
        string,
        {
          h_date: string;
          doc_id: string;
          agent_name: string;
          pcd: string;
          ag_b: string;
          qty: number;
          b_qty: number;
          rmk: string;
        }
      >();

      for (const row of rows) {
        // Normalize column keys (handle spaces/dots)
        const getVal = (possibleKeys: string[]) => {
          for (const k of Object.keys(row)) {
            const cleanKey = k.trim().toLowerCase();
            if (possibleKeys.includes(cleanKey)) return row[k];
          }
          return "";
        };

        const rawDocId = getVal(["doc.id", "doc id", "doc_id", "docid"]);
        const cleanDocId = extractCleanDocId(rawDocId);
        if (!cleanDocId) continue;

        const rawHDate = getVal(["h.date", "h date", "h_date", "date"]);
        const cleanDate = parseExcelDate(rawHDate);

        const rawAgent = String(getVal(["agent", "agent name"]) || "")
          .replace(/<[^>]*>/g, "")
          .trim();

        const rawPcd = String(getVal(["pcd", "doc type"]) || "")
          .replace(/<[^>]*>/g, "")
          .trim();
        if (!rawPcd) continue;

        const rawAgB = String(getVal(["ag/b+", "ag/b", "ag_b"]) || "")
          .replace(/<[^>]*>/g, "")
          .trim();

        const qtyVal =
          Number(
            String(getVal(["qty", "quantity"]) || "0").replace(/[^0-9.-]/g, "")
          ) || 0;

        const bQtyVal =
          Number(
            String(getVal(["b.qty", "b qty", "b_qty"]) || "0").replace(
              /[^0-9.-]/g,
              ""
            )
          ) || 0;

        const rawRmk = String(getVal(["rmk", "remark", "remarks"]) || "")
          .replace(/<[^>]*>/g, "")
          .trim();

        const uniqueKey = `${cleanDate}_${cleanDocId}_${rawPcd}_${rawAgB}`;

        if (groupedMap.has(uniqueKey)) {
          const existing = groupedMap.get(uniqueKey)!;
          existing.qty += qtyVal;
          existing.b_qty += bQtyVal;
        } else {
          groupedMap.set(uniqueKey, {
            h_date: cleanDate,
            doc_id: cleanDocId,
            agent_name: rawAgent,
            pcd: rawPcd,
            ag_b: rawAgB,
            qty: qtyVal,
            b_qty: bQtyVal,
            rmk: rawRmk,
          });
        }
      }

      const payload = Array.from(groupedMap.values());
      if (payload.length === 0) {
        throw new Error(
          "No valid DOC rows found. Check columns: H.Date, DOC.ID, PCD, Qty."
        );
      }

      // Upsert into doc_supplies
      const { error } = await supabase.from("doc_supplies").upsert(payload, {
        onConflict: "h_date,doc_id,pcd,ag_b",
      });

      if (error) {
        // Fallback if unique index differs: delete matching h_date+doc_id and insert
        const dates = Array.from(new Set(payload.map((p) => p.h_date)));
        const docIds = Array.from(new Set(payload.map((p) => p.doc_id)));
        await supabase
          .from("doc_supplies")
          .delete()
          .in("h_date", dates)
          .in("doc_id", docIds);

        const { error: insErr } = await supabase
          .from("doc_supplies")
          .insert(payload);
        if (insErr) throw insErr;
      }

      setSuccessMsg(`Successfully imported ${payload.length} DOC supply rows!`);
      if (payload[0]?.h_date) {
        setSelectedDate(payload[0].h_date);
      }
      await loadAllData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to import Excel file.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ==================================================
  // ADD & DELETE FARMER TRACKING
  // ==================================================

  function openAddTrackingModal(params: {
    doc_id: string;
    agent_name: string;
    pcd: string;
    h_date: string;
    supply_id?: string;
    remainingQty: number;
  }) {
    setActiveTarget(params);
    setTrackForm({
      farmer_name: "",
      address: "",
      mobile: "",
      qty: params.remainingQty > 0 ? String(params.remainingQty) : "",
      feed_company: "Nourish",
      remark: "",
    });
    setIsTrackModalOpen(true);
  }

  async function handleSaveTracking(e: React.FormEvent) {
    e.preventDefault();
    if (!activeTarget) return;

    const numQty = Number(trackForm.qty);
    if (!trackForm.farmer_name.trim() || numQty <= 0) {
      setErrorMsg("Farmer Name and valid DOC Qty are required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.from("doc_trackings").insert([
        {
          supply_id: activeTarget.supply_id || null,
          doc_id: activeTarget.doc_id,
          h_date: activeTarget.h_date,
          pcd: activeTarget.pcd,
          farmer_name: trackForm.farmer_name.trim(),
          address: trackForm.address.trim(),
          mobile: trackForm.mobile.trim(),
          qty: numQty,
          feed_company: trackForm.feed_company,
          remark: trackForm.remark.trim(),
        },
      ]);

      if (error) throw error;

      await loadAllData();
      setIsTrackModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save tracking.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteTracking(id: string) {
    if (!window.confirm("Remove this farmer tracking entry?")) return;
    try {
      const { error } = await supabase
        .from("doc_trackings")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await loadAllData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to delete tracking.");
    }
  }

  // ==================================================
  // FILTERED DATA & TOP SUMMARY CALCULATIONS
  // ==================================================

  const allPcdTypes = Array.from(new Set(supplies.map((s) => s.pcd))).sort();
  const allDates = Array.from(new Set(supplies.map((s) => s.h_date)))
    .sort()
    .reverse();

  const filteredSupplies = supplies.filter((s) => {
    const matchDate = !selectedDate || s.h_date === selectedDate;
    const matchPcd = !pcdFilter || s.pcd === pcdFilter;
    return matchDate && matchPcd;
  });

  const filteredTrackings = trackings.filter((t) => {
    const matchDate = !selectedDate || t.h_date === selectedDate;
    const matchPcd = !pcdFilter || t.pcd === pcdFilter;
    return matchDate && matchPcd;
  });

  const totalSupplyQty = filteredSupplies.reduce(
    (sum, s) => sum + (Number(s.qty) || 0),
    0
  );
  const totalTrackedQty = filteredTrackings.reduce(
    (sum, t) => sum + (Number(t.qty) || 0),
    0
  );
  const totalUntrackedQty = Math.max(0, totalSupplyQty - totalTrackedQty);

  const trackedPercent =
    totalSupplyQty > 0
      ? ((totalTrackedQty / totalSupplyQty) * 100).toFixed(1)
      : "0.0";
  const untrackedPercent =
    totalSupplyQty > 0
      ? ((totalUntrackedQty / totalSupplyQty) * 100).toFixed(1)
      : "0.0";

  // Filter agents that have supplies in current filter (or match search)
  const visibleAgents = agents.filter((agent) => {
    const q = searchAgent.trim().toLowerCase();
    const matchSearch =
      !q ||
      agent.doc_id.toLowerCase().includes(q) ||
      agent.agent_name.toLowerCase().includes(q) ||
      agent.upazila.toLowerCase().includes(q);

    if (!matchSearch) return false;

    const agentSupplies = filteredSupplies.filter(
      (s) => s.doc_id === agent.doc_id
    );
    return agentSupplies.length > 0;
  });

  // ==================================================
  // EXPORT EXCEL
  // ==================================================
  // Columns: H.Date, DOC.ID, Agent, Address, DOC qty, DOC Type, Farmer, Address, DOC Qty, Feed Company, Remark

function handleExportExcel() {
    const exportRows: Record<string, any>[] = [];

    let grandTotalSupply = 0;
    let grandTotalTracked = 0;

    visibleAgents.forEach((agent) => {
      const agentSupplies = filteredSupplies.filter(
        (s) => s.doc_id === agent.doc_id
      );

      // Group by H.Date + PCD
      const groups = new Map<
        string,
        { h_date: string; pcd: string; qty: number }
      >();
      agentSupplies.forEach((s) => {
        const key = `${s.h_date}_${s.pcd}`;
        const prev = groups.get(key);
        if (prev) {
          prev.qty += Number(s.qty) || 0;
        } else {
          groups.set(key, {
            h_date: s.h_date,
            pcd: s.pcd,
            qty: Number(s.qty) || 0,
          });
        }
      });

      groups.forEach((g) => {
        grandTotalSupply += g.qty;

        const matchingTracks = filteredTrackings.filter(
          (t) =>
            t.doc_id === agent.doc_id &&
            t.h_date === g.h_date &&
            t.pcd === g.pcd
        );

        if (matchingTracks.length === 0) {
          exportRows.push({
            "H.Date": g.h_date,
            "DOC.ID": agent.doc_id,
            Agent: agent.agent_name,
            "Agent Address": `${agent.upazila}, ${agent.district}`,
            "DOC Qty": g.qty,
            "DOC Type": g.pcd,
            Farmer: "-",
            "Farmer Address": "-",
            "Farmer Mobile": "-",
            "Tracked Qty": 0,
            "Feed Company": "-",
            Remark: "Untracked",
          });
        } else {
          matchingTracks.forEach((t, index) => {
            grandTotalTracked += Number(t.qty) || 0;

            exportRows.push({
              "H.Date": g.h_date,
              "DOC.ID": agent.doc_id,
              Agent: agent.agent_name,
              "Agent Address": `${agent.upazila}, ${agent.district}`,
              // Ek-i agent er ekadhik farmer thakle prothom row te supply qty dekhabe
              "DOC Qty": index === 0 ? g.qty : "",
              "DOC Type": g.pcd,
              Farmer: t.farmer_name,
              "Farmer Address": t.address || "-",
              "Farmer Mobile": t.mobile || "-",
              "Tracked Qty": Number(t.qty) || 0,
              "Feed Company": t.feed_company,
              Remark: t.remark || "-",
            });
          });
        }
      });
    });

    if (exportRows.length === 0) {
      alert("No tracking data available to export for current filter.");
      return;
    }

    // Add Grand Total Row at the bottom
    exportRows.push({
      "H.Date": "TOTAL",
      "DOC.ID": "",
      Agent: "",
      "Agent Address": "",
      "DOC Qty": grandTotalSupply,
      "DOC Type": "",
      Farmer: "",
      "Farmer Address": "",
      "Farmer Mobile": "",
      "Tracked Qty": grandTotalTracked,
      "Feed Company": "",
      Remark: `Untracked: ${Math.max(0, grandTotalSupply - grandTotalTracked)}`,
    });

    // Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    // 1. Auto-fit Column Widths (Jeno kono lekha kete na jay)
    const headers = Object.keys(exportRows[0]);
    const colWidths = headers.map((header) => {
      let maxLen = header.length;
      exportRows.forEach((row) => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : "";
        if (val.length > maxLen) {
          maxLen = val.length;
        }
      });
      return { wch: Math.max(maxLen + 5, 12) }; // Extra 5 characters padding
    });
    worksheet["!cols"] = colWidths;

    // 2. Row Heights (Header ebong data row-gulo ektu faka o sundor korar jonno)
    worksheet["!rows"] = exportRows.map((_, idx) => ({
      hpt: idx === 0 ? 26 : 20,
    }));
    worksheet["!rows"].unshift({ hpt: 28 }); // Header row height

    // 3. Apply Cell Borders, Colors & Alignment
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:L1");
    const totalRowIndex = range.e.r; // Last row index

    const borderStyle = {
      top: { style: "thin", color: { rgb: "CBD5E1" } },
      bottom: { style: "thin", color: { rgb: "CBD5E1" } },
      left: { style: "thin", color: { rgb: "CBD5E1" } },
      right: { style: "thin", color: { rgb: "CBD5E1" } },
    };

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellRef]) continue;

        const isHeader = R === 0;
        const isTotalRow = R === totalRowIndex;
        const isCenterCol = [0, 1, 5, 8, 10].includes(C); // Date, ID, Type, Mobile, Feed
        const isNumberCol = [4, 9].includes(C); // DOC Qty, Tracked Qty

        if (isHeader) {
          // Dark Emerald Header with White Bold Text
          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: "047857" } },
            font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: borderStyle,
          };
        } else if (isTotalRow) {
          // Bottom Total Row Styling
          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: "ECFDF5" } },
            font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "065F46" } },
            alignment: {
              horizontal: isNumberCol ? "right" : isCenterCol ? "center" : "left",
              vertical: "center",
            },
            border: {
              top: { style: "medium", color: { rgb: "059669" } },
              bottom: { style: "double", color: { rgb: "059669" } },
              left: { style: "thin", color: { rgb: "CBD5E1" } },
              right: { style: "thin", color: { rgb: "CBD5E1" } },
            },
          };
        } else {
          // Regular Data Rows (Zebra Striping + Clean Borders)
          const isEvenRow = R % 2 === 0;
          const isUntracked = worksheet[cellRef].v === "Untracked";

          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: isEvenRow ? "F8FAFC" : "FFFFFF" } },
            font: {
              name: "Calibri",
              sz: 10.5,
              bold: C === 1 || isNumberCol || isUntracked,
              color: { rgb: isUntracked ? "D97706" : "1E293B" },
            },
            alignment: {
              horizontal: isNumberCol ? "right" : isCenterCol ? "center" : "left",
              vertical: "center",
              wrapText: true,
            },
            border: borderStyle,
          };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DOC_Tracking");
    XLSX.writeFile(
      workbook,
      `DOC_Tracking_${selectedDate || "All_Dates"}.xlsx`
    );
  }

  // ==================================================
  // TRACKED REPORT POPUP CALCULATIONS
  // ==================================================

  const reportSupplies = supplies.filter((s) => {
    const matchFrom = !reportFromDate || s.h_date >= reportFromDate;
    const matchTo = !reportToDate || s.h_date <= reportToDate;
    const matchPcd = !reportPcdFilter || s.pcd === reportPcdFilter;
    return matchFrom && matchTo && matchPcd;
  });

  const reportTrackings = trackings.filter((t) => {
    const matchFrom = !reportFromDate || t.h_date >= reportFromDate;
    const matchTo = !reportToDate || t.h_date <= reportToDate;
    const matchPcd = !reportPcdFilter || t.pcd === reportPcdFilter;
    return matchFrom && matchTo && matchPcd;
  });

  const repTotalDoc = reportSupplies.reduce(
    (sum, s) => sum + (Number(s.qty) || 0),
    0
  );
  const repTotalTracked = reportTrackings.reduce(
    (sum, t) => sum + (Number(t.qty) || 0),
    0
  );
  const repTotalUntracked = Math.max(0, repTotalDoc - repTotalTracked);
  const repTrackedPct =
    repTotalDoc > 0 ? ((repTotalTracked / repTotalDoc) * 100).toFixed(1) : "0.0";
  const repUntrackedPct =
    repTotalDoc > 0
      ? ((repTotalUntracked / repTotalDoc) * 100).toFixed(1)
      : "0.0";

  // Feed Company Wise Breakdown
  const companyBreakdown = FEED_COMPANIES.map((comp) => {
    const compQty = reportTrackings
      .filter((t) => t.feed_company.toLowerCase() === comp.toLowerCase())
      .reduce((sum, t) => sum + (Number(t.qty) || 0), 0);

    const pctOfTracked =
      repTotalTracked > 0
        ? ((compQty / repTotalTracked) * 100).toFixed(1)
        : "0.0";
    const pctOfTotal =
      repTotalDoc > 0 ? ((compQty / repTotalDoc) * 100).toFixed(1) : "0.0";

    return {
      company: comp,
      qty: compQty,
      pctOfTracked,
      pctOfTotal,
    };
  });

  // DOC Type (PCD) Wise Breakdown
  const pcdBreakdown = allPcdTypes.map((pcd) => {
    const supQty = supplies
      .filter((s) => {
        const matchFrom = !reportFromDate || s.h_date >= reportFromDate;
        const matchTo = !reportToDate || s.h_date <= reportToDate;
        return matchFrom && matchTo && s.pcd === pcd;
      })
      .reduce((sum, s) => sum + (Number(s.qty) || 0), 0);

    const trkQty = trackings
      .filter((t) => {
        const matchFrom = !reportFromDate || t.h_date >= reportFromDate;
        const matchTo = !reportToDate || t.h_date <= reportToDate;
        return matchFrom && matchTo && t.pcd === pcd;
      })
      .reduce((sum, t) => sum + (Number(t.qty) || 0), 0);

    const untrkQty = Math.max(0, supQty - trkQty);
    const pct = supQty > 0 ? ((trkQty / supQty) * 100).toFixed(1) : "0.0";

    return { pcd, supQty, trkQty, untrkQty, pct };
  });

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      {/* ==================================================
          TOP BAR: TITLE & ACTION BUTTONS
      ================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">
            DOC Tracking
          </h1>
          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
            Date:{" "}
            <strong className="text-emerald-700">
              {selectedDate || "All Dates"}
            </strong>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canImportExcel && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-sm transition"
              >
                {importing ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaFileUpload />
                )}
                Import Excel
              </button>
            </>
          )}

          <button
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-sm transition"
          >
            <FaFileExcel />
            Export Excel
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-sm transition"
          >
            <FaChartPie />
            Tracked Report
          </button>
        </div>
      </div>

      {/* ==================================================
          ALERTS
      ================================================== */}
      {errorMsg && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* ==================================================
          TOP SUMMARY STATS & FILTERS BAR
      ================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm space-y-3">
        {/* Compact Stats Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3 text-center sm:text-left">
            <p className="text-[11px] sm:text-xs text-slate-500">Total DOC</p>
            <p className="text-base sm:text-xl font-bold text-slate-800">
              {totalSupplyQty.toLocaleString()}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 sm:p-3 text-center sm:text-left">
            <p className="text-[11px] sm:text-xs text-emerald-700">Tracked</p>
            <p className="text-base sm:text-xl font-bold text-emerald-700">
              {totalTrackedQty.toLocaleString()}{" "}
              <span className="text-xs font-semibold">({trackedPercent}%)</span>
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 sm:p-3 text-center sm:text-left">
            <p className="text-[11px] sm:text-xs text-amber-700">Untracked</p>
            <p className="text-base sm:text-xl font-bold text-amber-700">
              {totalUntrackedQty.toLocaleString()}{" "}
              <span className="text-xs font-semibold">
                ({untrackedPercent}%)
              </span>
            </p>
          </div>
        </div>

        {/* Filters Row: Date, PCD Filter, Agent Search */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              H.Date Filter
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs sm:text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option value="">All Dates</option>
              {allDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              PCD (DOC Type) Filter
            </label>
            <select
              value={pcdFilter}
              onChange={(e) => setPcdFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs sm:text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option value="">All PCD Types</option>
              {allPcdTypes.map((pcd) => (
                <option key={pcd} value={pcd}>
                  {pcd}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Search Agent / DOC.ID
            </label>
            <input
              type="text"
              placeholder="Search DOC.ID or Agent..."
              value={searchAgent}
              onChange={(e) => setSearchAgent(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* ==================================================
          AGENT-WISE CARDS & PCD-WISE TABLES
      ================================================== */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-12 text-center text-slate-500 text-sm">
          <FaSpinner className="animate-spin inline mr-2" />
          Loading DOC tracking data...
        </div>
      ) : visibleAgents.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-12 text-center px-4">
          <p className="text-slate-500 text-sm font-medium">
            No DOC supply records found for your assigned upazila agents.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Make sure agents are added in "DOC Agents" with matching DOC.ID and
            Excel file is imported.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleAgents.map((agent) => {
            const agentSupplies = filteredSupplies.filter(
              (s) => s.doc_id === agent.doc_id
            );

            // Group this agent's supplies by PCD (e.g., SH, AA)
            const agentPcds = Array.from(
              new Set(agentSupplies.map((s) => s.pcd))
            );

            return (
              <div
                key={agent.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* AGENT CARD HEADER */}
                <div className="bg-slate-800 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-bold text-xs">
                      DOC.ID: {agent.doc_id}
                    </span>
                    <div>
                      <h2 className="font-bold text-sm sm:text-base leading-tight">
                        {agent.agent_name}
                      </h2>
                      <p className="text-[11px] text-slate-300">
                        {agent.upazila}, {agent.district}
                        {agent.mobile ? ` • ${agent.mobile}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PCD-WISE SECTIONS INSIDE AGENT CARD */}
                <div className="p-3 sm:p-4 space-y-4 divide-y divide-slate-100">
                  {agentPcds.map((pcdType) => {
                    const pcdSupplyRows = agentSupplies.filter(
                      (s) => s.pcd === pcdType
                    );

                    const pcdTotalQty = pcdSupplyRows.reduce(
                      (sum, r) => sum + (Number(r.qty) || 0),
                      0
                    );

                    // Trackings for this Agent + PCD + Date filter
                    const pcdTrackRows = filteredTrackings.filter(
                      (t) => t.doc_id === agent.doc_id && t.pcd === pcdType
                    );

                    const pcdTrackedQty = pcdTrackRows.reduce(
                      (sum, r) => sum + (Number(r.qty) || 0),
                      0
                    );

                    const pcdUntrackedQty = Math.max(
                      0,
                      pcdTotalQty - pcdTrackedQty
                    );

                    const pcdTrackedPct =
                      pcdTotalQty > 0
                        ? ((pcdTrackedQty / pcdTotalQty) * 100).toFixed(1)
                        : "0.0";
                    const pcdUntrackedPct =
                      pcdTotalQty > 0
                        ? ((pcdUntrackedQty / pcdTotalQty) * 100).toFixed(1)
                        : "0.0";

                    const primaryDate =
                      pcdSupplyRows[0]?.h_date || selectedDate || todayStr;

                    return (
                      <div key={pcdType} className="pt-3 first:pt-0 space-y-3">
                        {/* PCD Badge & Add Tracking Button */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-xs">
                              DOC Type (PCD): {pcdType}
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              openAddTrackingModal({
                                doc_id: agent.doc_id,
                                agent_name: agent.agent_name,
                                pcd: pcdType,
                                h_date: primaryDate,
                                supply_id: pcdSupplyRows[0]?.id,
                                remainingQty: pcdUntrackedQty,
                              })
                            }
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition"
                          >
                            <FaPlus size={10} />
                            Add Tracking
                          </button>
                        </div>

                        {/* SUPPLY TABLE (H.Date, PCD, AG/B+, Qty, B.Qty) */}
                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                          <table className="min-w-full text-xs sm:text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold">
                                  H.Date
                                </th>
                                <th className="px-3 py-2 text-left font-semibold">
                                  PCD
                                </th>
                                <th className="px-3 py-2 text-left font-semibold">
                                  AG/B+
                                </th>
                                <th className="px-3 py-2 text-right font-semibold">
                                  Qty
                                </th>
                                <th className="px-3 py-2 text-right font-semibold">
                                  B.Qty
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {pcdSupplyRows.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50">
                                  <td className="px-3 py-2 font-medium text-slate-800">
                                    {row.h_date}
                                  </td>
                                  <td className="px-3 py-2 font-bold text-indigo-700">
                                    {row.pcd}
                                  </td>
                                  <td className="px-3 py-2 text-slate-600">
                                    {row.ag_b || "-"}
                                  </td>
                                  <td className="px-3 py-2 text-right font-bold text-slate-800">
                                    {Number(row.qty).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right text-slate-600">
                                    {Number(row.b_qty).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* TRACKED FARMERS LIST UNDER THIS PCD */}
                        {pcdTrackRows.length > 0 && (
                          <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-2.5 space-y-2">
                            <p className="text-[11px] font-bold text-emerald-800 uppercase">
                              Assigned Farmers ({pcdType})
                            </p>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs">
                                <thead className="border-b border-emerald-200 text-emerald-900">
                                  <tr>
                                    <th className="py-1.5 px-2 text-left">
                                      Farmer
                                    </th>
                                    <th className="py-1.5 px-2 text-left">
                                      Address
                                    </th>
                                    <th className="py-1.5 px-2 text-left">
                                      Mobile
                                    </th>
                                    <th className="py-1.5 px-2 text-right">
                                      DOC Qty
                                    </th>
                                    <th className="py-1.5 px-2 text-left">
                                      Feed Company
                                    </th>
                                    <th className="py-1.5 px-2 text-left">
                                      Remark
                                    </th>
                                    <th className="py-1.5 px-2 text-right"></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-100">
                                  {pcdTrackRows.map((tr) => (
                                    <tr key={tr.id}>
                                      <td className="py-1.5 px-2 font-semibold text-slate-800">
                                        {tr.farmer_name}
                                      </td>
                                      <td className="py-1.5 px-2 text-slate-600">
                                        {tr.address || "-"}
                                      </td>
                                      <td className="py-1.5 px-2 text-slate-600">
                                        {tr.mobile || "-"}
                                      </td>
                                      <td className="py-1.5 px-2 text-right font-bold text-emerald-700">
                                        {Number(tr.qty).toLocaleString()}
                                      </td>
                                      <td className="py-1.5 px-2">
                                        <span className="px-2 py-0.5 rounded bg-white border border-emerald-300 text-emerald-800 font-semibold">
                                          {tr.feed_company}
                                        </span>
                                      </td>
                                      <td className="py-1.5 px-2 text-slate-600">
                                        {tr.remark || "-"}
                                      </td>
                                      <td className="py-1.5 px-2 text-right">
                                        <button
                                          onClick={() =>
                                            handleDeleteTracking(tr.id)
                                          }
                                          className="text-red-500 hover:text-red-700 p-1"
                                          title="Remove"
                                        >
                                          <FaTrash size={11} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* COMPACT FOOTER SUMMARY FOR THIS PCD */}
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                          <span className="font-medium text-slate-700">
                            <strong>{pcdType}</strong> Total:{" "}
                            <strong>{pcdTotalQty.toLocaleString()}</strong>
                          </span>

                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-emerald-700 font-semibold">
                              Tracked: {pcdTrackedQty.toLocaleString()} (
                              {pcdTrackedPct}%)
                            </span>
                            <span className="text-amber-700 font-semibold">
                              Untracked: {pcdUntrackedQty.toLocaleString()} (
                              {pcdUntrackedPct}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================
          MODAL 1: ADD FARMER TRACKING
      ================================================== */}
      {isTrackModalOpen && activeTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Add DOC Tracking ({activeTarget.pcd})
                </h3>
                <p className="text-xs text-slate-500">
                  {activeTarget.agent_name} (ID: {activeTarget.doc_id}) •
                  Untracked: {activeTarget.remainingQty}
                </p>
              </div>
              <button
                onClick={() => setIsTrackModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleSaveTracking}
              className="p-5 space-y-3.5 overflow-y-auto"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Farmer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter farmer name"
                  value={trackForm.farmer_name}
                  onChange={(e) =>
                    setTrackForm({ ...trackForm, farmer_name: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="Village / Area"
                    value={trackForm.address}
                    onChange={(e) =>
                      setTrackForm({ ...trackForm, address: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mobile
                  </label>
                  <input
                    type="text"
                    placeholder="017XXXXXXXX"
                    value={trackForm.mobile}
                    onChange={(e) =>
                      setTrackForm({ ...trackForm, mobile: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    DOC Qty *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Qty"
                    value={trackForm.qty}
                    onChange={(e) =>
                      setTrackForm({ ...trackForm, qty: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Feed Company *
                  </label>
                  <select
                    value={trackForm.feed_company}
                    onChange={(e) =>
                      setTrackForm({
                        ...trackForm,
                        feed_company: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none bg-white focus:border-emerald-500"
                  >
                    {FEED_COMPANIES.map((fc) => (
                      <option key={fc} value={fc}>
                        {fc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Remark
                </label>
                <input
                  type="text"
                  placeholder="Optional note..."
                  value={trackForm.remark}
                  onChange={(e) =>
                    setTrackForm({ ...trackForm, remark: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTrackModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-600 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center justify-center gap-2"
                >
                  {submitting && <FaSpinner className="animate-spin" />}
                  Save Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL 2: TRACKED REPORT POPUP
      ================================================== */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Report Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-800 text-white">
              <div className="flex items-center gap-2">
                <FaChartPie className="text-amber-400" />
                <h3 className="text-base font-bold">DOC Tracked Report</h3>
              </div>
              <button
                onClick={() => setIsReportOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-700 flex items-center justify-center text-slate-300"
              >
                <FaTimes />
              </button>
            </div>

            {/* Report Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* Date Range & DOC Type Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={reportFromDate}
                    onChange={(e) => setReportFromDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={reportToDate}
                    onChange={(e) => setReportToDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    DOC Type (PCD)
                  </label>
                  <select
                    value={reportPcdFilter}
                    onChange={(e) => setReportPcdFilter(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm bg-white"
                  >
                    <option value="">All DOC Types</option>
                    {allPcdTypes.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Overall Totals */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500">Total DOC</p>
                  <p className="text-base sm:text-lg font-bold text-slate-800">
                    {repTotalDoc.toLocaleString()}
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-emerald-700">Total Tracked</p>
                  <p className="text-base sm:text-lg font-bold text-emerald-700">
                    {repTotalTracked.toLocaleString()} ({repTrackedPct}%)
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-amber-700">Untracked</p>
                  <p className="text-base sm:text-lg font-bold text-amber-700">
                    {repTotalUntracked.toLocaleString()} ({repUntrackedPct}%)
                  </p>
                </div>
              </div>

              {/* Section 1: Feed Company Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Feed Company Wise Tracked Report
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-3.5 py-2 text-left font-semibold">
                          Feed Company
                        </th>
                        <th className="px-3.5 py-2 text-right font-semibold">
                          Tracked Qty
                        </th>
                        <th className="px-3.5 py-2 text-right font-semibold">
                          % of Tracked
                        </th>
                        <th className="px-3.5 py-2 text-right font-semibold">
                          % of Total DOC
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {companyBreakdown.map((item) => (
                        <tr key={item.company} className="hover:bg-slate-50">
                          <td className="px-3.5 py-2 font-semibold text-slate-800">
                            {item.company}:
                          </td>
                          <td className="px-3.5 py-2 text-right font-bold text-emerald-700">
                            {item.qty.toLocaleString()}
                          </td>
                          <td className="px-3.5 py-2 text-right text-slate-600">
                            {item.pctOfTracked}%
                          </td>
                          <td className="px-3.5 py-2 text-right text-slate-500">
                            {item.pctOfTotal}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: DOC Type (PCD) Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  DOC Type (PCD) Wise Summary
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-3.5 py-2 text-left font-semibold">
                          DOC Type (PCD)
                        </th>
                        <th className="px-3.5 py-2 text-right font-semibold">
                          Total DOC
                        </th>
                        <th className="px-3.5 py-2 text-right font-semibold">
                          Tracked
                        </th>
                        <th className="px-3.5 py-2 text-right font-semibold">
                          Untracked
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pcdBreakdown.map((p) => (
                        <tr key={p.pcd} className="hover:bg-slate-50">
                          <td className="px-3.5 py-2 font-bold text-indigo-700">
                            {p.pcd}
                          </td>
                          <td className="px-3.5 py-2 text-right font-semibold">
                            {p.supQty.toLocaleString()}
                          </td>
                          <td className="px-3.5 py-2 text-right text-emerald-700 font-semibold">
                            {p.trkQty.toLocaleString()} ({p.pct}%)
                          </td>
                          <td className="px-3.5 py-2 text-right text-amber-700 font-semibold">
                            {p.untrkQty.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Report Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsReportOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs sm:text-sm font-medium"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}