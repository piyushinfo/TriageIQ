import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 30000,
});

export const triageAPI = {
  analyzeNote: (text: string, patientId?: string) =>
    API.post("/api/triage/analyze", { text, patient_id: patientId }),

  getAllCases: () =>
    API.get("/api/triage/cases"),

  getCase: (caseId: string) =>
    API.get(`/api/triage/cases/${caseId}`),

  transcribeAudio: (audioFile: File) => {
    const formData = new FormData();
    formData.append("file", audioFile);
    return API.post("/api/audio/transcribe", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateCase: (caseId: string, data: { status?: string; notes?: string }) =>
    API.patch(`/api/cases/${caseId}`, data),
};

export default API;
