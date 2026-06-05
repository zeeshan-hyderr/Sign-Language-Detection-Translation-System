/**
 * Check backend health endpoint.
 * Returns true if backend responds with 200 and body.status === 'healthy', false otherwise.
 * Never throws; catches errors and returns false.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return false;
    const j = await res.json();
    return j && j.status === 'healthy';
  } catch (e) {
    return false;
  }
}

/**
 * Upload a video blob and extract landmarks.
 * POST /api/extract with FormData ('video' field, filename 'sign.webm').
 * Returns { landmarks: [...], frame_count: N }.
 * Throws on non-200 responses.
 */
export async function extractLandmarks(videoBlob) {
  const fd = new FormData();
  fd.append('video', videoBlob, 'sign.webm');

  const res = await fetch('/api/extract', {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) {
    let text = await res.text().catch(() => '');
    throw new Error(`Extract failed: ${res.status} ${text}`);
  }

  return await res.json();
}

/**
 * Send landmarks to backend for prediction.
 * Expects `landmarks` shaped (60, 180, 3) — caller is responsible for shaping.
 * POST /api/predict with JSON { landmarks, top_n }
 * Returns { predictions: [{gloss, score}, ...] }.
 * Throws on non-200 responses.
 */
export async function predictGlosses(landmarks, topN = 5) {
  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ landmarks, top_n: topN }),
  });

  if (!res.ok) {
    let text = await res.text().catch(() => '');
    throw new Error(`Predict failed: ${res.status} ${text}`);
  }

  return await res.json();
}

/**
 * Translate a list of glosses to the target language.
 * POST /api/translate with JSON { glosses, target_language }
 * Returns { text: string, language: string }.
 * Throws on non-200 responses.
 */
export async function translateGlosses(glosses, targetLanguage = 'English') {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ glosses, target_language: targetLanguage }),
  });

  if (!res.ok) {
    let text = await res.text().catch(() => '');
    throw new Error(`Translate failed: ${res.status} ${text}`);
  }

  return await res.json();
}
