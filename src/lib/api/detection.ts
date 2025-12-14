// Detection API for Glucoin AI
// API endpoint: https://glucoinai.mentorit.my.id/detection

export const DETECTION_API_BASE_URL = 'https://glucoinai.mentorit.my.id/detection';

// Types for questionnaire (non-diabetic screening)
export interface QuestionnaireNonDiabetes {
  penglihatan_buram: boolean;
  sering_bak: boolean;
  luka_lama_sembuh: boolean;
  kesemutan: boolean;
  obesitas: boolean;
  sering_lapar: boolean;
  berat_badan: number;
  tinggi_badan: number;
  riwayat_keluarga: boolean;
  tekanan_darah_tinggi: boolean;
  kolesterol_tinggi: boolean;
  frekuensi_olahraga: number; // 0=tidak pernah, 1=1-2x, 2=3-4x, 3=5+x seminggu
  pola_makan: number; // 0=tinggi gula/karbo, 1=cukup seimbang, 2=sehat
}

// Types for diabetic questionnaire
export interface QuestionnaireDiabetes {
  peningkatan_bak: boolean;
  kesemutan: boolean;
  perubahan_berat: number; // 0=stabil, 1=naik sedikit, 2=turun drastis, 3=naik drastis
  gula_darah_puasa: number; // mg/dL, 50-500
  rutin_hba1c: boolean;
  hasil_hba1c?: number; // %, 4-15
  tekanan_darah_sistolik: number; // mmHg, 80-250
  kondisi_kolesterol: number; // 0=normal, 1=sedikit tinggi, 2=tinggi
  konsumsi_obat: boolean;
  pernah_hipoglikemia: boolean;
  olahraga_rutin: boolean;
  pola_makan: number; // 0=tinggi gula, 1=terkontrol, 2=diet ketat
}

// Response types
export interface FullScreeningResult {
  success: boolean;
  
  // Tongue results
  tongue_valid: boolean;
  tongue_probability: number | null;
  tongue_message: string | null;
  
  // Nail results
  nail_valid: boolean;
  nail_probability: number | null;
  nail_message: string | null;
  
  // Image combined
  image_score: number | null;
  images_analyzed: number;
  
  // Questionnaire results
  questionnaire_score: number;
  
  // Final combined results (60% image + 40% questionnaire)
  final_score: number;
  risk_level: 'tidak' | 'rendah' | 'sedang' | 'tinggi';
  prediction: 'DIABETES' | 'NON_DIABETES';
  interpretation: string;
  recommendations: string[];
}

export interface ImageDetectionResult {
  success: boolean;
  is_valid_image: boolean;
  image_type: 'tongue' | 'nail' | null;
  validation_confidence: number | null;
  probability: number | null;
  prediction: 'DIABETES' | 'NON_DIABETES' | null;
  risk_level: 'tidak' | 'rendah' | 'sedang' | 'tinggi' | null;
  message: string;
}

export interface QuestionnaireResult {
  success: boolean;
  score: number;
  risk_level: 'tidak' | 'rendah' | 'sedang' | 'tinggi';
  interpretation: string;
  recommendations: string[];
}

// Health check
export async function checkDetectionHealth(): Promise<{ status: string; model_loaded: boolean }> {
  const response = await fetch(`${DETECTION_API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('Detection API is not available');
  }
  return response.json();
}

// Full screening with tongue + nail images + questionnaire
export async function fullScreening(
  tongueImage: File,
  nailImage: File,
  questionnaire: QuestionnaireNonDiabetes
): Promise<FullScreeningResult> {
  const formData = new FormData();
  
  // Add images
  formData.append('tongue_image', tongueImage);
  formData.append('nail_image', nailImage);
  
  // Add questionnaire fields
  formData.append('penglihatan_buram', String(questionnaire.penglihatan_buram));
  formData.append('sering_bak', String(questionnaire.sering_bak));
  formData.append('luka_lama_sembuh', String(questionnaire.luka_lama_sembuh));
  formData.append('kesemutan', String(questionnaire.kesemutan));
  formData.append('obesitas', String(questionnaire.obesitas));
  formData.append('sering_lapar', String(questionnaire.sering_lapar));
  formData.append('berat_badan', String(questionnaire.berat_badan));
  formData.append('tinggi_badan', String(questionnaire.tinggi_badan));
  formData.append('riwayat_keluarga', String(questionnaire.riwayat_keluarga));
  formData.append('tekanan_darah_tinggi', String(questionnaire.tekanan_darah_tinggi));
  formData.append('kolesterol_tinggi', String(questionnaire.kolesterol_tinggi));
  formData.append('frekuensi_olahraga', String(questionnaire.frekuensi_olahraga));
  formData.append('pola_makan', String(questionnaire.pola_makan));

  const response = await fetch(`${DETECTION_API_BASE_URL}/detect/full-screening`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to process screening');
  }

  return response.json();
}

// Single image detection
export async function detectFromImage(
  file: File,
  imageType: 'tongue' | 'nail'
): Promise<ImageDetectionResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${DETECTION_API_BASE_URL}/detect/image?image_type=${imageType}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to detect from image');
  }

  return response.json();
}

// Questionnaire for non-diabetic screening
export async function questionnaireNonDiabetic(
  data: QuestionnaireNonDiabetes
): Promise<QuestionnaireResult> {
  const response = await fetch(`${DETECTION_API_BASE_URL}/detect/questionnaire/non-diabetic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to process questionnaire');
  }

  return response.json();
}

// Questionnaire for diabetic monitoring
export async function questionnaireDiabetic(
  data: QuestionnaireDiabetes
): Promise<QuestionnaireResult> {
  const response = await fetch(`${DETECTION_API_BASE_URL}/detect/questionnaire/diabetic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to process questionnaire');
  }

  return response.json();
}

// Helper function to map form answers to API questionnaire format
export function mapAnswersToQuestionnaire(answers: Record<string, string>): QuestionnaireNonDiabetes {
  // Map physical activity to frekuensi_olahraga
  const activityMap: Record<string, number> = {
    'rarely': 0,      // Jarang / 1-2x seminggu -> tidak pernah atau jarang
    'moderate': 2,    // 3-5x seminggu -> 3-4x
    'often': 3,       // setiap hari -> 5+x
  };

  // Map sweet consumption to pola_makan (inverse - more sweet = less healthy)
  const sweetMap: Record<string, number> = {
    'rarely': 2,       // Jarang -> sehat
    'sometimes': 1,    // Kadang-kadang -> cukup seimbang
    'often': 0,        // Sering -> tinggi gula
    'very_often': 0,   // Sangat sering -> tinggi gula
  };

  // Parse weight and height
  const weight = parseFloat(answers['weight']) || 70;
  const height = parseFloat(answers['height']) || 170;

  // Calculate BMI for obesity check
  const bmi = weight / Math.pow(height / 100, 2);
  const isObese = bmi >= 25;

  return {
    penglihatan_buram: false, // Not asked in current questionnaire, default false
    sering_bak: false, // Not asked in current questionnaire, default false
    luka_lama_sembuh: false, // Not asked in current questionnaire, default false
    kesemutan: false, // Not asked in current questionnaire, default false
    obesitas: isObese,
    sering_lapar: answers['sweet_consumption'] === 'very_often' || answers['sweet_consumption'] === 'often',
    berat_badan: weight,
    tinggi_badan: height,
    riwayat_keluarga: answers['family_diabetes'] === 'yes',
    tekanan_darah_tinggi: answers['hypertension'] === 'yes',
    kolesterol_tinggi: false, // Not asked in current questionnaire, default false
    frekuensi_olahraga: activityMap[answers['physical_activity']] ?? 1,
    pola_makan: sweetMap[answers['sweet_consumption']] ?? 1,
  };
}

// Risk level color mapping
export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'tinggi':
      return '#EF4444'; // Red
    case 'sedang':
      return '#F59E0B'; // Orange/Amber
    case 'rendah':
      return '#22C55E'; // Green
    case 'tidak':
      return '#10B981'; // Emerald
    default:
      return '#64748B'; // Gray
  }
}

// Risk level label in Indonesian
export function getRiskLevelLabel(riskLevel: string): string {
  switch (riskLevel) {
    case 'tinggi':
      return 'Risiko Tinggi';
    case 'sedang':
      return 'Risiko Sedang';
    case 'rendah':
      return 'Risiko Rendah';
    case 'tidak':
      return 'Risiko Sangat Rendah';
    default:
      return 'Tidak Diketahui';
  }
}
