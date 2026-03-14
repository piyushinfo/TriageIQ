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

  transcribeAudio: async (file: File | Blob) => {
    const formData = new FormData();
    formData.append("file", file, "audio.webm");
    return API.post<{ transcript: string }>("/api/audio/transcribe", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateCase: (caseId: string, data: { status?: string; notes?: string }) =>
    API.patch(`/api/cases/${caseId}`, data),

  analyzeImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return API.post<{ text: string }>("/api/vision/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default API;
